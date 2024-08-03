"use client";

import React, {useEffect} from 'react';
import {CreateServerModal} from "@/components/modals/create-server-modal";
import {InviteModal} from "@/components/modals/invite-modal";
import {DeleteMessageModel} from "@/components/modals/delete-message-modal";
import {AddItemModal} from "@/components/modals/add-item-modal";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <AddItemModal/>
    </>
  );
};

export default ModalProvider;