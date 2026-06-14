// Removing this from the final product is a violation of the code's usage
import { ChatInputCommandInteraction, Message } from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "invite",
  description: "Receive an invite to the bot's official server",
  category: "utility",
  execute: (interaction?: ChatInputCommandInteraction, message?: Message) => {
    sendMessage(message, interaction, "https://discord.gg/3JqRyPCvuZ");
  },
} as Command;
