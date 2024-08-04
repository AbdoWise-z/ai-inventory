"use client";

import React from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {cn, delay} from "@/lib/utils";

const SuggestionsArea = () => {
  const [text, setText] = React.useState<string>('Try to press the **generate** button to get suggestions');
  const [loading, setLoading] = React.useState(false);

  const generateSuggestion = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/ai");
      const result = res.data.response;
      const words = result.split(" ");
      let str = "";
      for (const word of words) {
        if (str.length == 0){
          str = word;
        } else {
          str = str + " " + word;
        }

        setText(str);
        await delay(20);
      }
    } catch (error) {
      setText(`Error: ${error}`);
    }
    setLoading(false);
  }

  return (
    <div className={"w-full h-full flex flex-col p-4"}>
      <ReactMarkdown className={"w-full h-fit p-2 rounded-md border-2 border-zinc-300 min-h-[30%]"}>{text}</ReactMarkdown>
      <div className="mt-3">
        <Button onClick={generateSuggestion} size={"sm"} variant={"default"} disabled={loading}>
          <Loader2 width={12} height={12} className={cn("mr-2 animate-spin hidden" , loading && "block")} />
          Generate
        </Button>
      </div>
    </div>
  );
};

export default SuggestionsArea;