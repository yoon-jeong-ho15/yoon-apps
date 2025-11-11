import type { User } from "../../lib/types";

export default function UserInfo({ user }: { user: User }) {
  return (
    <div>
      <h1>{Object.keys(user).join(", ")}</h1>
    </div>
  );
}
