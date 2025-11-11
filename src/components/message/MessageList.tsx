import { useEffect, useState, useRef } from "react";
import type { Message } from "../../lib/types";
import { fetchMessagesByUserId, fetchAllMessages, isOwner } from "../../lib/data/message";
import { NoProfile } from "../common/Icon";

interface MessageListProps {
  currentUserId: string;
  currentUsername: string;
}

export default function MessageList({ currentUserId, currentUsername }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageDivRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages function
  const loadMessages = async () => {
    let fetchedMessages: Message[];

    if (isOwner(currentUserId)) {
      // Owner sees all messages
      fetchedMessages = await fetchAllMessages();
    } else {
      // Regular user sees only their conversation with owner
      fetchedMessages = await fetchMessagesByUserId(currentUserId);
    }

    setMessages(fetchedMessages);
  };

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [currentUserId]);

  // Polling every 3 minutes (180000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageDivRef.current) {
      messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4" ref={messageDivRef}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isMe={msg.author_id === currentUserId}
            currentUsername={currentUsername}
          />
        ))
      )}
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  isMe: boolean;
  currentUsername: string;
}

function MessageItem({ message, isMe }: MessageItemProps) {
  const formattedDate = new Date(message.created_at).toLocaleString();

  return (
    <div className={`mb-4 flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md rounded-lg p-3 shadow ${
          isMe ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        <div className="flex items-center mb-2">
          {message.profile_pic ? (
            <img
              src={message.profile_pic}
              alt={message.username}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <div className="mr-2">
              <NoProfile size="sm" />
            </div>
          )}
          <span className="font-semibold text-sm">
            {message.username || "Unknown User"}
          </span>
        </div>
        <p className="text-gray-800 whitespace-pre-wrap break-words">
          {message.message}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">{formattedDate}</span>
      </div>
    </div>
  );
}
