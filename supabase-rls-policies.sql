-- Row Level Security Policies for Message Table with recipient_id
-- Execute these in your Supabase SQL Editor

-- First, enable RLS on the message table
ALTER TABLE message ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (run this if updating)
-- DROP POLICY IF EXISTS "Users can read their messages" ON message;
-- DROP POLICY IF EXISTS "Users can insert their own messages" ON message;
-- DROP POLICY IF EXISTS "Only owner can update messages" ON message;
-- DROP POLICY IF EXISTS "Only owner can delete messages" ON message;

-- ============================================================================
-- SETUP: Set owner user ID in database settings
-- Replace 'YOUR_OWNER_USER_ID_HERE' with your actual user UUID
-- ============================================================================
ALTER DATABASE postgres SET app.settings.owner_user_id = 'YOUR_OWNER_USER_ID_HERE';
SELECT pg_reload_conf();

-- ============================================================================
-- Policy 1: SELECT - Users can read messages where they are author or recipient
-- ============================================================================
-- Regular users: can see messages where they sent or received
-- Owner: can see all messages (because they are either author or recipient of all messages)
CREATE POLICY "Users can read their messages"
ON message
FOR SELECT
TO authenticated
USING (
  -- User is the author of this message
  author_id = auth.uid()::text
  OR
  -- User is the recipient of this message
  recipient_id = auth.uid()::text
);

-- ============================================================================
-- Policy 2: INSERT - Users can send messages
-- ============================================================================
-- Regular users: can only send messages to owner (recipient must be owner)
-- Owner: can send messages to anyone
CREATE POLICY "Users can insert their own messages"
ON message
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be the author
  author_id = auth.uid()::text
  AND
  (
    -- If user is owner, they can send to anyone
    auth.uid()::text = current_setting('app.settings.owner_user_id', true)
    OR
    -- If user is NOT owner, they can only send to owner
    (
      auth.uid()::text != current_setting('app.settings.owner_user_id', true)
      AND
      recipient_id = current_setting('app.settings.owner_user_id', true)
    )
  )
);

-- ============================================================================
-- Policy 3: UPDATE - Only owner can update messages (optional)
-- ============================================================================
CREATE POLICY "Only owner can update messages"
ON message
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = current_setting('app.settings.owner_user_id', true)
)
WITH CHECK (
  auth.uid()::text = current_setting('app.settings.owner_user_id', true)
);

-- ============================================================================
-- Policy 4: DELETE - Only owner can delete messages (optional)
-- ============================================================================
CREATE POLICY "Only owner can delete messages"
ON message
FOR DELETE
TO authenticated
USING (
  auth.uid()::text = current_setting('app.settings.owner_user_id', true)
);

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to test your policies after setup
-- ============================================================================

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'message';

-- List all policies on message table
-- SELECT * FROM pg_policies WHERE tablename = 'message';

-- Test as a regular user (replace YOUR_USER_ID with actual user ID)
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub = 'YOUR_USER_ID';
-- SELECT * FROM message; -- Should only see messages where you are author or recipient

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Replace 'YOUR_OWNER_USER_ID_HERE' with your actual owner user UUID
-- 2. Make sure to also set VITE_OWNER_USER_ID in your .env file to the same value
-- 3. RLS policies work at the database level, so they apply to all queries
-- 4. The owner can see all messages because they are always either author or recipient
-- 5. Regular users can only see their conversation with the owner
