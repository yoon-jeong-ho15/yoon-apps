import { create } from 'zustand';

export type ModalType = 'message' | 'tracker' | 'profile';

type ModalState = {
  isOpen: boolean;
  isMinimized: boolean;
};

type ModalStore = {
  modals: Record<ModalType, ModalState>;
  openModal: (modalType: ModalType) => void;
  closeModal: (modalType: ModalType) => void;
  toggleMinimize: (modalType: ModalType) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modals: {
    message: { isOpen: false, isMinimized: false },
    tracker: { isOpen: false, isMinimized: false },
    profile: { isOpen: false, isMinimized: false },
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
