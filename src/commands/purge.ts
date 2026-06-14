import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  Message,
  MessageFlags,
  TextChannel,
} from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import {
  getIntegerInput,
  getInvokingMember,
  normalizeArgs,
} from "../utilities/commandContext.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "purge",
  description: "Delete a certain number of messages in a channel",
  category: "moderation",
  permissions: ["ManageMessages"],
  options: [
    {
      name: "amount",
      type: ApplicationCommandOptionType.Integer,
      description: "Number of messages to delete",
      required: true,
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

    if (!member.permissions.has("ManageMessages")) {
      sendMessage(
        message,
        interaction,
        "You do not have the necessary permissions to use this command.",
      );
      return;
    }

    const amount = getIntegerInput(interaction, parsedArgs, "amount", 0);

    if (!amount) {
      sendMessage(message, interaction, {
        content: "Invalid number of messages to delete.",
      });

      return;
    }

    const channel = interaction?.channel || message?.channel;
    if (!channel) return;
    if (
      channel.type === ChannelType.DM ||
      channel.type !== ChannelType.GuildText
    ) {
      sendMessage(
        message,
        interaction,
        "Command can only be used in text channels.",
      );

      return;
    }

    const textChannel = channel as TextChannel;
    try {
      const limit = Math.min(amount, 100); // limit to 100, max amount allowed for bulkDelete
      const fetchedMessages = textChannel.messages.fetch({ limit });

      const deletableMessages = (await fetchedMessages).filter(
        (message) =>
          Date.now() - message.createdTimestamp < 14 * 24 * 60 * 60 * 1000,
      );

      await textChannel.bulkDelete(deletableMessages, true);
      setTimeout(async () => {
        const reply = interaction
          ? await (interaction.deferred || interaction.replied
              ? interaction.followUp({
                  content: `${limit} messages deleted.`,
                  flags: MessageFlags.Ephemeral,
                })
              : interaction.reply({
                  content: `${limit} messages deleted.`,
                  flags: MessageFlags.Ephemeral,
                }))
          : await textChannel.send(`${limit} messages deleted.`);
        setTimeout(() => reply?.delete(), 5000);
      }, 1000); // Delay confirmation message to have enough time to delete everything and avoid crashes
    } catch (_error) {
      sendMessage(
        message,
        interaction,
        "An error occurred while trying to delete messages",
      );
    }
  },
} as Command;
