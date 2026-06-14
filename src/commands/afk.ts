import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import { afkStatuses } from "../consts/afk.ts";
import type { Command } from "../interfaces/command.interface.ts";

export default {
  name: "afk",
  description: "Set your AFK status",
  category: "utility",
  options: [
    {
      name: "reason",
      type: ApplicationCommandOptionType.String,
      description: "The reason you are AFK",
      required: false,
    },
  ],
  async execute(
    interaction?: ChatInputCommandInteraction,
    message?: Message,
    args?: string[],
  ) {
    const reason =
      interaction?.options.getString("reason") ||
      args?.join(" ") ||
      "No reason given";

    const userId = interaction?.user.id || message?.author.id;
    if (!userId) return;

    afkStatuses[userId] = reason;

    await interaction?.reply(`You are now AFK: ${reason}`);
    const reply = await message?.reply(`You are now AFK: ${reason}`);
    setTimeout(() => reply?.delete(), 5000);
  },
} as Command;
