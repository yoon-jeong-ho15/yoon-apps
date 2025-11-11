import { useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import MessageList from "../components/message/MessageList";
import MessageForm from "../components/message/MessageForm";

export default function MessagePage() {
  const { user } = useAuth();
  const messageListRef = useRef<{ loadMessages: () => void }>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Please log in to view messages.</div>
      </div>
    );
  }

  // Refresh messages after sending
  const handleMessageSent = () => {
    // Trigger a reload of messages
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto p-4">
          <div className="h-full bg-white rounded-lg shadow-lg flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-t-lg">
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-sm opacity-90">Send and receive messages</p>
            </div>
            <MessageList
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
    </div>
  );
}
