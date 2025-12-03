import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { fetchUsersWithAuthLogs } from "../lib/data/userActivity";
import type { User } from "../types/user";
import { Navigate } from "react-router-dom";
import UserDetailModal from "../components/admin/UserDetailModal";
import { isAdmin } from "../utils/user";

type AuditLogEntry = {
  id: string;
  payload: {
    action?: string;
    user_id?: string;
    actor_id?: string;
    [key: string]: unknown;
  };
  created_at: string;
  ip_address: string;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  // Check if current user is admin
  if (!user || !isAdmin(user.id)) {
    return <Navigate to="/" replace />;
  }

  const loadUsers = async () => {
    setIsLoading(true);
    const { users: allUsers, auditLogs: logs } = await fetchUsersWithAuthLogs();
    setUsers(allUsers);
    setAuditLogs(logs);
    setIsLoading(false);
  };

  const handleUserClick = (clickedUser: User) => {
    setSelectedUser(clickedUser);
  };

  const getUserLoginCount = (userId: string) => {
    return auditLogs.filter(
      (log) =>
        (log.payload?.user_id === userId || log.payload?.actor_id === userId) &&
        log.payload?.action === "user_signedin"
    ).length;
  };

  const getLastLoginDate = (userId: string) => {
    const loginLogs = auditLogs.filter(
      (log) =>
        (log.payload?.user_id === userId || log.payload?.actor_id === userId) &&
        log.payload?.action === "user_signedin"
    );
    return loginLogs.length > 0 ? loginLogs[0].created_at : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-5 mx-8 flex-grow">
      <h1 className="text-3xl font-bold mb-6">User Management Dashboard</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Logins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserClick(u)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={u.profilePic || "/default-avatar.png"}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {u.username}
                      </div>
                      <div className="text-xs text-gray-500">ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.createdAt ? formatDate(u.createdAt) : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getLastLoginDate(u.id)
                    ? formatDate(getLastLoginDate(u.id)!)
                    : "Never"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getUserLoginCount(u.id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(u);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          auditLogs={auditLogs}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
