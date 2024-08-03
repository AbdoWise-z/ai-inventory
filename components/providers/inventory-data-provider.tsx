"use client";

import React, {useContext, useEffect} from 'react';
import axios from "axios";

export type StatfulInventoryItem = {
  state: "Idle" | "Editing" | "Deleting",
  id: string
  name: string
  count: number
}

export enum InventoryDataProviderLoadingState {
  "Loading",
  "Loaded"
}

type InventoryDataProviderState = {
  data: StatfulInventoryItem[];
  state: InventoryDataProviderLoadingState;
  reloadData: () => void;
  deleteItem: (item: StatfulInventoryItem) => void;
  editItem: (item: StatfulInventoryItem , newName: string, newCount: number) => void;
}

const InventoryDataContext = React.createContext<InventoryDataProviderState>({
  data: [],
  state: InventoryDataProviderLoadingState.Loading,
  reloadData: () => {},
  deleteItem: (i) => {},
  editItem: (i, n , c) => {},
});

export const useInventory = () => useContext(InventoryDataContext);

const InventoryDataProvider = (
  {
    children
  } : { children: React.ReactNode }
) => {
  const [mData, setData] = React.useState(([] as StatfulInventoryItem[]));
  const [mState, setState] = React.useState(InventoryDataProviderLoadingState.Loading);

  const _reloadData = async () => {
    setState(InventoryDataProviderLoadingState.Loading);

    try {
      const res = await axios.get("/api/inventory");
      const data = await res.data;
      setData(data.map((item: any) => {
        return {
          state: "Idle",
          id: item.id,
          name: item.name,
          count: item.count,
        } as StatfulInventoryItem;
      }));
      console.log(data);
    } catch (e){
      console.log(e);
    }

    setState(InventoryDataProviderLoadingState.Loaded);
  }

  const _deleteItem = async (item: StatfulInventoryItem) => {

  }

  const _editItem = async (item: StatfulInventoryItem, newName: string, newCount: number) => {

  }

  useEffect( () => {
    _reloadData();
  } , []);

  return (
    <InventoryDataContext.Provider value={{
      data: mData,
      state: mState,
      reloadData: _reloadData,
      deleteItem: _deleteItem,
      editItem: _editItem,
    }} >
      {children}
    </InventoryDataContext.Provider>
  );
};

export default InventoryDataProvider;