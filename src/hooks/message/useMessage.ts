import { useState, useEffect, useCallback } from "react";
import type { Message } from "../../types/message";
import { fetchMessagesByUserId } from "../../lib/data/message";
import { MESSAGE_POLLING_INTERVAL } from "../../lib/constants";
import { useMessageForm } from "./useMessageForm";
import { useMessageList } from "./useMessageList";

interface UseMessageOptions {
  currentUserId: string;
  recipientId?: string; // Optional - for admin sending to specific user
}

export function useMessage({ currentUserId, recipientId }: UseMessageOptions) {
  // Message list state
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch messages function
  const loadMessages = useCallback(async () => {
    const fetchedMessages = await fetchMessagesByUserId(currentUserId);
    setMessages(fetchedMessages);
  }, [currentUserId]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Polling every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, MESSAGE_POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [loadMessages]);

  // Use message form hook
  const messageForm = useMessageForm({
    currentUserId,
    recipientId,
    onMessageSent: loadMessages,
  });

  // Use message list hook
  const messageList = useMessageList(messages);

  return {
    messageListProps: {
      messages,
      messageDivRef: messageList.messageDivRef,
    },
    messageFormProps: {
      message: messageForm.message,
      setMessage: messageForm.setMessage,
      isSubmitting: messageForm.isSubmitting,
      textareaRef: messageForm.textareaRef,
      handleSubmit: messageForm.handleSubmit,
      handleKeyDown: messageForm.handleKeyDown,
    },
    loadMessages,
  };
}
