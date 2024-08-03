import React from 'react';
import SideNavContainer from "@/components/nav/side-nav-container";
import {currentUserProfile} from "@/lib/user-profile";

const Layout = async (
  {
    children
  } : {children: React.ReactNode}) => {
  const user = await currentUserProfile(true);

  return (
    <div className="h-full flex flex-row">
      <SideNavContainer username={user!.name} userEmail={user!.email} />
      <main className="h-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;