"use client";

import * as z from 'zod';
import React from 'react';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import qs from 'query-string';
import axios from "axios";
import {useRouter} from "next/navigation";
import {useAutoResize} from "@/hooks/use-auto-resize";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {useChatContext} from "@/components/ai/chat/chat-provider";
import {Button} from "@/components/ui/button";
import {Send, SendHorizonal} from "lucide-react";


const formSchema = z.object({
  content: z.string().min(1),
})


const ChatInput = () => {

  const {ref, fitToSize , onInput} = useAutoResize();
  const chatContext = useChatContext();

  const form = useForm<z.infer<typeof formSchema>>(
    {
      defaultValues: {
        content: "",
      },
      resolver: zodResolver(formSchema),
    }
  )

  const handleKeyDown = (e: any) => {
    if (e.key == 'Enter'){
      if (e.shiftKey){
        return;
      }
      form.handleSubmit(onSubmit)();
    }
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await chatContext.sendMessage(values.content);
    form.reset();
    setTimeout(fitToSize , 10);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
        <FormField
          control={form.control}
          name="content"
          render={({field}) => {
            return (
              <FormItem>
                <FormControl>
                  <div className="relative m-1 p-2">
                    <textarea
                      onInput={onInput}
                      onKeyDown={handleKeyDown}
                      {...field}
                      disabled={isLoading}
                      rows={1}
                      ref={ref as any}
                      className="pl-2 pr-12 py-3 bg-zinc-200/90 dark:bg-zinc-700/75
                      border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0
                      text-zinc-600 dark:text-zinc-200 w-full rounded-md resize-none
                      max-h-[300px]"
                      placeholder={`Message the AI`}
                    />

                    <div className="absolute right-2 top-2 py-[3px] pr-2 w-fit h-full">
                      <Button size={"icon"} variant={"ghost"} type={"submit"}>
                        <SendHorizonal />
                      </Button>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )
          }}
        />
      </form>
    </Form>
  );
};

export default ChatInput;