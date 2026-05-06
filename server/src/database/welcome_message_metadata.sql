-- Structured metadata for commencement welcome messages.
-- Existing welcome messages remain valid; new messages store these fields
-- so the HQ feed does not need to parse member names/cycles from text.

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS introduced_user_id INT NULL,
  ADD COLUMN IF NOT EXISTS introduction_cycle VARCHAR(10) NULL,
  ADD COLUMN IF NOT EXISTS commencement_id VARCHAR(64) NULL;

CREATE INDEX IF NOT EXISTS idx_messages_introduced_user
  ON messages (introduced_user_id);

CREATE INDEX IF NOT EXISTS idx_messages_commencement
  ON messages (commencement_id);

