import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import type { CustomClient } from "../types/client.type.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "help",
  description: "Displays a list of all available commands",
  category: "utility",
  execute(
    interaction?: ChatInputCommandInteraction,
    message?: Message,
    _args?: string[], // Use it for command categories
  ) {
    const client =
      (interaction?.client as CustomClient) ||
      (message?.client as CustomClient);
    if (!client) return;
    const commands = client.commands;

    if (!commands) return;

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Bot Commands")
      .setDescription("Here are the commands you can use with this bot:")
      .setFooter({
        text: `Use /<command> or ${client.options.prefix}<command> to execute a command`,
      });

    commands.forEach((command: Command) => {
      embed.addFields({ name: command.name, value: command.description });
    });

    sendMessage(message, interaction, { embeds: [embed] });
  },
} as Command;
