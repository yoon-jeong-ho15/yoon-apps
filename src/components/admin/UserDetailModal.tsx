import { useEffect, useState } from "react";
import type { User } from "../../types/user";

type AuditLogEntry = {
  id: string;
  payload: any;
  created_at: string;
  ip_address: string;
};

type UserDetailModalProps = {
  user: User;
  auditLogs: AuditLogEntry[];
  onClose: () => void;
};

export default function UserDetailModal({
  user,
  auditLogs,
  onClose,
}: UserDetailModalProps) {
  const [userLogs, setUserLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    // Filter logs for this specific user
    const filtered = auditLogs.filter(
      (log) =>
        log.payload?.user_id === user.id || log.payload?.actor_id === user.id
    );
    setUserLogs(filtered);
  }, [auditLogs, user.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.profilePic || "/default-avatar.png"}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-gray-500 text-sm">User ID: {user.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Auth Logs Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Authentication Activity Log
              </h3>
              <div className="text-sm text-gray-600 mb-2">
                Total events: {userLogs.length}
              </div>

              {userLogs.length === 0 ? (
                <p className="text-gray-500">No authentication logs found.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {userLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {log.payload?.action || "Unknown action"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      {log.ip_address && (
                        <div className="text-xs text-gray-600 mb-2">
                          IP: {log.ip_address}
                        </div>
                      )}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View full payload
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
