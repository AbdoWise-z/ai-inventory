import {currentUserProfile} from "@/lib/user-profile";
import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import { HfInference } from "@huggingface/inference";

export const GET = async (req: Request) => {
  try {
    const profile = await currentUserProfile(false);

    if (!profile) {
      return new NextResponse("Unauthorized" , {status: 401});
    }

    const items = await db.inventoryItem.findMany({
      where: {
        ownerId: profile.id,
      },
      take: 20,
    });

    const inference = new HfInference(process.env.HUGGING_FACE_KEY);

    let result = "";
    let requestMSG = "I'm having these items: \n";

    for (const item of items){
      requestMSG = requestMSG + `${item.count} x ${item.name}\n`;
    }

    requestMSG = requestMSG + "what can I make with them ?";

    for await (const chunk of inference.chatCompletionStream({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [
        {
          role: "user",
          content: requestMSG
        },
      ],
      max_tokens: 500,
    })) {
      result = result + chunk.choices[0]?.delta?.content || "";
    }

    console.log(result);

    return NextResponse.json({
      response: result
    });

  } catch (error){
    console.log("GET [api/inventory]" , error);
    return new NextResponse("Internal Error" , {status: 500, statusText: "Internal Server Error"});
  }
}
