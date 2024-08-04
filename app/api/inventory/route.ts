import {currentUserProfile} from "@/lib/user-profile";
import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {id} from "postcss-selector-parser";

export const POST = async (req: Request) => {
  try {
    const {name , count} = await req.json();
    const profile = await currentUserProfile(false);

    if (!profile) {
      return new NextResponse("Unauthorized" , {status: 401});
    }

    if (!name || !count || count < 1){
      return new NextResponse("Invalid input", {status: 402});
    }

    const exists = await db.inventoryItem.findFirst({
      where: {
        name: name,
        ownerId: profile.id,
      }
    });

    if (exists){
      const item = await db.inventoryItem.update({
        where: {
          id: exists.id,
        },
        data: {
          count: exists.count + count,
        },
      });

      return NextResponse.json(item);
    }

    const item = await db.inventoryItem.create({
      data: {
        ownerId: profile.id,
        name: name,
        count: count,
      }
    });

    return NextResponse.json(item);
  } catch (error){
    console.log("POST [api/inventory]" , error);
    return new NextResponse("Internal Error" , {status: 500, statusText: "Internal Server Error"});
  }
}

export const GET = async (req: Request) => {
  try {
    const profile = await currentUserProfile(false);

    if (!profile) {
      return new NextResponse("Unauthorized" , {status: 401});
    }

    const items = await db.inventoryItem.findMany({
      where: {
        ownerId: profile.id,
      }
    });

    return NextResponse.json(items);
  } catch (error){
    console.log("GET [api/inventory]" , error);
    return new NextResponse("Internal Error" , {status: 500, statusText: "Internal Server Error"});
  }
}

export const PATCH = async (req: Request) => {
  try {
    const {id, name , count} = await req.json();
    const profile = await currentUserProfile(false);

    if (!profile) {
      return new NextResponse("Unauthorized" , {status: 401});
    }

    if (!id || !name || !count || count < 1){
      return new NextResponse("Invalid input", {status: 402});
    }

    const exists = await db.inventoryItem.findUnique({
      where: {
        id: id,
        ownerId: profile.id, //must check the profile id too
      }
    });

    if (exists){
      const item = await db.inventoryItem.update({
        where: {
          id: exists.id,
        },
        data: {
          count: count,
          name: name,
        },
      });

      return NextResponse.json(item);
    } else {
      return new NextResponse("Not Found" , {status: 404});
    }
  } catch (error){
    console.log("PATCH [api/inventory]" , error);
    return new NextResponse("Internal Error" , {status: 500, statusText: "Internal Server Error"});
  }
}

export const DELETE = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const ids = searchParams.getAll("ids");
    const profile = await currentUserProfile(false);

    if (!profile) {
      return new NextResponse("Unauthorized" , {status: 401});
    }

    if (!ids){
      return new NextResponse("Invalid input", {status: 402});
    }

    const {count} = await db.inventoryItem.deleteMany({
      where: {
        id: {
          in: ids
        },
        ownerId: profile.id,
      }
    })


    return NextResponse.json({
      count: count,
    });
  } catch (error){
    console.log("PATCH [api/inventory]" , error);
    return new NextResponse("Internal Error" , {status: 500, statusText: "Internal Server Error"});
  }
}