import Modal from "../modal/Modal";
import { useModal } from "../../stores/modalStore";
import { useAuth } from "../../contexts/useAuth";
import { motion } from "motion/react";
import { CheckIcon, BellIcon } from "@heroicons/react/24/outline";
import { formatDate } from "../../utils/notification";
import { useNotification } from "../../hooks/useNotification";

export default function NotificationModal() {
  const { isOpen, isMinimized, closeModal, toggleMinimize } =
    useModal("notification");
  const { user } = useAuth();
  const { notifications, unreadCount, handleMarkAsRead, handleMarkAllAsRead } =
    useNotification(user?.id);

  return (
    <Modal
      isOpen={isOpen}
      isMinimized={isMinimized}
      onClose={closeModal}
      onMinimize={toggleMinimize}
      title="알림"
      width="w-160"
      height="h-160"
      className="flex flex-col overflow-hidden"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <BellIcon className="w-6 h-6 text-blue-600" />
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <CheckIcon className="w-3 h-3" />
              모두 읽음
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <BellIcon className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                    bg-white rounded-lg shadow-sm p-3
                    transition-all hover:shadow-md
                    ${
                      !notification.isRead
                        ? "border-l-4 border-blue-500 bg-blue-50"
                        : ""
                    }
                  `}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-sm font-semibold ${
                          !notification.isRead
                            ? "text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    {notification.content && (
                      <p className="text-xs text-gray-600 mb-2">
                        {notification.content}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatDate(notification.createdAt)}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {notification.type}
                      </span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      aria-label="Mark as read"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
