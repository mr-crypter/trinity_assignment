CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (char_length(text) <= 280),
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure updated_at updates on modification
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON ideas;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON ideas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Index on upvotes + created_at for sorting/popular queries
CREATE INDEX IF NOT EXISTS idx_ideas_upvotes_created_at ON ideas (upvotes DESC, created_at DESC);



