import { ChatInputCommandInteraction, Message } from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "ping",
  description: "Check the bot's response",
  category: "utility",
  execute: (interaction?: ChatInputCommandInteraction, message?: Message) => {
    sendMessage(
      message,
      interaction,
      `Pong! (${interaction?.client.ws.ping || message?.client.ws.ping}ms)`,
    );
  },
} as Command;
