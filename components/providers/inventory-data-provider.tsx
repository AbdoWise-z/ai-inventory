"use client";

import React, {useContext, useEffect} from 'react';
import axios from "axios";
import qs from "query-string";

export type StatfulInventoryItem = {
  state: "Idle" | "Editing" | "Deleting",
  id: string | -1
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
  addItem: (name: string, count: number) => void;
  deleteItem: (item: StatfulInventoryItem[]) => void;
  editItem: (id: string , newName: string, newCount: number) => void;
}

const InventoryDataContext = React.createContext<InventoryDataProviderState>({
  data: [],
  state: InventoryDataProviderLoadingState.Loading,
  reloadData: () => {},
  addItem: (name: string, count: number) => {},
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
    } catch (e){
      console.log(e);
    }

    setState(InventoryDataProviderLoadingState.Loaded);
  }

  const _addItem = async (name: string, count: number) => {

    let added = false;
    const newData = mData.map((item: StatfulInventoryItem) => {
      if (item.name === name) {
        item.count += count;
        item.state = "Editing";
      }
      return item;
    });

    if (!newData.find(i => i.name === name)) {
      added = true;
      newData.push({
        name: name,
        count: count,
        state: "Editing",
        id: -1,
      });
    }

    setData(newData);

    try{
      const res = await axios.post("/api/inventory" , {
        name: name,
        count: count,
      });

      if (res.data.id){
        const finalData = newData.map((item: StatfulInventoryItem) => {
          if (item.name === name) {
            item.id = res.data.id;
            item.state = "Idle";
            item.count = res.data.count;
          }
          return item;
        })
        setData(finalData);
      } else {
        if (added){
          setData(newData.filter((i: StatfulInventoryItem) => i.name !== name));
        } else {
          setData(newData.map((item: StatfulInventoryItem) => {
            if (item.name === name) {
              item.state = "Idle";
              item.count -= count;
            }
            return item;
          }));
        }
      }
    } catch (err){
      console.log(err);

      if (added){
        setData(newData.filter((i: StatfulInventoryItem) => i.name !== name));
      } else {
        setData(newData.map((item: StatfulInventoryItem) => {
          if (item.name === name) {
            item.state = "Idle";
            item.count -= count;
          }
          return item;
        }));
      }
    }
  }

  const _deleteItem = async (items: StatfulInventoryItem[]) => {
    const itemsIds = items.map((i) => `${i.id}`);

    const newData = mData.map((item: StatfulInventoryItem) => {
      if (itemsIds.some((i) => i == item.id)) {
        item.state = "Deleting";
      }
      return item;
    });

    setData(newData);

    try{
      const url = qs.stringifyUrl({
        url: "/api/inventory",
        query: {
          ids: itemsIds
        },
      })
      const res = await axios.delete(url);

      if (res.status == 200){ // ok
        const finalData = newData.filter((item: StatfulInventoryItem) => {
          return !(itemsIds.some((i) => i == item.id));
        })
        setData(finalData);
      } else {
        throw "Failed";
      }
    } catch (err){
      console.log(err);

      const newData = mData.map((item: StatfulInventoryItem) => {
        if (item.id in itemsIds) {
          item.state = "Idle";
        }
        return item;
      });

      setData(newData);
    }
  }

  const _editItem = async (id: string, newName: string, newCount: number) => {
    let oldName = "";
    let oldCount = -1;

    const newData = mData.map((item: StatfulInventoryItem) => {
      if (item.id == id) {
        oldName = item.name;
        oldCount = item.count;

        item.name = newName;
        item.count = newCount;
        item.state = "Editing";
      }
      return item;
    });

    setData(newData);

    try{
      const res = await axios.patch("/api/inventory" , {
        id: id,
        name: newName,
        count: newCount,
      });

      if (res.data.id){
        const finalData = newData.map((item: StatfulInventoryItem) => {
          if (item.id === id) {
            item.state = "Idle";
          }
          return item;
        })
        setData(finalData);

      } else {
        throw "Failed";
      }
    } catch (err){
      console.log(err);

      setData(newData.map((item: StatfulInventoryItem) => {
        if (item.id === id) {
          item.state = "Idle";
          item.name = oldName;
          item.count = oldCount;
        }
        return item;
      }));
    }
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
      addItem: _addItem,
    }} >
      {children}
    </InventoryDataContext.Provider>
  );
};

export default InventoryDataProvider;