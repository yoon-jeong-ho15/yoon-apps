import { MESSAGE_MAX_LENGTH, UI_TEXT } from "../../lib/constants";
import type { FormEvent, KeyboardEvent } from "react";

interface MessageFormProps {
  message: string;
  setMessage: (message: string) => void;
  isSubmitting: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleSubmit: (e: FormEvent) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function MessageForm({
  message,
  setMessage,
  isSubmitting,
  textareaRef,
  handleSubmit,
  handleKeyDown,
}: MessageFormProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 p-4 bg-gray-50 w-full"
    >
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={UI_TEXT.MESSAGE.PLACEHOLDER}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={1}
          className="
          flex-1 border border-gray-300 rounded-xl
          px-4 py-3
          focus:outline-none focus:ring-2
          focus:ring-blue-400 focus:border-transparent
          resize-none overflow-y-auto
          scrollbar-on-scroll
          "
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
