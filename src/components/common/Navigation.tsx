import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "motion/react";
import {
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "../../lib/data/notification";
import { NOTIFICATION_POLLING_INTERVAL } from "../../lib/constants";

const tabs = [
  { title: "프로필", href: "/profile", icon: UserCircleIcon },
  { title: "메시지", href: "/message", icon: ChatBubbleLeftRightIcon },
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll for updates
    const interval = setInterval(
      fetchUnreadCount,
      NOTIFICATION_POLLING_INTERVAL
    );

    return () => clearInterval(interval);
  }, [user?.id]);

  if (!user || location.pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  const selectedTab = tabs.find((tab) => tab.href === location.pathname);

  return (
    <nav className="flex h-12 mt-3 mx-6 justify-between">
      <div className="flex w-6/12 items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          Hello Friends
        </Link>
      </div>
      <div
        className="w-6/12 flex justify-around text-xl
          border-gray-400 border-1 bg-gray-100
          rounded-2xl font-[500] text-shadow-xs/10
          shadow-lg font-mono"
      >
        <div className="flex flex-grow h-full items-center justify-around text-2xl">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.title}
                onClick={() => navigate(item.href)}
                animate={{
                  backgroundColor:
                    item === selectedTab ? "#000" : "transparent",
                  color: item === selectedTab ? "#fff" : "#000",
                }}
                transition={{ duration: 0.3 }}
                className="relative rounded px-3 py-1 cursor-pointer border-none outline-none flex items-center gap-2"
              >
                <Icon className="w-6 h-6" />
                <span className="z-10 bg-inherit text-lg">{item.title}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="flex flex-row h-full w-fit border-l border-gray-500 bg-gray-100 items-center px-2 z-10 rounded-r-2xl gap-2">
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
          <span className="text-sm text-gray-600">{user.username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
}
