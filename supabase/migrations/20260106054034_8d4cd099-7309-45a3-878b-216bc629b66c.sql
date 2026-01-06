-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update system status" ON public.system_status;

-- Create restrictive policy - only service role can update system status
-- This is appropriate since system status should only be updated by backend services
CREATE POLICY "Service role can update system status"
ON public.system_status
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);