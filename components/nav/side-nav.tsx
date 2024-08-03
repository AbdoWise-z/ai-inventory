"use client";

import React, {createContext, ReactNode, useContext, useState} from 'react';
import {ChevronFirst, ChevronLast, MoreVertical} from "lucide-react";
import {useRouter} from "next/navigation";
import {UserButton} from "@clerk/nextjs";

type SideNavContextProps = {
  expanded: boolean
}

const SideNavContext = createContext<SideNavContextProps>({
  expanded: false,
});

export default function SideNav(
  {
    children,
    username,
    userEmail,
  } : {
    children: React.ReactNode;
    username: string,
    userEmail: string,
}) {
  const [expanded, setExpanded] = useState(true)
  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <span
            className={`overflow-hidden transition-all font-bold ${
              expanded ? "w-32" : "w-0"
            }`}
          >My Inventory</span>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SideNavContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SideNavContext.Provider>

        <div className="border-t flex p-3">
          <UserButton/>
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
          `}
          >
            <div className="leading-4">
              <h4 className="font-semibold">{username}</h4>
              <span className="text-xs text-gray-600">{userEmail}</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  )
}

export function SidebarItem(
  { icon, text, active, alert , action , path } : {
    icon: ReactNode,
    text: string,
    active: boolean,
    alert: boolean,
    action: "Nav" | "Logout",
    path?: string
}) {

  const { expanded } = useContext(SideNavContext)
  const router = useRouter();

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
        active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
      }
    `}
      onClick={() => {
        if (action == "Nav"){
          router.push(path ?? "/");
        }
      }}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  )
}
