import {create} from "zustand";
import {StatfulInventoryItem} from "@/components/providers/inventory-data-provider";


export enum ModalType {
  CREATE_SERVER,
  ADD_ITEM,
  EDIT_ITEM,
  DELETE_ITEMS,
  INVITE,
  DELETE_MESSAGE

  //TODO: add other types
}


interface ModelData {
  id?: string;
  name?: string;
  count?: number;
  items?: StatfulInventoryItem[];
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