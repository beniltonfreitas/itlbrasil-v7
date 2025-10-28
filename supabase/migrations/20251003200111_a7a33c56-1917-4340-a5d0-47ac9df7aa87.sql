-- Add missing content_type column to media_library table
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS content_type text;