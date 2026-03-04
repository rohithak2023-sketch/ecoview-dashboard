-- Create home_devices table for tracking real home appliances
CREATE TABLE public.home_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  device_type text NOT NULL DEFAULT 'other',
  wattage numeric NOT NULL DEFAULT 0,
  hours_per_day numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_charging boolean NOT NULL DEFAULT false,
  icon_type text DEFAULT 'plug',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON public.home_devices
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON public.home_devices
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices" ON public.home_devices
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON public.home_devices
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create device_readings table for per-device energy tracking
CREATE TABLE public.device_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id uuid NOT NULL REFERENCES public.home_devices(id) ON DELETE CASCADE,
  consumption numeric NOT NULL DEFAULT 0,
  cost numeric DEFAULT NULL,
  duration_minutes numeric NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own device readings" ON public.device_readings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device readings" ON public.device_readings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own device readings" ON public.device_readings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for device_readings and home_devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.home_devices;

-- Fix security: restrict system_status to authenticated users only
DROP POLICY IF EXISTS "Anyone can view system status" ON public.system_status;
CREATE POLICY "Authenticated users can view system status" ON public.system_status
  FOR SELECT TO authenticated USING (true);