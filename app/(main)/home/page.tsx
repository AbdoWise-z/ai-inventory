import React from 'react';
import {currentUserProfile} from "@/lib/user-profile";
import {InventoryItemsTable} from "@/components/home/items-table";

const Page = async () => {
  const user = await currentUserProfile(true);
  return (
    <div className="flex flex-col w-full h-full bg-zinc-50 p-4 overflow-auto">
      <h1 className={"font-bold text-xl"}>Your Inventory Items:</h1>
      <InventoryItemsTable/>
    </div>
  );
};

export default Page;