import type { User } from "../../types/user";

export default function UserInfo({ user }: { user: User }) {
  return (
    <div className="rounded-lg p-6 space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">User Information</h2>
      </div>

      <div className="space-y-3">
        <InfoRow label="이름" value={user.username} />
        <InfoRow
          label="가입일"
          value={new Date(user.createdAt).toLocaleString()}
        />
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}
