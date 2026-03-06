-- Add profile_pic column to users table
ALTER TABLE users ADD profile_pic VARCHAR(500) NULL;

-- Create profile_pictures table for storing avatar data
CREATE TABLE IF NOT EXISTS profile_pictures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    file_data LONGBLOB NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_profile_pictures_user_id ON profile_pictures(user_id);
