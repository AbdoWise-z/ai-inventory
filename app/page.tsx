import {currentUserProfile} from "@/lib/user-profile";
import {redirect} from "next/navigation";
import {auth} from "@clerk/nextjs/server";

export default async function Home() {
  return redirect("/home");
}
