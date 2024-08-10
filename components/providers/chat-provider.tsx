"use client";

import React, {useContext} from 'react';
import {useChatQuery} from "@/hooks/use-chat";
import {InfiniteData, useQueryClient} from "@tanstack/react-query";
import qs from "query-string";
import axios from "axios";
import {Message} from "@prisma/client";
import {useInventory} from "@/components/providers/inventory-data-provider";
import {count} from "effect/Sink";

type ChatContext = {
  state: string;
  sendMessage: (message: string) => Promise<boolean>;
  isSendingMessage: boolean;
  canLoadMore: boolean;
  loadMore: () => void;
  data?: InfiniteData<any>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const chatContext = React.createContext<ChatContext>({
  state: "any",
  sendMessage: async (message: string) => {return false;},
  isSendingMessage: false,
  canLoadMore: false,
  loadMore: () => {},
  data: undefined,
  hasNextPage: false,
  isFetchingNextPage: false,
})


const ChatProvider = (
  {
    children
  } : { children: React.ReactNode }
) => {

  const mQueryClient = useQueryClient();
  const mChat = useChatQuery({
    queryKey: "chat"
  });

  const [isSendingMessage, setIsSendingMessage] = React.useState(false);
  const inventory = useInventory();


  const addMessageToQuery = (m: Message) => {
    mQueryClient.setQueryData(["chat"] , (oldData: any) => {
      if (!oldData || !oldData.pages || oldData.pages.length == 0) {
        return {
          pages: [
            {
              items: [m],
            },
          ],
        };
      }

      const newData = [...oldData.pages];
      newData[0] = {
        ...newData[0],
        items: [
          m,
          ...newData[0].items,
        ]
      }

      return {
        ...oldData,
        pages: newData
      };

    });
  }

  const updateLoadingMessage = (m: Message) => {
    mQueryClient.setQueryData(["chat"] , (oldData: any) => {
      if (!oldData || !oldData.pages || oldData.pages.length == 0) {
        return {
          pages: [
            {
              items: [m],
            },
          ],
        };
      }

      const newData = [...oldData.pages];

      newData[0].items = newData[0].items.map((item: any) => {
        if (item.id == "") return m;
        return item;
      })

      return {
        ...oldData,
        pages: newData
      };

    });
  }

  const removeLoadingMessage = () => {
    mQueryClient.setQueryData(["chat"] , (oldData: any) => {
      if (!oldData || !oldData.pages || oldData.pages.length == 0) {
        return oldData;
      }

      const newData = [...oldData.pages];

      newData[0].items = newData[0].items.filter((item: any) => {
        return item.id != "";
      })

      console.log(newData[0].items);

      return {
        ...oldData,
        pages: newData
      };

    });
  }

  const performTask = (task: any) => {
    console.log("Performing Task: " + JSON.stringify(task));
    if (task){
      if (task.action == 'add'){
        const name = task.itemName;
        const count = task.itemCount ?? 1;
        inventory.addItem(name, count);
      } else if (task.action == 'edit'){
        const name = task.itemName;
        const item = inventory.data.find((item: any) => item.name == name);
        if (item){
          const newCount = task.newCount ?? item?.count;
          const newName = task.newName ?? name;
          inventory.editItem(`${item.id}` , newName , newCount);
        }
      } else if (task.action == 'remove'){
        const name = task.itemName;
        const item = inventory.data.find((item: any) => item.name == name);
        if (item) {
          const dec = task.newCount ?? item.count;
          const newCount = item.count - dec;
          if (newCount <= 0){
            inventory.deleteItem([item]);
          } else {
            inventory.editItem(`${item.id}` , name , newCount);
          }
        }
      } else {
        if (!task.action){
          for (const mTask of task){
            performTask(mTask);
          }
        } else {
          console.log("unknown task:" + task.action);
        }
      }
    }
  }

  const sendMessage = async (message: string) => {

    try {

      addMessageToQuery({
        role: "User",
        content: message,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: "",
        senderId: ""
      });

      setIsSendingMessage(true);

      const url = qs.stringifyUrl({
        url: "/api/chat",
      });

      const res = await axios.post(url, {
        "content": message,
      });

      const data = res.data;

      updateLoadingMessage(data.userMessage);
      addMessageToQuery(data.AiResponse);

      performTask(data.task);

      setIsSendingMessage(false);
      return true;
    } catch (error){
      console.log(error);
      removeLoadingMessage();
    }
    setIsSendingMessage(false);
    return false;
  }

  return (
    <chatContext.Provider value={
      {
        isSendingMessage: isSendingMessage,
        state: mChat.status,
        sendMessage,
        canLoadMore: mChat.hasNextPage && !mChat.isFetchingNextPage,
        loadMore: mChat.fetchNextPage,
        data: mChat.data,
        hasNextPage: mChat.hasNextPage,
        isFetchingNextPage: mChat.isFetchingNextPage,
      }}>
      {children}
    </chatContext.Provider>
  );
};

export default ChatProvider;

export const useChatContext = () => useContext(chatContext);