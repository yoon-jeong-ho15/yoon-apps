import { useState, FormEvent } from "react";
import { insertMessage } from "../../lib/data/message";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const messageId = await insertMessage(
        currentUserId,
        message.trim(),
        recipientId  // Pass recipient if provided (for owner sending to specific user)
      );

      if (messageId) {
        setMessage("");
        // Trigger refresh if callback provided
        if (onMessageSent) {
          onMessageSent();
        }
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-300 p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
