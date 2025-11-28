import { useRef } from "react";
import { useAuth } from "../contexts/useAuth";
import type { User } from "../lib/types";
import MessageList, {
  type MessageListRef,
} from "../components/message/MessageList";
import UserProfile from "../components/message/UserProfile";
import UserInfo from "../components/message/UserInfo";
import MessageForm from "../components/message/MessageForm";
import GradientContainer from "../components/common/GradientContainer";
import GrayContainer from "../components/common/GrayContainer";

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

  const userForDisplay: User = {
    id: user.id,
    username: user.username,
    profilePic: user.profile_pic,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };

  // Refresh messages after sending
  const handleMessageSent = () => {
    // Trigger a reload of messages without full page reload
    messageListRef.current?.loadMessages();
  };

  return (
    <div className="flex mt-5 mx-8 flex-grow space-x-4 h-full">
      <GrayContainer className="flex flex-col p-2">
        <UserProfile user={userForDisplay} />
        <UserInfo user={userForDisplay} />
      </GrayContainer>

      <GradientContainer
        outerClassName="flex-1 h-full"
        className="flex flex-col justify-between h-full"
      >
        <MessageList ref={messageListRef} currentUserId={user.id} />
        <MessageForm
          currentUserId={user.id}
          onMessageSent={handleMessageSent}
        />
      </GradientContainer>
    </div>
  );
}
