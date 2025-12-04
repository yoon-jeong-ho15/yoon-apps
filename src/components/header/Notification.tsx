import { BellIcon } from "@heroicons/react/24/outline";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../contexts/useAuth";
import { useModal } from "../../stores/modalStore";

export default function NotificationButton() {
  const { user } = useAuth();
  const { unreadCount } = useNotification(user?.id);
  const { toggleShow } = useModal("notification");

  if (!user) return null;

  return (
    <div className="flex w-fit h-full border border-gray-500 bg-gray-100 items-center rounded-xl px-2 relative">
      <button
        onClick={toggleShow}
        className="flex hover:bg-gray-200 rounded-full transition-colors pr-2"
        aria-label="Notifications"
      >
        <BellIcon className="size-5" />

        <span className="relative flex">
          {unreadCount > 0 && (
            <span className="absolute animate-ping size-2 rounded-full bg-red-400 opacity-75"></span>
          )}
          <span
            className={`absolute size-2 rounded-full bg-gray-400 ${
              unreadCount > 0 ? "bg-red-500" : "bg-gray-400"
            }`}
          ></span>
        </span>
      </button>
    </div>
  );
}
