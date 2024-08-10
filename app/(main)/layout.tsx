import React from 'react';
import SideNavContainer from "@/components/nav/side-nav-container";
import {currentUserProfile} from "@/lib/user-profile";
import InventoryDataProvider from "@/components/providers/inventory-data-provider";
import ModalProvider from "@/components/providers/modal-provider";
import {TooltipProvider} from "@/components/ui/tooltip";
import ChatButton from "@/components/ai/chat-button";
import ChatProvider from "@/components/providers/chat-provider";
import QueryProvider from "@/components/providers/query-provider";

const Layout = async (
  {
    children
  } : {children: React.ReactNode}) => {
  const user = await currentUserProfile(true);

  return (
    <TooltipProvider>
      <InventoryDataProvider>
        <ModalProvider />
        <div className="h-full flex flex-row">
          <SideNavContainer username={user!.name} userEmail={user!.email} />
          <main className="h-full flex-1">
            {children}
          </main>
          <QueryProvider>
            <ChatProvider>
              <ChatButton />
            </ChatProvider>
          </QueryProvider>
        </div>
      </InventoryDataProvider>
    </TooltipProvider>
  );
};

export default Layout;