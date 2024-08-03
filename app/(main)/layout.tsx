import React from 'react';
import SideNavContainer from "@/components/nav/side-nav-container";
import {currentUserProfile} from "@/lib/user-profile";
import InventoryDataProvider from "@/components/providers/inventory-data-provider";
import ModalProvider from "@/components/providers/modal-provider";

const Layout = async (
  {
    children
  } : {children: React.ReactNode}) => {
  const user = await currentUserProfile(true);

  //TODO:
  // make adding items responsive
  // add the ai stuff
  // implement other logic
  // fox this shit
  return (
    <InventoryDataProvider>
      <ModalProvider />
      <div className="h-full flex flex-row">
        <SideNavContainer username={user!.name} userEmail={user!.email} />
        <main className="h-full flex-1">
          {children}
        </main>
      </div>
    </InventoryDataProvider>
  );
};

export default Layout;