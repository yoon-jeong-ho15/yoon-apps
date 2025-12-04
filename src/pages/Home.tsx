import AccountModal from "../components/account/AccountModal";
import MessageModal from "../components/message/MessageModal";
import NotificationModal from "../components/notification/NotificationModal";
import TrackerModal from "../components/tracker/TrackerModal";

export default function HomePage() {
  return (
    <main className="flex flex-col flex-grow pb-4" data-modal-container>
      <MessageModal />
      <TrackerModal />
      <AccountModal />
      <NotificationModal />
    </main>
  );
}
