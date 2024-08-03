"use client";

import React from 'react';
import {useSocket} from "@/components/providers/socket-provider";
import {Badge} from "@/components/ui/badge";

const SocketIndicator = () => {
  const socket = useSocket();
  if (socket.isConnected){
    return <></>;
  }
  return (
    <Badge variant="outline" className="bg-yellow-600 text-white border-none">
      Fallback: Pulling every 1s
    </Badge>
  );
};

export default SocketIndicator;