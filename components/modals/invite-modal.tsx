"use client";

import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";


import {Input} from "../ui/input";

import {Button} from "../ui/button";
import {ModalType, useModal} from "@/hooks/use-modal";
import {Label} from "@/components/ui/label";
import {Check, Copy, RefreshCw, RotateCw} from "lucide-react";
import {useOrigin} from "@/hooks/use-origin";
import {useState} from "react";
import axios from "axios";
import {cn} from "@/lib/utils";

export const InviteModal = () => {

  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.INVITE;
  const origin = useOrigin();

  const { server } = modal.data;

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);


  if (!server) return <></>;

  const inviteUrl = `${origin}/invite/${server.inviteCode}`;
  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const onNew = async () => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/servers/${server.id}/invite-code`);
      modal.open(ModalType.INVITE , {server: response.data});
    } catch (error){
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open?) => {
      if (!open){
        modal.close();
      }
    }}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6" >
          <DialogTitle className="text-2xl text-center font-bold" >
            Invite friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server Invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={loading}
              className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0" type="text"
              value={inviteUrl}
            />
            <Button size="icon" onClick={onCopy} disabled={loading}>
              {copied ?
                (
                  <Check className="w-4 h-4"/>
                ) : (
                  <Copy className="w-4 h-4"/>
                )
              }
            </Button>
          </div>

          <Button onClick={onNew} variant="link" size="sm" className="text-xs text-zinc-500 mt-4" disabled={loading}>
            Generate new link
            <RefreshCw className={cn(
              "w-4 h-4 ml-2",
              loading && "animate-spin-1s"
            )}/>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}