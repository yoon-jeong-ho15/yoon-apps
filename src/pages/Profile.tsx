import { useAuth } from "../contexts/AuthContext";
import UserProfile from "../components/profile/UserProfile";
import UserInfo from "../components/profile/UserInfo";
import type { User } from "../lib/types";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로그인이 필요합니다.</div>
      </div>
    );
  }

  const userForDisplay: User = {
    id: user.id,
    username: user.username,
    from: parseInt(user.from),
    profilePic: user.profile_pic,
    friendGroup: user.friend_group,
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row mx-5 mt-6 p-8 rounded-xl bg-gradient-to-r from-indigo-500/50 to-blue-400/60">
        <UserProfile user={userForDisplay} />
        <UserInfo user={userForDisplay} />
      </div>
    </div>
  );
}
