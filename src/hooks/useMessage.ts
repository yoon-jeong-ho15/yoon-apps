import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { Message } from "../types/message";
import {
  fetchMessagesByUserId,
  fetchAllMessages,
  isAdmin,
  insertMessage,
} from "../lib/data/message";
import {
  MESSAGE_POLLING_INTERVAL,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  ERROR_MESSAGES,
} from "../lib/constants";

interface UseMessageOptions {
  currentUserId: string;
  recipientId?: string; // Optional - for admin sending to specific user
}

export function useMessage({ currentUserId, recipientId }: UseMessageOptions) {
  // Message list state
  const [messages, setMessages] = useState<Message[]>([]);
  const messageDivRef = useRef<HTMLDivElement>(null);

  // Message form state
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch messages function
  const loadMessages = useCallback(async () => {
    let fetchedMessages: Message[];

    if (isAdmin(currentUserId)) {
      // Admin sees all messages
      fetchedMessages = await fetchAllMessages();
    } else {
      // Regular user sees only their conversation with admin
      fetchedMessages = await fetchMessagesByUserId(currentUserId);
    }

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageDivRef.current) {
      messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [message]);

  // Handle message submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    // Validate message
    if (!trimmedMessage || isSubmitting) {
      return;
    }

    if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
      alert(ERROR_MESSAGES.MESSAGE.MESSAGE_REQUIRED);
      return;
    }

    if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      alert(ERROR_MESSAGES.MESSAGE.MESSAGE_TOO_LONG);
      return;
    }

    setIsSubmitting(true);

    try {
      const messageId = await insertMessage(
        currentUserId,
        trimmedMessage,
        recipientId
      );

      if (messageId) {
        setMessage("");
        // Trigger refresh after sending
        await loadMessages();
      } else {
        alert(ERROR_MESSAGES.MESSAGE.SEND_FAILED);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert(ERROR_MESSAGES.MESSAGE.SEND_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key - Submit on Enter, new line on Shift+Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return {
    // Message list
    messages,
    messageDivRef,
    loadMessages,
    // Message form
    message,
    setMessage,
    isSubmitting,
    textareaRef,
    handleSubmit,
    handleKeyDown,
  };
}