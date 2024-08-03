"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FileUpload } from "@/components/utility/file-upload";

import { Input } from "../ui/input";

import { Button } from "../ui/button";

import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {zodResolver} from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {ModalType, useModal} from "@/hooks/use-modal";

const formSchema = z.object({
  name: z.string().min(1 , {
    message: "Server name is required",
  }),
  imageUrl: z.string().min(1 , {
    message: "Server image is required",
  }),
});

export const CreateServerModal = (
  { open, closable } : {
    open?: boolean,
    closable?: boolean,
  }
) => {

  const router = useRouter();

  const modal = useModal();
  const isOpen = open || (modal.isOpen && modal.type == ModalType.CREATE_SERVER);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: ""
    }
  });


  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try{
      await axios.post("/api/servers" , values);
      form.reset();
      router.refresh();
      modal.close();
    } catch (err){
      console.log(err);
    }
  };

  const handleClose = () => {
    form.reset();
    modal.close();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open?) => {
      if (closable && !open){
        handleClose();
      }
    }}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6" >
          <DialogTitle className="text-2xl text-center font-bold" >
            Customize your server !
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            you can create servers here to chat with friends , give it a name and an image. you can always change this later
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-8 py-4">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({field}) => (
                    <FormItem>
                      <FormControl>
                        <div>
                        <FileUpload
                          endpoint="imageUploader"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">Server name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 space-x-0 space-y-0 px"
                        placeholder="Enter server name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-2 py-6">
              <Button disabled={isLoading} variant="primary">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}