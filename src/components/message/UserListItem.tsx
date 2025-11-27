import type { User } from "../../lib/types";

interface UserListItemProps {
  user: User;
  messageCount: number;
  isSelected: boolean;
  onClick: (user: User) => void;
}

export default function UserListItem({
  user,
  messageCount,
  isSelected,
  onClick,
}: UserListItemProps) {
  return (
    <button
      onClick={() => onClick(user)}
      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-100" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={user.profilePic}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{user.username}</div>
          <div className="text-sm text-gray-500">메시지 {messageCount}개</div>
        </div>
        {isSelected && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
      </div>
    </button>
  );
}
