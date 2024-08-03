"use client";

import React, {useEffect} from 'react';
import {CreateServerModal} from "@/components/modals/create-server-modal";
import {InviteModal} from "@/components/modals/invite-modal";
import {DeleteMessageModel} from "@/components/modals/delete-message-modal";

const ModelProvider = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateServerModal closable/>
      <InviteModal />
      <DeleteMessageModel />
    </>
  );
};

export default ModelProvider;