import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { insertMessage } from "../../lib/data/message";
import {
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  ERROR_MESSAGES,
  UI_TEXT,
} from "../../lib/constants";

interface MessageFormProps {
  currentUserId: string;
  recipientId?: string; // Optional - will be auto-determined for regular users
  onMessageSent?: () => void;
}

export default function MessageForm({
  currentUserId,
  recipientId,
  onMessageSent
}: MessageFormProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [message]);

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
        recipientId  // Pass recipient if provided (for owner sending to specific user)
      );

      if (messageId) {
        setMessage("");
        // Trigger refresh if callback provided
        if (onMessageSent) {
          onMessageSent();
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

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={UI_TEXT.MESSAGE.PLACEHOLDER}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={1}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none overflow-y-auto"
          style={{ maxHeight: "160px" }}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isSubmitting ? UI_TEXT.MESSAGE.SENDING : UI_TEXT.MESSAGE.SEND}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
