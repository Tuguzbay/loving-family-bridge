
-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('parent', 'child');

-- Create enum for conversation status
CREATE TYPE public.conversation_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create profiles table to extend auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  user_type public.user_type NOT NULL,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create families table to link parent and child accounts
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_code TEXT NOT NULL UNIQUE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_members table for the many-to-many relationship
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Create conversations table for guided discussions
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.conversation_status NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  is_joint BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for conversation messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'user', -- 'user', 'ai'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create insights table for AI-generated family insights
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'communication', 'activities', 'conflict_resolution', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for families
CREATE POLICY "Family members can view their family" 
  ON public.families FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_id = families.id AND user_id = auth.uid()
  ));

CREATE POLICY "Parents can create families" 
  ON public.families FOR INSERT 
  WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for family_members
CREATE POLICY "Family members can view family membership" 
  ON public.family_members FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.family_id = family_members.family_id AND fm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join families" 
  ON public.family_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Family members can view family conversations" 
  ON public.conversations FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_id = conversations.family_id AND user_id = auth.uid()
  ));

CREATE POLICY "Family members can create conversations" 
  ON public.conversations FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_id = conversations.family_id AND user_id = auth.uid()
  ));

CREATE POLICY "Family members can update conversations" 
  ON public.conversations FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_id = conversations.family_id AND user_id = auth.uid()
  ));

-- RLS Policies for messages
CREATE POLICY "Family members can view conversation messages" 
  ON public.messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.family_members fm ON c.family_id = fm.family_id
    WHERE c.id = messages.conversation_id AND fm.user_id = auth.uid()
  ));

CREATE POLICY "Users can send messages to their family conversations" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.family_members fm ON c.family_id = fm.family_id
      WHERE c.id = messages.conversation_id AND fm.user_id = auth.uid()
    )
  );

-- RLS Policies for insights
CREATE POLICY "Family members can view family insights" 
  ON public.insights FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_id = insights.family_id AND user_id = auth.uid()
  ));

CREATE POLICY "System can create insights" 
  ON public.insights FOR INSERT 
  WITH CHECK (true); -- This will be handled by edge functions

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, age)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((new.raw_user_meta_data ->> 'user_type')::public.user_type, 'parent'),
    COALESCE((new.raw_user_meta_data ->> 'age')::integer, null)
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate unique family codes
CREATE OR REPLACE FUNCTION public.generate_family_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := 'FAM-' || TO_CHAR(EXTRACT(YEAR FROM NOW()), 'YYYY') || '-' || 
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.families WHERE family_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;
