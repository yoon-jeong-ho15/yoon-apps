import Modal from "../modal/Modal";
import { useModalStore } from "../../stores/modalStore";

export default function TrackerModal() {
  const isOpen = useModalStore((state) => state.modals.tracker.isOpen);
  const isMinimized = useModalStore((state) => state.modals.tracker.isMinimized);
  const closeModal = useModalStore((state) => state.closeModal);
  const toggleMinimize = useModalStore((state) => state.toggleMinimize);

  return (
    <Modal
      isOpen={isOpen}
      isMinimized={isMinimized}
      onClose={() => closeModal("tracker")}
      onMinimize={() => toggleMinimize("tracker")}
      title="트래커"
    >
      <div className="text-xl">Squat Tracker Page - Under Construction</div>
    </Modal>
  );
}
