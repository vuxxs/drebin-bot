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
  name: "kickuser",
  description: "Kick a member from the server",
  category: "moderation",
  permissions: ["KickMembers"],
  options: [
    {
      name: "target",
      type: ApplicationCommandOptionType.User,
      description: "Select a user to kick",
      required: true,
    },
    {
      name: "reason",
      type: ApplicationCommandOptionType.String,
      description: "Reason for kicking the user",
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

    if (!member.permissions.has("KickMembers")) {
      sendMessage(
        message,
        interaction,
        "You do not have the necessary permissions to use this command.",
      );
      return;
    }

    const targetUser = getTargetUser(interaction, message, parsedArgs);
    const reason =
      getStringInput(interaction, parsedArgs, "reason", 1) ||
      "No reason provided";

    if (!targetUser) return;

    const targetMember = member.guild?.members.cache.get(targetUser.id);

    if (!targetMember) {
      sendMessage(message, interaction, "User not found");
      return;
    }

    try {
      await targetMember.kick(reason);
      sendMessage(
        message,
        interaction,
        `${targetUser.tag} has been kicked for reason: ${reason}`,
      );
    } catch (_error) {
      sendMessage(
        message,
        interaction,
        "Can't kick this member, they might have a role higher than mine",
      );
    }
  },
} as Command;
