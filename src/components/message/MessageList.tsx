import {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { Message } from "../../lib/types";
import {
  fetchMessagesByUserId,
  fetchAllMessages,
  isOwner,
} from "../../lib/data/message";
import { MESSAGE_POLLING_INTERVAL, UI_TEXT } from "../../lib/constants";
import MessageItem from "./MessageItem";

interface MessageListProps {
  currentUserId: string;
}

export interface MessageListRef {
  loadMessages: () => Promise<void>;
}

const MessageList = forwardRef<MessageListRef, MessageListProps>(
  ({ currentUserId }, ref) => {
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
            />
          ))
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
