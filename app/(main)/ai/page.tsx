import React from 'react';
import {currentUserProfile} from "@/lib/user-profile";

const Page = async () => {
  const user = await currentUserProfile(true);
  return (
    <div className="h-full flex justify-center items-center">
      <center>
        <h1 className={"text-zinc-500"}>{"I can't afford an AI API, so until I do ..."}</h1>
      </center>
    </div>
  );
};

export default Page;