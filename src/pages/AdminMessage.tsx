import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import MessageForm from "../components/message/MessageForm";

import { isAdmin, fetchMessagesByUserId } from "../lib/data/message";
import { fetchUsersByGroup } from "../lib/data/user";
import type { User } from "../types/user";
import type { Message } from "../types/message";
import GradientContainer from "../components/common/GradientContainer";

export default function AdminMessagePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is admin
  if (!user || !isAdmin(user.id)) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const allUsers = await fetchUsersByGroup(user!.username);
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
  return <div>admin message page</div>;
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
      <GradientContainer>
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
