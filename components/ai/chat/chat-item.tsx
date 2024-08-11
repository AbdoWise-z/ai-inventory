'use client';

import React, {useEffect, useState} from 'react';
import { MessageRole } from "@prisma/client";
import {cn, delay} from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {Check, ClipboardCopy} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useChatResize} from "@/components/ai/chat/chat-area";

interface ChatItemProps {
  content: string;
  role: MessageRole;
  animate? : boolean;
}

const ChatItem = (
  {
    content,
    role,
    animate,
  } : ChatItemProps
) => {

  const [dispContent, setDispContent] = useState("");
  const [Copy , setCopy] = useState(false);
  const resize = useChatResize();

  const animateText = async () => {
    const words = content.split(" ");
    let str = "";
    for (const word of words) {
      if (str.length == 0){
        str = word;
      } else {
        str = str + " " + word;
      }

      setDispContent(str);
      await delay(20);
      resize.TriggerSizeChanged();
    }
  }
  useEffect(() => {
    if (animate){
      animateText();
    }
    resize.TriggerSizeChanged();
  }, []);

  const copyBtn = (
    <Button className={cn(
      "mx-2 opacity-0 group-hover:opacity-100 transition-all",
      role == "AI" && "",
      role == "User" && "ml-auto"
    )} variant={"ghost"} size={"icon"} onClick={() => {
      setCopy(true);
      navigator.clipboard.writeText(content);
      setTimeout(() => setCopy(false), 3000);
    }}>
      { !Copy &&
        <ClipboardCopy
          size={20}
        />
      }

      { Copy &&
        <Check
          size={20}

        />
      }
    </Button>
  );

  return (
    <div className={"flex w-full group mt-2"}>
      {  role == "User" &&
        copyBtn
      }
    <div className={cn(
      "relative group flex w-fit rounded-t-xl max-w-[calc(95% - 24px)] shadow-sm overflow-hidden",
      role == "AI" && "bg-neutral-200 rounded-br-xl",
      role == "User" && "bg-blue-200 rounded-bl-xl"
    )}>
      <ReactMarkdown className={"w-full h-fit p-2 overflow-scroll"}>
        {animate ? dispContent : content}
      </ReactMarkdown>
    </div>
      {  role == "AI" &&
        copyBtn
      }
    </div>
  );
};

export default ChatItem;