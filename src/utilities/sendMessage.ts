import { ChatInputCommandInteraction, Message } from "discord.js";
import type {
  dualContentsType,
  InteractionContent,
  MessageContent,
} from "../types/sendMessage.type.ts";

export async function sendMessage(
  message: Message | undefined,
  interaction: ChatInputCommandInteraction | undefined,
  content: dualContentsType,
) {
  const channel = message?.channel as
    | {
        send?: (payload: MessageContent) => Promise<unknown>;
      }
    | undefined;

  if (channel?.send) {
    return await channel.send(content as MessageContent);
  }

  if (interaction) {
    return await interaction.reply(content as InteractionContent);
  }

  return undefined;
}

export async function sendMessageWaitDelete(
  message: Message | undefined,
  interaction: ChatInputCommandInteraction | undefined,
  content: dualContentsType,
  time: number,
) {
  const reply = await sendMessage(message, interaction, content);
  setTimeout(() => {
    const deletableReply = reply as { delete?: () => Promise<unknown> };
    void deletableReply.delete?.();
  }, time);
}
