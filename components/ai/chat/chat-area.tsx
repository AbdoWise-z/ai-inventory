"use client";

import React, {Fragment, useRef} from 'react';
import ChatInput from "@/components/ai/chat/chat-input";
import {Loader2, ServerCrash} from "lucide-react";
import {useChatContext} from "@/components/ai/chat/chat-provider";
import {useChatScroll} from "@/hooks/use-chat-scroll";
import {Message} from "@prisma/client";
import ChatItem from "@/components/ai/chat/chat-item";

const ChatArea = () => {

  const chatContext = useChatContext();

  const charRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  useChatScroll({
    chatRef: charRef,
    bottomRef: botRef,
    shouldLoadMore: chatContext.canLoadMore,
    loadMore: chatContext.loadMore,
    trigger: chatContext.data?.pages?.[0].items?.length ?? 0,
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

        { chatContext.isSendingMessage && (
          <p>
            AI is thinking ..
          </p>
        )}

        <div ref={botRef}/>
      </div>
      <ChatInput />
    </>
  );
};

export default ChatArea;