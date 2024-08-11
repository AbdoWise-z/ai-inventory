"use client";

import React, {createContext, Fragment, useContext, useRef, useState} from 'react';
import ChatInput from "@/components/ai/chat/chat-input";
import {Loader2, ServerCrash} from "lucide-react";
import {useChatContext} from "@/components/providers/chat-provider";
import {useChatScroll} from "@/hooks/use-chat-scroll";
import {Message} from "@prisma/client";
import ChatItem from "@/components/ai/chat/chat-item";
import LoadingAnimation from "@/components/ai/chat/loading-animation";
import {cn} from "@/lib/utils";

type ChatAreaContextProps = {
  TriggerSizeChanged: () => void;
}

const ChatAreaContext = createContext<ChatAreaContextProps>({
  TriggerSizeChanged: () => {},
});

export const useChatResize = () => useContext(ChatAreaContext);

const ChatArea = () => {

  const chatContext = useChatContext();

  const [triggerValue , setTriggerValue] = useState(0);

  const charRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  useChatScroll({
    chatRef: charRef,
    bottomRef: botRef,
    shouldLoadMore: chatContext.canLoadMore,
    loadMore: chatContext.loadMore,
    trigger: triggerValue,
  });

  if (chatContext.state == 'error') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash
          className="h-7 w-7"/>

        <p className="text-zinc-500 dark:text-zinc-300">
          Something went wrong.
        </p>
      </div>
    );
  }

  if (chatContext.state == 'pending') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2
          className="h-7 w-7 text-zinc-500 animate-spin"/>

        <p className="text-zinc-500 dark:text-zinc-300">
          Loading chat ...
        </p>
      </div>
    );
  }

  const mTriggerResize = () => {
    setTriggerValue((v) => v + 1);
  }

  return (
    <>
      <div ref={charRef} className="flex flex-1 flex-col overflow-y-auto px-4">
        {!chatContext.hasNextPage && (
          <>
            {/*<div className={"w-full justify-center flex rounded-md border-[1px] border-neutral-200"}>*/}
            {/*  <p className={"p-2 w-fit"}>This is an AI customer support</p>*/}
            {/*</div>*/}
            <ChatItem content={"How can I help you today ?"} role={"AI"} />
          </>
        )}
        {chatContext.hasNextPage && (
          <div className="flex justify-center">
            {chatContext.isFetchingNextPage && (
              <Loader2
                className="h-6 w-6 text-zinc-500 animate-spin my-4"
              />
            )}
            {!chatContext.isFetchingNextPage && (
              <button
                onClick={() => chatContext.loadMore()}
                className="my-4"
              >
                Load Previous messages
              </button>
            )}
          </div>
        )}
        <ChatAreaContext.Provider value={{
          TriggerSizeChanged: mTriggerResize,
        }}>
          <div className="flex flex-col-reverse">
            {
              chatContext.data?.pages?.map((page, pageIndex) => (
                <Fragment key={pageIndex}>
                  {page.items.map((item: Message, itemIdx : number) => (
                    <ChatItem
                      key={item.id}
                      content={item.content}
                      role={item.role}
                      animate={item.role == "AI" && pageIndex == 0 && itemIdx == 0}
                    />
                  ))}
                </Fragment>
              ))
            }
          </div>
        </ChatAreaContext.Provider>

        { (chatContext.isSendingMessage) && (
          <div className={"flex w-full group mt-2"}>
            <div className={cn(
              "relative group flex w-fit rounded-t-xl max-w-[calc(95% - 24px)] bg-neutral-200 rounded-br-xl justify-center px-2 py-2",
            )}>
              {/*<p className="mr-2 content-center">*/}
              {/*  AI is thinking*/}
              {/*</p>*/}
              <LoadingAnimation className={"w-8 h-8 mx-4"}/>
            </div>
          </div>
        )}

        <div ref={botRef}/>
      </div>
      <ChatInput/>
    </>
  )
    ;
};

export default ChatArea;