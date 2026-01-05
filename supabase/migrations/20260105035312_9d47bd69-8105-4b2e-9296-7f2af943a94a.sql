-- First, delete existing problematic data (no user_id to associate)
DELETE FROM public.energy_readings;

-- Add user_id column with foreign key to auth.users
ALTER TABLE public.energy_readings 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;

-- Create index for performance
CREATE INDEX idx_energy_readings_user_id ON public.energy_readings(user_id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view energy readings" ON public.energy_readings;
DROP POLICY IF EXISTS "Authenticated users can insert energy readings" ON public.energy_readings;

-- Create secure RLS policies that scope data to the authenticated user
CREATE POLICY "Users can view their own energy readings" 
ON public.energy_readings 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy readings" 
ON public.energy_readings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy readings" 
ON public.energy_readings 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);