import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { isAdmin } from "../../utils/user";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin(user.id)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
