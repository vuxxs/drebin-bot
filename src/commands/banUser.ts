import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import {
  getInvokingMember,
  getStringInput,
  getTargetUser,
  normalizeArgs,
} from "../utilities/commandContext.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "banuser",
  description: "Ban a member from the server",
  category: "moderation",
  permissions: ["BanMembers"],
  options: [
    {
      name: "target",
      type: ApplicationCommandOptionType.User,
      description: "Select a user to ban",
      required: true,
    },
    {
      name: "reason",
      type: ApplicationCommandOptionType.String,
      description: "Reason for banning the user",
      required: false,
    },
  ],
  async execute(
    interaction?: ChatInputCommandInteraction,
    message?: Message,
    args?: string[],
  ) {
    const parsedArgs = normalizeArgs(args);
    const member = getInvokingMember(interaction, message);
    if (!member) return;

    if (!member.permissions.has("BanMembers")) {
      sendMessage(
        message,
        interaction,
        "You do not have the necessary permissions to use this command.",
      );
      return;
    }

    const targetUser = getTargetUser(interaction, message, parsedArgs);

    if (!targetUser) return;

    const reason =
      getStringInput(interaction, parsedArgs, "reason", 1) ||
      "No reason provided";

    const targetMember = member.guild?.members.cache.get(targetUser.id);

    if (!targetMember) {
      sendMessage(message, interaction, "User not found");
      return;
    }

    try {
      await targetMember.ban({ reason });
      sendMessage(
        message,
        interaction,
        `${targetUser.tag} has been banned for reason: ${reason}`,
      );
    } catch (_error) {
      sendMessage(
        message,
        interaction,
        "Can't ban this member, they might have a role higher than mine",
      );
    }
  },
} as Command;
