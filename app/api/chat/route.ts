import {NextResponse} from "next/server";
import {currentUserProfile} from "@/lib/user-profile";
import { Message } from "@prisma/client";
import {db} from "@/lib/db";
import {getAIResponseTo} from "@/app/api/chat/helper";

const DefaultPatchSize = 20;
const MaxPatchSize = 40;

export async function GET(req: Request, {
}) {
  try {
    const { searchParams } = new URL(req.url);
    const profile = await currentUserProfile();
    const cursor = searchParams.get("cursor");
    const patch = parseInt(searchParams.get("patch") ?? `${DefaultPatchSize}`);
    const patchSize = patch < MaxPatchSize ? patch : MaxPatchSize;
    if (!profile) {
      return new NextResponse("Unauthorized" , {status: 401});
    }

    let messages: Message[];
    if (cursor){
      messages = await db.message.findMany({
        take: patchSize,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          senderId: profile.id,
        },
        orderBy: {
          createdAt: "desc",
        }
      })
    } else {
      messages = await db.message.findMany({
        take: patchSize,
        where: {
          senderId: profile.id,
        },
        orderBy: {
          createdAt: "desc",
        }
      })
    }

    let nextCursor = null;
    if (messages.length === patchSize){
      nextCursor = messages[patchSize - 1].id;
    }

    return NextResponse.json(
      {
        items: messages,
        nextCursor: nextCursor,
      }
    );
  } catch (error){
    console.log("GET [api/chat]" , error);
    return new NextResponse("Internal Error" , {status: 500, statusText: "Internal Server Error"});
  }
}


export async function POST(req: Request, {
}) {
  try {
    const profile = await currentUserProfile();
    const data = await req.json();
    const content = data["content"];
    if (!profile) {
      return new NextResponse("Unauthorized" , {status: 401});
    }

    if (!content) {
      return new NextResponse("Invalid Params" , {status: 402});
    }

    const userMessage = await db.message.create({
      data: {
        content: content,
        senderId: profile.id,
        role: "User",
      }
    })

    // get the last 20 messages
    const messages = await db.message.findMany({
      take: 20,
      where: {
        senderId: profile.id,
      },
      orderBy: {
        createdAt: "desc",
      }
    })

    const inv = await db.inventoryItem.findMany({
      where: {
        ownerId: profile.id,
      },
    })

    const aiRes = await getAIResponseTo({
      history: messages,
      inventory: inv,
    }) ?? "AI generation failed, please try again";

    let aiResFinal = "";
    let task;
    try {
      const json = JSON.parse(aiRes);
      aiResFinal = json["task_discription"];
      task = json["task"];
      console.log(aiResFinal);
      console.log(task);
    } catch (e){
      aiResFinal = aiRes;
      console.log(aiRes);
      console.log(e);
    }

    const aiMessage = await db.message.create({
      data: {
        content: aiResFinal,
        senderId: profile.id,
        role: "AI",
      }
    })

    return NextResponse.json(
      {
        userMessage: userMessage,
        AiResponse: aiMessage,
        task: task ?? null,
      }
    );
  } catch (error){
    console.log("POST [api/chat]" , error);
    return new NextResponse("Internal Error" , {status: 500, statusText: "Internal Server Error"});
  }
}