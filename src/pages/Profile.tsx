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
    <div className="flex mt-5 mx-8 flex-grow">
      <div className="w-full flex rounded shadow p-1 container bg-gradient-to-r from-blue-400 to-indigo-400">
        <div className="w-full h-full bg-white rounded container flex flex-row p-8 shadow">
          <UserProfile user={userForDisplay} />
          <UserInfo user={userForDisplay} />
        </div>
      </div>
    </div>
  );
}
