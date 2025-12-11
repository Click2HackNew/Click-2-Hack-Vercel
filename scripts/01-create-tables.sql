-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT,
  os_version TEXT,
  phone_number TEXT,
  battery_level INTEGER,
  last_seen TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create commands table
CREATE TABLE IF NOT EXISTS commands (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  command_type TEXT NOT NULL,
  command_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create sms_logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  message_body TEXT NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  custom_data TEXT NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create global_settings table
CREATE TABLE IF NOT EXISTS global_settings (
  setting_key TEXT PRIMARY KEY UNIQUE NOT NULL,
  setting_value TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_commands_device_id ON commands(device_id);
CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_device_id ON sms_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_device_id ON form_submissions(device_id);
