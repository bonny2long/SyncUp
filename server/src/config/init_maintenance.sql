-- Create platform_settings table for storing app settings like maintenance mode
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default maintenance mode setting (disabled)
INSERT INTO platform_settings (setting_key, setting_value) 
VALUES ('maintenance_mode', 'false')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- Insert default maintenance message
INSERT INTO platform_settings (setting_key, setting_value) 
VALUES ('maintenance_message', 'We are doing some work on the app. Please check back soon.')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
