import type { Message } from "../../lib/types";
import { NoProfile } from "../common/Icon";
import { UI_TEXT } from "../../lib/constants";

interface MessageItemProps {
  message: Message;
  isMe: boolean;
}

export default function MessageItem({ message, isMe }: MessageItemProps) {
  const formattedDate = new Date(message.created_at).toLocaleString();

  return (
    <div className={`px-5 pb-6 flex ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-fit w-fit rounded-2xl py-1 pl-2 pr-5 max-w-[720px] bg-gradient-to-r
          shadow-lg items-center
          ${
            isMe ? "from-indigo-200 to-blue-200" : "from-zinc-200 to-stone-200"
          }`}
      >
        <div className="flex flex-col justify-center items-center">
          {message.author.profile_pic ? (
            <img
              src={message.author.profile_pic}
              alt={message.author.username}
              className="w-12 h-12 rounded-full bg-white"
            />
          ) : (
            <NoProfile size="md" />
          )}
          <span className="text-xs mt-1">
            {message.author.username || UI_TEXT.AUTH.UNKNOWN_USER}
          </span>
        </div>
        <div className="ml-6 whitespace-normal break-anywhere text-shadow-sm">
          <p className="text-gray-800">{message.message}</p>
          <span className="text-xs text-gray-500 mt-1 block">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
