import {
  BellIcon,
  UserCircleIcon,
  HomeIcon,
  PowerIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import { useHeaderStore } from "../stores/headerStore";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import { motion } from "motion/react";
import { isAdmin } from "../utils/user";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadNotifications(user?.id);

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return <EmptyHeader />;

  return (
    <div className="flex w-full justify-between items-center p-2">
      <div className="flex flex-1 overflow-hidden mx-2">
        <HeaderAnimation />
      </div>

      <div className="flex w-fit h-full border border-gray-500 bg-gray-100 items-center rounded-xl gap-2 px-2">
        <button
          onClick={() => navigate("/")}
          className="flex p-2 hover:bg-gray-200 rounded-full transition-colors space-x-1"
        >
          <HomeIcon className="size-5" />
          <span className="text-sm">홈</span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex p-2 hover:bg-gray-200 rounded-full transition-colors space-x-1"
          aria-label="Profile"
        >
          <UserCircleIcon className="size-5" />
          <span className="text-sm">계정</span>
        </button>
        {isAdmin(user.id) && (
          <button
            onClick={() => navigate("/admin")}
            className="flex p-2 hover:bg-gray-200 rounded-full transition-colors space-x-1"
          >
            <WrenchScrewdriverIcon className="size-5" />
            <span className="text-sm">관리자</span>
          </button>
        )}
        <div className="h-full w-[1px] bg-gray-400"></div>
        <button
          onClick={() => navigate("/notifications")}
          className="flex p-2 hover:bg-gray-200 rounded-full transition-colors space-x-1"
          aria-label="Notifications"
        >
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="relative p-2 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Logout"
        >
          <PowerIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

function HeaderAnimation() {
  const { displayText, key } = useHeaderStore();

  return (
    <div className="flex w-full h-8 items-center justify-center">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.3 }}
      >
        {displayText}
      </motion.div>
    </div>
  );
}

function EmptyHeader() {
  return (
    <div className="flex w-full justify-between items-center p-2">
      <div className="flex flex-1 overflow-hidden mx-2">
        <HeaderAnimation />
      </div>

      <div className="flex w-fit h-full border border-gray-500 bg-gray-100 items-center rounded-xl gap-2 px-2 opacity-50">
        <button className="flex p-2 rounded-full transition-colors space-x-1">
          <HomeIcon className="size-5" />
          <span className="text-sm">홈</span>
        </button>
        <button
          className="flex p-2 rounded-full transition-colors space-x-1"
          aria-label="Profile"
        >
          <UserCircleIcon className="size-5" />
          <span className="text-sm">프로필</span>
        </button>

        <button
          className="flex p-2 rounded-full transition-colors space-x-1"
          aria-label="Notifications"
        >
          <BellIcon className="size-5" />
        </button>
        <button
          className="relative p-2 rounded-full transition-colors"
          aria-label="Logout"
        >
          <PowerIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
