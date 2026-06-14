import { TextChannel, User } from "discord.js";

export interface PrivateTextChannelOptions {
  botUser: User;
  existingChannelId?: string;
  name: string;
  topic?: string;
  users: User[];
  userPermissions?: bigint[];
}

export interface EnsuredPrivateTextChannel {
  channel: TextChannel;
  created: boolean;
}
