import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import type { Message } from "../../lib/types";
import {
  fetchMessagesByUserId,
  fetchAllMessages,
  isOwner,
} from "../../lib/data/message";
import { NoProfile } from "../common/Icon";
import { MESSAGE_POLLING_INTERVAL, UI_TEXT } from "../../lib/constants";

interface MessageListProps {
  currentUserId: string;
  currentUsername: string;
}

export interface MessageListRef {
  loadMessages: () => Promise<void>;
}

const MessageList = forwardRef<MessageListRef, MessageListProps>(
  ({ currentUserId, currentUsername }, ref) => {
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

    // Expose loadMessages through ref
    useImperativeHandle(ref, () => ({
      loadMessages,
    }));

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [currentUserId]);

  // Polling every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, MESSAGE_POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageDivRef.current) {
      messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="grow overflow-y-scroll pt-2" ref={messageDivRef}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>{UI_TEXT.MESSAGE.NO_MESSAGES}</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isMe={msg.author.id === currentUserId}
            currentUsername={currentUsername}
          />
        ))
      )}
    </div>
  );
});

MessageList.displayName = "MessageList";

interface MessageItemProps {
  message: Message;
  isMe: boolean;
  currentUsername: string;
}

function MessageItem({ message, isMe }: MessageItemProps) {
  const formattedDate = new Date(message.created_at).toLocaleString();

  return (
    <div className={`px-5 pb-6 flex ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-fit w-fit rounded-2xl py-1 pl-2 pr-5 max-w-[720px] bg-gradient-to-r
          shadow-lg items-center
          ${
            isMe ? "from-indigo-200 to-blue-200" : "from-zinc-200 to-stone-200"
          }`}
      >
        <div className="flex flex-col justify-center items-center">
          {message.author.profile_pic ? (
            <img
              src={message.author.profile_pic}
              alt={message.author.username}
              className="w-12 h-12 rounded-full bg-white"
            />
          ) : (
            <NoProfile size="md" />
          )}
          <span className="text-xs mt-1">{message.author.username || UI_TEXT.AUTH.UNKNOWN_USER}</span>
        </div>
        <div className="ml-6 whitespace-normal break-anywhere text-shadow-sm">
          <p className="text-gray-800">{message.message}</p>
          <span className="text-xs text-gray-500 mt-1 block">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MessageList;
