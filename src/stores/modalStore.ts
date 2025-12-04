import { create } from 'zustand';

export type ModalType = 'message' | 'tracker' | 'account' | 'notification';

type ModalState = {
  isOpen: boolean;
  isMinimized: boolean;
};

type ModalStore = {
  modals: Record<ModalType, ModalState>;
  openModal: (modalType: ModalType) => void;
  closeModal: (modalType: ModalType) => void;
  toggleShow: (modalType: ModalType) => void;
  toggleMinimize: (modalType: ModalType) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modals: {
    message: { isOpen: false, isMinimized: false },
    tracker: { isOpen: false, isMinimized: false },
    account: { isOpen: false, isMinimized: false },
    notification: { isOpen: false, isMinimized: false },
  },
  openModal: (modalType) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalType]: { ...state.modals[modalType], isOpen: true },
      },
    })),
  closeModal: (modalType) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalType]: { isOpen: false, isMinimized: false },
      },
    })),
  toggleShow: (modalType)=>set((state)=>({
    modals: { ...state.modals, [modalType]: {...state.modals[modalType], isOpen : !state.modals[modalType].isOpen}}
  })),

  toggleMinimize: (modalType) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalType]: {
          ...state.modals[modalType],
          isMinimized: !state.modals[modalType].isMinimized,
        },
      },
    })),
}));

export const useModal = (modalType: ModalType) => {
  const isOpen = useModalStore((state) => state.modals[modalType].isOpen);
  const isMinimized = useModalStore((state) => state.modals[modalType].isMinimized);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const toggleShow = useModalStore((state) => state.toggleShow);
  const toggleMinimize = useModalStore((state) => state.toggleMinimize);

  return {
    isOpen,
    isMinimized,
    openModal: () => openModal(modalType),
    closeModal: () => closeModal(modalType),
    toggleShow: () => toggleShow(modalType),
    toggleMinimize: () => toggleMinimize(modalType),
  };
};
