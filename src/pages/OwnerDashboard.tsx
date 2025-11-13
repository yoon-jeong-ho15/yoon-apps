import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isOwner, fetchMessagesByUserId } from "../lib/data/message";
import { fetchUsersByGroup } from "../lib/data/user";
import { FRIEND_GROUP } from "../lib/constants";
import type { Message, User } from "../lib/types";
import { Navigate } from "react-router-dom";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is owner
  if (!user || !isOwner(user.id)) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const allUsers = await fetchUsersByGroup(FRIEND_GROUP.ALL, user!.username);
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
    const userMessages = await fetchMessagesByUserId(selectedUser.id);
    setMessages(userMessages);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <div className="w-full flex rounded shadow p-1 bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="w-full h-full bg-white rounded flex shadow">
          {/* Users List - Left Side */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.profilePic}
                      alt={selectedUser.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                      <h3 className="text-lg font-bold">
                        {selectedUser.username}
                      </h3>
                      <p className="text-sm">
                        {messages.length}개의 메시지
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      메시지가 없습니다.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isSentBySelectedUser =
                        msg.author.id === selectedUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isSentBySelectedUser
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isSentBySelectedUser
                                ? "bg-gray-200 text-gray-900"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={msg.author.profile_pic}
                                alt={msg.author.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-xs font-semibold">
                                {msg.author.username}
                              </span>
                              {!isSentBySelectedUser && (
                                <span className="text-xs opacity-75">
                                  → {msg.recipient.username}
                                </span>
                              )}
                            </div>
                            <p className="break-words">{msg.message}</p>
                            <div
                              className={`text-xs mt-1 ${
                                isSentBySelectedUser
                                  ? "text-gray-600"
                                  : "text-blue-100"
                              }`}
                            >
                              {formatDate(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
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
