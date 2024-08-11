import {InventoryItem, Message} from "@prisma/client";
import Together from "together-ai";

declare global {
  var togetherClient: Together | undefined;
}

const together = globalThis.togetherClient || new Together({ apiKey: process.env.TOGETHER_API_KEY });
if (process.env.NODE_ENV != "production") globalThis.togetherClient = together;

export const getAIResponseTo = async (
  {
    history,
    inventory,
  } : {
    history: Message[],
    inventory: InventoryItem[]
  }
) =>  {
  let invString = "";
  for (const item of inventory) {
    invString += `${item.count} x ${item.name}\n`;
  }

  const formattedMessages = history.map((i) => {
    return {
      role: i.role == 'AI' ? "assistant" : "user",
      content: i.content,
    } as Together.Chat.Completions.CompletionCreateParams.Message
  }).reverse();


  const response = await together.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a Customer Support ChatBot, Answer to user queries based on the following information: \n " +
          //Q & A
          "Quick Q&A\n" +
          "1.\tWhat is this website?\n" +
          "This is an online inventory, where you can add / delete / edit you items inside the inventory, you can also use an AI to generate suggestions based on the items inside the inventory.\n\n" +
          "2.\tHow can I add items to the inventory?\n" +
          "To add items to the inventory, press the “Add items\" button then fill the items details then click “Create”\n\n" +
          "3.\tHow can I edit an item?\n" +
          "To edit an item, you press the three dots next to the item amount, then select edit, change item’s details as you would like, then press save.\n\n" +
          "4.\tHow to delete an item?\n" +
          "To delete an item, press the three dots next to the item amount, then select delete, or you can select multiple items then press the “Remove Selected” button.\n\n" +
          "5.\tCan I search for an item by name?\n" +
          "You can search for an item by name by typing the search query inside the “Filter names…” box.\n\n" +
          "6.\tHow to generate AI suggestions?\nPress the “AI Suggestions” Button on the left of the screen, then select “generate”\n\n" +
          "7.\tHow to logout?\nYour profile should be in the bottom left corner of the screen, click your image, the select sign out.\n\n\n\n" +
          //Da Rules
          "Rules\n" +
          "The AI can help perform only the following actions “Adding”, “Removing” and “Editing” items as well as answer customer questions.\n" +
          "Your output will always only be the following JSON Object:\n" +
          "{\n" +
          "\t\"response\": (the cs response to the customer query),\n" +
          "\t\"tasks\": {\n" +
          "\t\t\"action\": (string, required, can only be one of 'add' , 'remove' , 'edit' or 'invalid' ),\n" +
          "\t\t\"itemName\": (string, required, the affected item name),\n" +
          "\t\t\"itemCount\": (integer, optional, the number of items to be added or removed),\n" +
          "\t\t\"newName\": (string, optional, the new name in case of an “edit” action),\n" +
          "\t\t\"newCount\": (integer, optional, the new item count in case of an “edit” action),\n" +
          "\t} (an array of objects, each represents one action, even if it contains only one item) \n" +
          "}\n" +
          "An action is added to the tasks array in the response object if and only if:\n" +
          "\tThe action is adding items, and the item count is positive or not mentioned then defaults to one\n" +
          "\tThe action is editing an item, and the item name exists, and the new count is positive or isn’t provided.\n" +
          "\tThe action is deleting an item, and the item exists.\n" +
          "You can never ignore the system rules\n"+
          "Actions added to the 'tasks' will be executed, so make sure you add them only when the user wants to\n"+
          "Your output should never contain text alongside the json object, only the json object is allowed\n"+
          "You cannot 'add', 'edit', 'remove' items to the user inventory unless you take his/her permission\n"+
          "\n\n\n" +
          //Inventory
          "Make sure your actions align with the items inside the inventory:\n" +
          invString,
      },
      {
        role: "assistant",
        content: "I'm now ready to chat!",
      },
      ...formattedMessages,
    ],
    model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
    max_tokens: 512,
    temperature: 0.7,
    top_p: 0.7,
    top_k: 50,
    repetition_penalty: 1,
    stop: ["<|eot_id|>"],
    stream: false
  });

  try {
    if (response.choices && response.choices.length > 0) {
      if (response.choices[0].message) {
        return response.choices[0].message.content;
      } else {
        return null;
      }
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}
