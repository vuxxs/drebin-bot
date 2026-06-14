import type {
  InteractionReplyOptions,
  MessageCreateOptions,
  MessagePayload,
} from "discord.js";

export type MessageContent = string | MessagePayload | MessageCreateOptions;

export type InteractionContent =
  | string
  | MessagePayload
  | InteractionReplyOptions;

export type dualContentsType = MessageContent | InteractionContent;
