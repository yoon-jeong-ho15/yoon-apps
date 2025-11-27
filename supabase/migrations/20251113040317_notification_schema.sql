-- ============================================
-- Notification Table Schema for Supabase
-- ============================================
-- This file contains the SQL definition for the notification table
-- Execute this in your Supabase SQL Editor to create the table

-- Create notification table
CREATE TABLE IF NOT EXISTS notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  related_user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  related_message_id bigint REFERENCES message(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notification(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON notification(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notification(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification(user_id, is_read);

-- Add comment to table
COMMENT ON TABLE notification IS 'Stores user notifications for various events in the application';

-- Add comments to columns
COMMENT ON COLUMN notification.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN notification.user_id IS 'The user who receives this notification';
COMMENT ON COLUMN notification.type IS 'Type of notification: new_message, message_reply, friend_request, etc.';
COMMENT ON COLUMN notification.title IS 'Short title of the notification';
COMMENT ON COLUMN notification.content IS 'Detailed content or description of the notification';
COMMENT ON COLUMN notification.related_user_id IS 'Reference to a user related to this notification (e.g., who sent the message)';
COMMENT ON COLUMN notification.related_message_id IS 'Reference to a message if this notification is message-related';
COMMENT ON COLUMN notification.is_read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notification.created_at IS 'When the notification was created';
COMMENT ON COLUMN notification.read_at IS 'When the notification was marked as read';

-- Enable Row Level Security (RLS)
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notification
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notification
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: System can insert notifications for any user
CREATE POLICY "Authenticated users can insert notifications"
  ON notification
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notification
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Utility Functions for Notifications
-- ============================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_content TEXT DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_related_message_id bigint DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notification (user_id, type, title, content, related_user_id, related_message_id)
  VALUES (p_user_id, p_type, p_title, p_content, p_related_user_id, p_related_message_id)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE notification
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id;

  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notification
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notification
  WHERE user_id = p_user_id AND is_read = FALSE;

  RETURN v_count;
END;
$$;

-- ============================================
-- Optional: Trigger to create notifications on new messages
-- ============================================
-- This trigger automatically creates a notification when a new message is inserted

CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_username VARCHAR(255);
BEGIN
  -- Get the username of the message author
  SELECT username INTO v_author_username
  FROM "user"
  WHERE id = NEW.author_id;

  -- Create notification for the recipient (if recipient exists)
  IF NEW.recipient_id IS NOT NULL THEN
    PERFORM create_notification(
      NEW.recipient_id,
      'new_message',
      'New message from ' || v_author_username,
      LEFT(NEW.message, 100), -- First 100 characters of the message
      NEW.author_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on message table
DROP TRIGGER IF EXISTS trigger_create_message_notification ON message;
CREATE TRIGGER trigger_create_message_notification
  AFTER INSERT ON message
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Uncomment to insert sample notifications

/*
-- Insert sample notification
INSERT INTO notification (user_id, type, title, content, is_read)
VALUES (
  'your-user-id-here',
  'new_message',
  'New message from John',
  'Hey, how are you doing?',
  FALSE
);
*/
