import React, { createContext, useContext, useState, useEffect } from "react";
import { enterChatroom, fetchUnreadCountsByUserId } from "../lib/data/chatroom";

type ChatroomContextType = {
  selectedChatroom: string | null;
  setSelectedChatroom: (id: string | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isShowingAddChatroom: boolean;
  setIsShowingAddChatroom: (isShowingAddChatroom: boolean) => void;
  unreadCounts: Map<string, number>;
  setUnreadCounts: React.Dispatch<React.SetStateAction<Map<string, number>>>;
};

const ChatroomContext = createContext<ChatroomContextType | null>(null);

export const useChatroom = () => {
  const context = useContext(ChatroomContext);
  if (!context) {
    throw new Error("useChatroom must be used within a ChatroomProvider");
  }
  return context;
};

export default function ChatroomProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [selectedChatroom, setSelectedChatroom] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShowingAddChatroom, setIsShowingAddChatroom] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(
    new Map()
  );

  // Fetch unread counts periodically
  useEffect(() => {
    const loadUnreadCounts = async () => {
      if (!userId) {
        console.log("userId is missing, skipping API call.");
        return;
      }
      const data = await fetchUnreadCountsByUserId(userId);
      if (data) {
        const countsMap = new Map();
        data.forEach((item: { chatroom_id: string; unread_count: number }) => {
          countsMap.set(item.chatroom_id.toString(), item.unread_count);
        });
        setUnreadCounts(countsMap);
      }
    };

    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  // Mark chatroom as read when selected
  useEffect(() => {
    if (selectedChatroom && userId) {
      enterChatroom(selectedChatroom, userId);
      setUnreadCounts((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectedChatroom, 0);
        return newMap;
      });
    }
  }, [selectedChatroom, userId]);

  return (
    <ChatroomContext.Provider
      value={{
        selectedChatroom,
        setSelectedChatroom,
        isSubmitting,
        setIsSubmitting,
        isShowingAddChatroom,
        setIsShowingAddChatroom,
        unreadCounts,
        setUnreadCounts,
      }}
    >
      {children}
    </ChatroomContext.Provider>
  );
}
