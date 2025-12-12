import { create } from 'zustand';

type ModalType = 
  | 'auth'
  | 'layoutManager'
  | 'communityGallery'
  | 'templateGallery'
  | 'userProfile'
  | 'objectBuilder'
  | 'layoutComments'
  | 'tutorial'
  | null;

interface ModalState {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  isModalOpen: (type: ModalType) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  activeModal: null,
  openModal: (type: ModalType) => {
    // Close any existing modal before opening a new one
    set({ activeModal: type });
  },
  closeModal: () => {
    set({ activeModal: null });
  },
  isModalOpen: (type: ModalType) => {
    return get().activeModal === type;
  },
}));

