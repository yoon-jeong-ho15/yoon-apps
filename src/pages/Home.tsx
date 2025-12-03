import Navigation from "../components/home/Navigation";
import MessageModal from "../components/message/MessageModal";
import TrackerModal from "../components/tracker/TrackerModal";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-grow pb-4">
      <MessageModal />
      <TrackerModal />
      <div className="flex w-full justify-center fixed bottom-4">
        <Navigation />
      </div>
    </div>
  );
}
