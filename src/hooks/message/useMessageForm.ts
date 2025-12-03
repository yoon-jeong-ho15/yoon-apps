import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { insertMessage } from "../../lib/data/message";
import { ERROR_MESSAGES } from "../../lib/constants";
import { validateMessage } from "../../utils/message/validate";

interface UseMessageFormOptions {
  currentUserId: string;
  recipientId?: string;
  onMessageSent?: () => void | Promise<void>;
}

export function useMessageForm({
  currentUserId,
  recipientId,
  onMessageSent,
}: UseMessageFormOptions) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    if (isSubmitting) return;
    validateMessage(trimmedMessage);

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
        if (onMessageSent) {
          await onMessageSent();
        }
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
    message,
    setMessage,
    isSubmitting,
    textareaRef,
    handleSubmit,
    handleKeyDown,
  };
}
