import { useEffect, useState, useRef, useCallback } from "react";
import { useChatroom } from "../../contexts/ChatroomContext";
import type { User, ChatMessage } from "../../lib/types";
import { NoProfile } from "../common/Icon";
import { supabase } from "../../lib/supabase";
import { updateReadStatusByMessageId } from "../../lib/data/chat";
import { updateNotificationReadAtByMessageId } from "../../lib/data/notification";
import MessageBoxWelcome from "../common/MessageBoxWelcome";
import { fetchChatsByChatroomId } from "../../lib/data/chat";

async function markSingleMessageAsRead(messageId: string, userId: string) {
  const [chatError, notificationError] = await Promise.all([
    updateReadStatusByMessageId(messageId, userId),
    updateNotificationReadAtByMessageId(messageId, userId),
  ]);

  if (chatError) {
    console.error("Error marking message as read", chatError);
  }
  if (notificationError) {
    console.error("Error marking notification as read", chatError);
  }
}

export default function MessageBox({ user }: { user: User }) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[] | null>(null);
  const messageDivRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const chatroomContext = useChatroom()!;
  const { setIsSubmitting, selectedChatroom } = chatroomContext;

  // Intersection Observer setup
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageId = entry.target.getAttribute("data-message-id");
          if (messageId && entry.isIntersecting) {
            const message = chatMessages?.find((m) => m.id === messageId);
            if (message && message.username !== user.username) {
              markSingleMessageAsRead(messageId, user.id);
            }
          }
        });
      },
      {
        threshold: 0.7,
        rootMargin: "0px",
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [user.id, chatMessages, user.username]);

  const setMessageRef = useCallback(
    (messageId: string, element: HTMLDivElement | null) => {
      if (element) {
        messageRefs.current.set(messageId, element);
        if (observerRef.current) {
          observerRef.current.observe(element);
        }
      } else {
        const existingElement = messageRefs.current.get(messageId);
        if (existingElement && observerRef.current) {
          observerRef.current.unobserve(existingElement);
        }
        messageRefs.current.delete(messageId);
      }
    },
    []
  );

  const loadPrevChats = useCallback(async () => {
    if (selectedChatroom) {
      const previousChats = await fetchChatsByChatroomId(selectedChatroom);
      setChatMessages(previousChats);
    }
  }, [selectedChatroom]);

  useEffect(() => {
    if (messageDivRef.current) {
      messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!selectedChatroom) return;

    loadPrevChats();

    const channel = supabase.channel(`ch${selectedChatroom}`);
    channel.on("broadcast", { event: "new-message" }, (data) => {
      const message: ChatMessage = data.payload;
      setChatMessages((prev) => [...(prev ?? []), message]);

      if (message.username === user.username) {
        setIsSubmitting(false);
      }
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatroom, user.username, user.id, loadPrevChats, setIsSubmitting]);

  if (!selectedChatroom) return <MessageBoxWelcome />;

  return (
    <div className="grow overflow-y-scroll pt-2" ref={messageDivRef}>
      <input type="hidden" value={selectedChatroom} />
      {chatMessages?.map((chatMessage) => (
        <div
          key={chatMessage.id}
          ref={(el) => setMessageRef(chatMessage.id, el)}
          data-message-id={chatMessage.id}
        >
          <Message {...chatMessage} user={user} />
        </div>
      ))}
    </div>
  );
}

export function Message({
  id,
  username,
  message,
  created_at,
  user_id,
  profile_pic,
  recipients_count,
  unread_count,
  user,
}: ChatMessage & { user: User }) {
  const isMe = username === user.username;

  return (
    <div className={`px-5 pb-6 flex ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-fit w-fit rounded-2xl py-1 pl-2 pr-5 max-w-180 bg-linear-to-r
          shadow-lg items-center
          ${
            isMe ? "from-indigo-200 to-blue-200" : "from-zinc-200 to-stone-200"
          }`}
      >
        <div className="hidden">{created_at}</div>
        <div className="hidden">{id}</div>
        <div className="hidden">{user_id}</div>
        <div className="hidden">{recipients_count}</div>
        <div className="hidden">{unread_count}</div>
        <div className="flex flex-col justify-center items-center">
          {profile_pic ? (
            <div className="size-12 bg-white">{profile_pic}</div>
          ) : (
            <NoProfile size="md" />
          )}
          <span className="text-xs">{username}</span>
        </div>
        <div className="ml-6 whitespace-normal wrap-anywhere text-shadow-sm">
          {message}
        </div>
      </div>
    </div>
  );
}
