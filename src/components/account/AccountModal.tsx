import Modal from "../modal/Modal";
import { useModal } from "../../stores/modalStore";
import UserInfo from "./UserInfo";
import UserProfile from "./UserProfile";
import { useAuth } from "../../contexts";

export default function AccountModal() {
  const { isOpen, isMinimized, closeModal, toggleMinimize } =
    useModal("account");
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      isMinimized={isMinimized}
      onClose={closeModal}
      onMinimize={toggleMinimize}
      title="프로필"
      width="w-fit"
      height="h-fit"
    >
      <div>
        <UserProfile user={user} />
        <UserInfo user={user} />
      </div>
    </Modal>
  );
}
