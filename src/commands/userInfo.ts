import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import { filterUserId } from "../utilities/filterUserId.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "userinfo",
  description: "Displays information about a user",
  category: "utility",
  options: [
    {
      name: "target",
      description: "Select a user",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  execute(
    interaction?: ChatInputCommandInteraction,
    message?: Message,
    args?: string[],
  ) {
    if (!args) args = [];
    // If it's a message but there's no user provided, push original user
    if (args.length === 0 && message) args.push(message.member!.user.id);

    const user =
      interaction?.options.getUser("target", false) ||
      interaction?.user ||
      message?.guild?.members.cache.get(filterUserId(args[0]))?.user;
    if (!user) return;
    const member =
      interaction?.guild?.members.cache.get(user.id)! ||
      message?.guild?.members.cache.get(user.id);

    if (!member) return;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Information`)
      .setColor("#0099ff")
      .addFields(
        { name: "Username", value: user.username, inline: true },
        { name: "User ID", value: user.id, inline: true },
        {
          name: "Joined Discord",
          value: user.createdAt.toDateString(),
          inline: true,
        },
        {
          name: "Joined Server",
          value: member!.joinedAt!.toDateString(),
          inline: true,
        },
        {
          name: "Roles",
          value: member!.roles.cache.map((role) => role.name).join(", "),
          inline: true,
        },
      )
      .setThumbnail(user.avatarURL() || null);

    sendMessage(message, interaction, { embeds: [embed] });
  },
} as Command;
