-- Drop existing insecure policies
DROP POLICY IF EXISTS "Anyone can insert energy readings" ON public.energy_readings;
DROP POLICY IF EXISTS "Anyone can update system status" ON public.system_status;

-- Create secure policies requiring authentication
CREATE POLICY "Authenticated users can insert energy readings"
ON public.energy_readings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update system status"
ON public.system_status
FOR UPDATE
TO authenticated
USING (true);