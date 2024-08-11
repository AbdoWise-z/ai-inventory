"use client";

import React, {useContext} from 'react';
import {useChatQuery} from "@/hooks/use-chat";
import {InfiniteData, useQueryClient} from "@tanstack/react-query";
import qs from "query-string";
import axios from "axios";
import {Message} from "@prisma/client";
import {useInventory} from "@/components/providers/inventory-data-provider";

type ChatContext = {
  state: string;
  sendMessage: (message: string) => boolean;
  isSendingMessage: boolean;
  canLoadMore: boolean;
  loadMore: () => void;
  data?: InfiniteData<any>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const chatContext = React.createContext<ChatContext>({
  state: "any",
  sendMessage: (message: string) => {return false;},
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
  const [pendingTasks, setPendingTasks] = React.useState(([] as any[]));
  const [currentTask, setCurrentTask] = React.useState(null as any);

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

  // const removeLoadingMessage = () => {
  //   mQueryClient.setQueryData(["chat"] , (oldData: any) => {
  //     if (!oldData || !oldData.pages || oldData.pages.length == 0) {
  //       return oldData;
  //     }
  //
  //     const newData = [...oldData.pages];
  //
  //     newData[0].items = newData[0].items.filter((item: any) => {
  //       return item.id != "";
  //     })
  //
  //     console.log(newData[0].items);
  //
  //     return {
  //       ...oldData,
  //       pages: newData
  //     };
  //
  //   });
  // }

  const performTask = async (task: any) => {
    console.log("Performing Task: " + JSON.stringify(task));
    if (task){
      if (task.action == 'add'){
        const name = task.itemName;
        const count = task.itemCount ?? 1;
        await inventory.addItem(name, count);
        setCurrentTask(null);
      } else if (task.action == 'edit'){
        const name = task.itemName;
        const item = inventory.data.find((item: any) => item.name == name);
        if (item){
          const newCount = task.newCount ?? item?.count;
          const newName = task.newName ?? name;
          await inventory.editItem(`${item.id}` , newName , newCount);
        }
        setCurrentTask(null);
      } else if (task.action == 'remove'){
        const name = task.itemName;
        const item = inventory.data.find((item: any) => item.name == name);
        if (item) {
          const dec = task.newCount ?? item.count;
          const newCount = item.count - dec;
          if (newCount <= 0){
            await inventory.deleteItem([item]);
          } else {
            await inventory.editItem(`${item.id}` , name , newCount);
          }
        }
      } else {
        console.log("unknown task:" + task.action);
      }
    }
    setCurrentTask(null);
  }

  if (!currentTask){
    if (pendingTasks.length > 0) {
      const task = pendingTasks.pop();
      setCurrentTask(task);
      setPendingTasks(pendingTasks);
      performTask(task);
    }
  }

  const _sendMessageInternal = async (message: string) => {
    try {
      addMessageToQuery({
        role: "User",
        content: message,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: "",
        senderId: ""
      });


      const url = qs.stringifyUrl({
        url: "/api/chat",
      });

      const res = await axios.post(url, {
        "content": message,
      });

      const data = res.data;

      updateLoadingMessage(data.userMessage);
      addMessageToQuery(data.AiResponse);

      try {
        if (data.task) {
          setPendingTasks((v: any[]) => {
            v.push(...(data.task))
            return v;
          });
        }
      } catch (e){
        console.error(e);
      }

      setIsSendingMessage(false);
      return true;
    } catch (error){
      console.log(error);
      updateLoadingMessage({
        role: "User",
        content: message,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: "invalid" + Math.random(),
        senderId: ""
      });
      addMessageToQuery({
        role: "AI",
        content: "Failed to send message",
        createdAt: new Date(),
        updatedAt: new Date(),
        id: "invalid" + Math.random(),
        senderId: ""
      });
      setIsSendingMessage(false);
      return false;
    }
  }

  const sendMessage = (message: string) => {
    if (isSendingMessage){
      return false;
    }
    setIsSendingMessage(true);
    _sendMessageInternal(message);
    return true;
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