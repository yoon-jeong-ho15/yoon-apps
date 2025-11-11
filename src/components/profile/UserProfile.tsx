import type { User } from "../../lib/types";
import { NoProfile } from "../common/Icon";

export default function UserProfile({ user }: { user: User }) {
  return (
    <div className="flex flex-col h-full w-1/2 justify-center items-center py-6">
      <div className="bg-white/60 rounded-[15%] border-8 border-white h-full w-120 flex justify-center items-center">
        <NoProfile size="full" />
      </div>
      <span className="text-6xl pt-3">{user.username}</span>
    </div>
  );
}
