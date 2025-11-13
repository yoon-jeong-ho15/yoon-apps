import { useRef, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import MessageList, { type MessageListRef } from "../components/message/MessageList";
import MessageForm from "../components/message/MessageForm";
import { isOwner, fetchMessagesByUserId } from "../lib/data/message";
import { fetchUsersByGroup } from "../lib/data/user";
import { FRIEND_GROUP } from "../lib/constants";
import type { Message, User } from "../lib/types";

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

// Owner view component
function OwnerMessageView({ user }: { user: { id: string; username: string } }) {
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

  const handleUserClick = async (selectedUser: User) => {
    setSelectedUser(selectedUser);
    await loadMessagesForUser(selectedUser.id);
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
    <div className="flex mt-5 mx-8 flex-grow">
      <div className="w-full flex rounded shadow p-1 bg-gradient-to-r from-blue-400 to-indigo-400">
        <div className="w-full h-full bg-white rounded flex shadow">
          {/* Users List - Left Side */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <h2 className="text-xl font-bold">전체 사용자 목록</h2>
              <p className="text-sm mt-1">총 {users.length}명의 사용자</p>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUserClick(u)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === u.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.profilePic}
                      alt={u.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {u.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        메시지 {messageCount.get(u.id) || 0}개
                      </div>
                    </div>
                    {selectedUser?.id === u.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages - Right Side */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                <div className="flex-1 overflow-y-auto pt-2">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>메시지가 없습니다.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.author.id === user.id;
                      const formattedDate = new Date(
                        msg.created_at
                      ).toLocaleString();

                      return (
                        <div
                          key={msg.id}
                          className={`px-5 pb-6 flex ${
                            isMe ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div
                            className={`flex h-fit w-fit rounded-2xl py-1 pl-2 pr-5 max-w-[720px] bg-gradient-to-r shadow-lg items-center ${
                              isMe
                                ? "from-indigo-200 to-blue-200"
                                : "from-zinc-200 to-stone-200"
                            }`}
                          >
                            <div className="flex flex-col justify-center items-center">
                              <img
                                src={msg.author.profile_pic}
                                alt={msg.author.username}
                                className="w-12 h-12 rounded-full bg-white"
                              />
                              <span className="text-xs mt-1">
                                {msg.author.username}
                              </span>
                            </div>
                            <div className="ml-6 whitespace-normal break-anywhere text-shadow-sm">
                              <p className="text-gray-800">{msg.message}</p>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
        </div>
      </div>
    </div>
  );
}
