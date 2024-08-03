import React from 'react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  className?: string;
  fallback?: string;
}

const UserAvatar = (
  {
    src, className, fallback
  } : UserAvatarProps
) => {
  return (
    <Avatar className={
      cn(
        "h-7 w-7 md:h-10 md:w-10",
        className
      )
    }>
      <AvatarImage src={src}/>
      {fallback && <AvatarFallback>fallback</AvatarFallback>}
    </Avatar>
  );
};

export default UserAvatar;