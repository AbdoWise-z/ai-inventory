import {create} from "zustand";


export enum ModalType {
  CREATE_SERVER,
  ADD_ITEM,
  INVITE,
  EDIT_SERVER,
  MANAGE_MEMBERS,
  CREATE_CHANNEL,
  LEAVE_SERVER,
  DELETE_SERVER,
  DELETE_CHANNEL,
  EDIT_CHANNEL,
  MESSAGE_FILE,
  DELETE_MESSAGE

  //TODO: add other types
}

interface ModelData {

}

interface ModalStore {
  type: ModalType | null;
  data: ModelData;
  isOpen: boolean;
  open: (type : ModalType, data?: ModelData) => void;
  close: () => void;
}

export const useModal = create<ModalStore>(
  (set) => ({
    type: null,
    isOpen: false,
    data: {},
    open(type, data = {}) {
      set({
        isOpen: true, type , data
      });
    },
    close() {
      set({
        isOpen: false, type: null
      });
    },
  })
);