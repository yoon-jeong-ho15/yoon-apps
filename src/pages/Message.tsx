import { useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import MessageList, { type MessageListRef } from "../components/message/MessageList";
import MessageForm from "../components/message/MessageForm";

export default function MessagePage() {
  const { user } = useAuth();
  const messageListRef = useRef<MessageListRef>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Please log in to view messages.</div>
      </div>
    );
  }

  // Refresh messages after sending
  const handleMessageSent = () => {
    // Trigger a reload of messages without full page reload
    messageListRef.current?.loadMessages();
  };

  return (
    <div className="flex mt-5 mx-8 flex-grow">
      <div
        className="w-full flex rounded shadow p-1 container
          bg-gradient-to-r from-blue-400 to-indigo-400"
      >
        <div
          className="w-full h-full bg-white rounded container
            flex flex-col justify-between shadow"
        >
          <MessageList
            ref={messageListRef}
            currentUserId={user.id}
            currentUsername={user.username}
          />
          <MessageForm
            currentUserId={user.id}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  );
}
