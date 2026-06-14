import { ChatInputCommandInteraction, Message } from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "dice",
  description: "Roll a virtual dice",
  category: "fun",
  execute(interaction?: ChatInputCommandInteraction, message?: Message) {
    const result = Math.floor(Math.random() * 6) + 1;
    sendMessage(message, interaction, `You rolled ${result}.`);
  },
} as Command;
