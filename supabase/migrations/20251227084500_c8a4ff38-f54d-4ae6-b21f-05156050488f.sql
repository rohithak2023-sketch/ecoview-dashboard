-- Create energy_readings table for real-time data
CREATE TABLE public.energy_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumption DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
CREATE POLICY "Anyone can view energy readings" 
ON public.energy_readings 
FOR SELECT 
USING (true);

-- Allow public insert for demo purposes
CREATE POLICY "Anyone can insert energy readings" 
ON public.energy_readings 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for energy_readings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_readings;

-- Create system_status table for live status updates
CREATE TABLE public.system_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational',
  last_update TIMESTAMPTZ NOT NULL DEFAULT now(),
  uptime_percentage DECIMAL(5,2) DEFAULT 99.9,
  data_points INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Anyone can view system status" 
ON public.system_status 
FOR SELECT 
USING (true);

-- Allow public updates
CREATE POLICY "Anyone can update system status" 
ON public.system_status 
FOR UPDATE 
USING (true);

-- Enable realtime for system_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_status;

-- Insert initial system status data
INSERT INTO public.system_status (component_name, status, uptime_percentage, data_points) VALUES
('Data Collector', 'operational', 99.9, 15420),
('Analytics Engine', 'operational', 99.8, 8750),
('API Gateway', 'operational', 100.0, 45230),
('Database', 'operational', 99.95, 125000);