
-- Create a table for storing user tunes
CREATE TABLE IF NOT EXISTS public.user_tunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tune_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'training',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tune_id)
);

-- Create a table for storing generated headshots
CREATE TABLE IF NOT EXISTS public.user_headshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt_id TEXT,
  style_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_tunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_headshots ENABLE ROW LEVEL SECURITY;

-- Create policies for user_tunes
CREATE POLICY "Users can view their own tunes" 
  ON public.user_tunes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tunes" 
  ON public.user_tunes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_headshots
CREATE POLICY "Users can view their own headshots" 
  ON public.user_headshots 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own headshots" 
  ON public.user_headshots 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
