import { useRef, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import MessageList, {
  type MessageListRef,
} from "../components/message/MessageList";
import MessageForm from "../components/message/MessageForm";
import MessageItem from "../components/message/MessageItem";
import UserListItem from "../components/message/UserListItem";
import { isOwner, fetchMessagesByUserId } from "../lib/data/message";
import { fetchUsersByGroup } from "../lib/data/user";
import { FRIEND_GROUP } from "../lib/constants";
import type { Message, User } from "../lib/types";
import GradientContainer from "../components/common/GradientContainer";

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

  // Check if user is owner
  if (isOwner(user.id)) {
    return <OwnerMessageView user={user} />;
  }

  // Refresh messages after sending
  const handleMessageSent = () => {
    // Trigger a reload of messages without full page reload
    messageListRef.current?.loadMessages();
  };

  return (
    <div className="flex mt-5 mx-8 flex-grow space-x-4">
      <div
        className="w-1/3 border-gray-400 border bg-gray-100
          rounded-2xl font-[500] shadow-lg"
      >
        <h1>메시지를 남겨주세요</h1>
        <div className="border">
          <div>character animation</div>
        </div>
      </div>
      <GradientContainer className="container">
        <MessageList ref={messageListRef} currentUserId={user.id} />
        <MessageForm
          currentUserId={user.id}
          onMessageSent={handleMessageSent}
        />
      </GradientContainer>
    </div>
  );
}

// Owner view component
function OwnerMessageView({
  user,
}: {
  user: { id: string; username: string };
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const allUsers = await fetchUsersByGroup(FRIEND_GROUP.ALL, user.username);
    setUsers(allUsers);

    // Load message count for each user
    const counts = new Map<string, number>();
    for (const u of allUsers) {
      const userMessages = await fetchMessagesByUserId(u.id);
      counts.set(u.id, userMessages.length);
    }
    setMessageCount(counts);
    setIsLoading(false);
  };

  const handleUserClick = async (newSelectedUser: User) => {
    // Toggle: if clicking the same user, deselect them
    if (selectedUser?.id === newSelectedUser.id) {
      setSelectedUser(null);
      setMessages([]);
    } else {
      setSelectedUser(newSelectedUser);
      await loadMessagesForUser(newSelectedUser.id);
    }
  };

  const loadMessagesForUser = async (userId: string) => {
    const userMessages = await fetchMessagesByUserId(userId);
    setMessages(userMessages);
  };

  const handleMessageSent = async () => {
    if (selectedUser) {
      // Reload messages for the selected user
      await loadMessagesForUser(selectedUser.id);
      // Update message count
      const counts = new Map(messageCount);
      counts.set(selectedUser.id, messages.length + 1);
      setMessageCount(counts);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex mt-5 mx-8 flex-grow space-x-4">
      {/* Users List - Left Side */}
      <div
        className="w-1/3 border-gray-400 border bg-gray-100
          rounded-2xl font-[500] shadow-lg"
      >
        <div className="p-4 border-b border-gray-400">
          <h2 className="text-xl font-bold">전체 사용자 목록</h2>
          <p className="text-sm mt-1">총 {users.length}명의 사용자</p>
        </div>
        <div className="divide-y divide-gray-200">
          {users.map((u) => (
            <UserListItem
              key={u.id}
              user={u}
              messageCount={messageCount.get(u.id) || 0}
              isSelected={selectedUser?.id === u.id}
              onClick={handleUserClick}
            />
          ))}
        </div>
      </div>

      {/* Messages - Right Side */}
      <GradientContainer innerClassName="flex">
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="flex-1 overflow-y-auto pt-2 scrollbar-on-scroll">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>메시지가 없습니다.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      isMe={msg.author.id === user.id}
                    />
                  ))
                )}
              </div>
              <MessageForm
                currentUserId={user.id}
                recipientId={selectedUser.id}
                onMessageSent={handleMessageSent}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                <p className="text-lg">사용자를 선택하여 메시지를 확인하세요</p>
              </div>
            </div>
          )}
        </div>
      </GradientContainer>
    </div>
  );
}
