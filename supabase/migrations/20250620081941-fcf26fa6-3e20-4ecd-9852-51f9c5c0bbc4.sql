
-- Create table to store conversation responses
CREATE TABLE public.conversation_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('short', 'long')),
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track conversation completion status
CREATE TABLE public.conversation_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_questions INTEGER NOT NULL DEFAULT 13,
  UNIQUE(user_id, family_id)
);

-- Enable RLS on both tables
ALTER TABLE public.conversation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_responses
CREATE POLICY "Users can view their own responses" 
  ON public.conversation_responses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" 
  ON public.conversation_responses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" 
  ON public.conversation_responses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for conversation_completions
CREATE POLICY "Users can view their own completions" 
  ON public.conversation_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" 
  ON public.conversation_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Family members can see completions within their family
CREATE POLICY "Family members can view family completions" 
  ON public.conversation_completions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm 
      WHERE fm.family_id = conversation_completions.family_id 
      AND fm.user_id = auth.uid()
    )
  );
