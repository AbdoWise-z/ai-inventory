"use client";

import React from 'react';
import SideNav, {SidebarItem} from "@/components/nav/side-nav";
import {FileQuestion, LayoutDashboard, LogOut} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import {Separator} from "@/components/ui/separator";

const SideNavContainer = (
  {
    username,
    userEmail,
  } : {
  username: string,
  userEmail: string,
}
) => {
  const router = useRouter();
  const pathName = usePathname();
  return (
    <SideNav username={username} userEmail={userEmail}>
      <SidebarItem icon={<LayoutDashboard size={20}/>} text={"Dashboard"} active={pathName.endsWith("/home")} alert={false} action={"Nav"} path={"/home"}/>
      <SidebarItem icon={<FileQuestion size={20}/>} text={"AI Suggestions"} active={pathName.endsWith("/ai")} alert={false} action={"Nav"} path={"/ai"}/>
      <Separator className="w-full h-1" />
    </SideNav>
  );
};

export default SideNavContainer;