import { UI_TEXT } from "../../lib/constants";
import MessageItem from "./MessageItem";
import type { Message } from "../../types/message";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  messageDivRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageList({
  messages,
  currentUserId,
  messageDivRef,
}: MessageListProps) {
  return (
    <div className="grow overflow-y-scroll pt-2 w-full" ref={messageDivRef}>
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
