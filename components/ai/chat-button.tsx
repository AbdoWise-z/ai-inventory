"use client";

import React from 'react';
import {Button} from "@/components/ui/button";
import {Bot, BotMessageSquare, X} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Separator} from "@/components/ui/separator";
import ChatArea from "@/components/ai/chat/chat-area";
import {useChatContext} from "@/components/ai/chat/chat-provider";

const ChatButton = () => {
  const [isOpen, setIsOpen] = React.useState(false);


  return <>
    {isOpen && (
      <div className={"absolute bottom-4 right-4 border-1 shadow-xl rounded-lg w-[40%] min-w-[420px] h-[80%] bg-white flex flex-col"}>
        <div className={"flex pt-4 px-4"}>
          <Bot size={22} className={"mr-2"}/>
          <p>Chat bot</p>
          <Button className={"ml-auto p-0 w-[24px] h-[24px] text-zinc-400"} variant={"ghost"} onClick={() => {setIsOpen(false);}}>
            <X/>
          </Button>
        </div>
        <Separator
          className={"w-full h-[1px] mt-4 mb-2"}
        />
        <ChatArea />
      </div>
    )}
    {!isOpen && (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className={"absolute bottom-4 right-4 p-0"} size={"icon"} onClick={() => {setIsOpen(true);}}>
              <BotMessageSquare size={24} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={"left"} sticky={"partial"}>
            Chat with an AI CS
          </TooltipContent>
        </Tooltip>
      </>
    )}
  </>
};

export default ChatButton;