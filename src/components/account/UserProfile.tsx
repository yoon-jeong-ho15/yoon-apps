import type { User } from "../../types/user";
import { NoProfile } from "../../assets/Icon";

export default function UserProfile({ user }: { user: User }) {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="rounded-[15%] bg-white border-8 h-full w-80 flex justify-center items-center">
        <NoProfile className="" />
      </div>
      <span className="text-6xl">{user.username}</span>
    </div>
  );
}
