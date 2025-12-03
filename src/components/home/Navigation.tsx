import { ChatBubbleLeftRightIcon, FireIcon } from "@heroicons/react/24/outline";
import { useModalStore, type ModalType } from "../../stores/modalStore";
import GradientContainer from "../common/GradientContainer";
import { useHeaderStore } from "../../stores/headerStore";

type TabItem = {
  title: string;
  icon: React.ForwardRefExoticComponent<any>;
  href?: string;
  modalKey?: ModalType;
  headerText?: string;
};

const tabs: TabItem[] = [
  {
    title: "메시지",
    modalKey: "message",
    icon: ChatBubbleLeftRightIcon,
    headerText: "저와 대화를 나눌 수 있습니다.",
  },
  {
    title: "트랙커",
    modalKey: "tracker",
    icon: FireIcon,
    headerText: "운동을 기록해보세요",
  },
];

export default function Navigation() {
  const { setText } = useHeaderStore();

  const openModal = useModalStore((state) => state.openModal);

  // Determine which tabs to show based on user role
  return (
    <GradientContainer
      outerClassName="p-[3px] rounded-full w-fit"
      className="rounded-full flex"
    >
      {tabs.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            onClick={() => {
              if (item.modalKey) {
                openModal(item.modalKey);
              }
            }}
            onMouseEnter={() => setText(item.headerText || "")}
            onMouseLeave={() => setText("")}
            className="
              px-3 py-1 cursor-pointer border-none 
              outline-none flex items-center gap-2
              rounded-full
              transition-colors hover:bg-gray-200"
          >
            <Icon className="size-7" />
            <span className="text-sm">{item.title}</span>
          </button>
        );
      })}
    </GradientContainer>
  );
}
