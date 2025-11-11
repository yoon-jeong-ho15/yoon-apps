import type { Chatroom, ChatroomMap, ChatroomUser, User } from "../../lib/types";
import { NoProfile, MessageIcon } from "../common/Icon";
import { useChatroom } from "../../contexts/ChatroomContext";
import AddChatroom from "./AddChatroom";
import { AnimatePresence } from "motion/react";

export default function ChatList({
  chatrooms,
  friends,
}: {
  chatrooms: ChatroomMap | null;
  friends?: User[];
}) {
  const chatroomContext = useChatroom()!;
  const {
    setSelectedChatroom,
    setIsShowingAddChatroom,
    isShowingAddChatroom,
    unreadCounts,
  } = chatroomContext;

  return (
    <div className="bg-gray-100 rounded-xl w-[25%] ml-3 relative">
      <AnimatePresence>
        {isShowingAddChatroom && <AddChatroom friends={friends} />}
      </AnimatePresence>
      <div className="h-fit flex justify-between px-3 pt-2">
        <button
          onClick={() => {
            setSelectedChatroom(null);
          }}
          className="w-fit rounded-xl border-1 text-md text-center px-2 hover:bg-gray-200"
        >
          메인
        </button>
        <button
          className="rounded-xl border-1 text-center px-2 hover:bg-gray-200"
          onClick={() => {
            if (isShowingAddChatroom) {
              setIsShowingAddChatroom(false);
            } else {
              setIsShowingAddChatroom(true);
            }
          }}
        >
          +
        </button>
      </div>
      <nav className="p-4 flex flex-col overflow-y-scroll">
        {[...(chatrooms?.entries() || [])].map(([chatroomId, chatroom]) => {
          const currentUnreadCount = unreadCounts.get(chatroom.id) || 0;
          return (
            <Chat
              key={chatroomId}
              chatroom={chatroom}
              users={chatroom.users}
              setSelectedChatroom={setSelectedChatroom ?? (() => {})}
              unreadCount={currentUnreadCount}
            />
          );
        })}
      </nav>
    </div>
  );
}

export function Chat({
  chatroom,
  setSelectedChatroom,
  users,
  unreadCount = 0,
}: {
  chatroom: Chatroom;
  setSelectedChatroom: (id: string | null) => void;
  users: ChatroomUser[];
  unreadCount?: number;
}) {
  return (
    <div
      onClick={() => {
        setSelectedChatroom(chatroom.id);
      }}
      className="flex w-full items-center hover:bg-zinc-200 relative p-2 rounded-lg cursor-pointer mb-1"
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center flex-1">
          {users.length == 1 ? (
            <>
              <NoProfile size="md" />
              <span className="ml-2">{users[0].username}</span>
            </>
          ) : (
            <>
              <MessageIcon size="md" />
              <span className="ml-2">
                {chatroom.title
                  ? chatroom.title
                  : users.map((user) => user.username).join(", ")}
              </span>
            </>
          )}
          <div className="hidden unread-count">{unreadCount}</div>
          <div className="hidden chatroom-id">{chatroom.id}</div>
          <div className="hidden chatroom-title">{chatroom.title}</div>
        </div>

        {unreadCount > 0 && (
          <div className="flex-shrink-0 ml-2">
            <div className="bg-red-500 text-white rounded-full px-2 py-1 text-xs min-w-[20px] text-center font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
