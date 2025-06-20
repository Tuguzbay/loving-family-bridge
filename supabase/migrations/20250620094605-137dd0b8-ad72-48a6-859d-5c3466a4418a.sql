
-- Create a table to store parent-child conversation assessments
CREATE TABLE public.parent_child_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_responses JSONB NOT NULL, -- Store parent's responses as JSON
  child_responses JSONB NOT NULL, -- Store child's responses as JSON
  ai_analysis JSONB, -- Store AI analysis results
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id) -- One assessment per parent-child pair
);

-- Enable RLS
ALTER TABLE public.parent_child_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies for parent_child_assessments
CREATE POLICY "Family members can view assessments in their family" 
  ON public.parent_child_assessments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm 
      WHERE fm.family_id = parent_child_assessments.family_id 
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert assessments for their children" 
  ON public.parent_child_assessments 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = parent_id 
    AND EXISTS (
      SELECT 1 FROM public.family_members fm 
      WHERE fm.family_id = parent_child_assessments.family_id 
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their own assessments" 
  ON public.parent_child_assessments 
  FOR UPDATE 
  USING (auth.uid() = parent_id);
