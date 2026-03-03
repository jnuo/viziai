-- User Preferences Migration
-- Migration: user_preferences
--
-- Add locale, timezone, and theme preferences to users table
-- These persist user settings across devices (issue #35)

ALTER TABLE users
ADD COLUMN locale TEXT DEFAULT 'tr',
ADD COLUMN timezone TEXT DEFAULT 'Europe/Istanbul',
ADD COLUMN theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system'));
