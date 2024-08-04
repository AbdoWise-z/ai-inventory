import React from 'react';
import {currentUserProfile} from "@/lib/user-profile";
import SuggestionsArea from "@/components/ai/suggestions-area";

const Page = async () => {
  const user = await currentUserProfile(true);
  return (
    <SuggestionsArea />
  );
};

export default Page;