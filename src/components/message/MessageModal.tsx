import { useAuth } from "../../contexts/useAuth";
import { useMessage } from "../../hooks/useMessage";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import Modal from "../modal/Modal";
import type { ModalProps } from "../../types/modal";

export default function MessageModal({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
}: ModalProps) {
  const { user } = useAuth();
  const messageHook = useMessage({ currentUserId: user?.id || "" });

  if (!isOpen) return null;

  if (!user) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      isMinimized={isMinimized}
      onClose={onClose}
      onMinimize={onMinimize}
      title="메시지"
    >
      <MessageList
        messages={messageHook.messages}
        currentUserId={user.id}
        messageDivRef={messageHook.messageDivRef}
      />
      <MessageForm
        message={messageHook.message}
        setMessage={messageHook.setMessage}
        isSubmitting={messageHook.isSubmitting}
        textareaRef={messageHook.textareaRef}
        handleSubmit={messageHook.handleSubmit}
        handleKeyDown={messageHook.handleKeyDown}
      />
    </Modal>
  );
}
