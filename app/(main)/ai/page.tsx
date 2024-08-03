import React from 'react';
import {currentUserProfile} from "@/lib/user-profile";

const Page = async () => {
  const user = await currentUserProfile(true);
  return (
    <div>
      Welcome to AI {user!.name}.
    </div>
  );
};

export default Page;