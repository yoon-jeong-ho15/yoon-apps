import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { User, ChatroomMap } from "../lib/types";
import ChatList from "../components/chat/ChatList";
import ChatroomProvider from "../contexts/ChatroomContext";
import { fetchChatrooms } from "../lib/data/chatroom";
import { fetchUsersByGroup } from "../lib/data/user";
import MessageBox from "../components/chat/MessageBox";
import MessageForm from "../components/chat/MessageForm";

export default function ChatPage() {
  const { user } = useAuth();
  const [chatrooms, setChatrooms] = useState<ChatroomMap | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const [chatroomsData, friendsData] = await Promise.all([
          fetchChatrooms(user.username),
          fetchUsersByGroup(user.friend_group, user.username),
        ]);

        setChatrooms(chatroomsData);
        setFriends(friendsData || []);
        setIsLoading(false);
      };

      loadData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로그인이 필요합니다.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  const userForDisplay: User = {
    id: user.id,
    username: user.username,
    from: parseInt(user.from),
    profilePic: user.profile_pic,
    friendGroup: user.friend_group,
  };

  return (
    <ChatroomProvider userId={user.id}>
      <div className="flex mt-5 mx-8 flex-grow">
        <div className="w-9/12 flex rounded shadow p-1 container p-1 bg-gradient-to-r from-blue-400 to-indigo-400">
          <div className="w-full h-full bg-white rounded container flex flex-col justify-between shadow">
            <MessageBox user={userForDisplay} />
            <MessageForm user={userForDisplay} />
          </div>
        </div>
        <ChatList chatrooms={chatrooms} friends={friends} />
      </div>
    </ChatroomProvider>
  );
}
