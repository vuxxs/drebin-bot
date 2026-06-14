import {
  ChannelType,
  Guild,
  PermissionFlagsBits,
  TextChannel,
  User,
} from "discord.js";
import {
  EnsuredPrivateTextChannel,
  PrivateTextChannelOptions,
} from "../interfaces/privateChannel.interface.ts";

const DEFAULT_USER_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ReadMessageHistory,
];

export async function createPrivateTextChannel(
  guild: Guild,
  options: PrivateTextChannelOptions,
): Promise<TextChannel | undefined> {
  try {
    return await guild.channels.create({
      name: sanitizeChannelName(options.name).slice(0, 100),
      type: ChannelType.GuildText,
      topic: options.topic,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: options.botUser.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        ...options.users.map((user) => ({
          id: user.id,
          allow: options.userPermissions ?? DEFAULT_USER_PERMISSIONS,
        })),
      ],
    });
  } catch (_error) {
    return undefined;
  }
}

export async function ensurePrivateTextChannel(
  guild: Guild,
  options: PrivateTextChannelOptions,
): Promise<EnsuredPrivateTextChannel | undefined> {
  const existingChannel = getExistingPrivateTextChannel(guild, options);

  if (existingChannel) {
    await applyPrivateChannelPermissions(existingChannel, guild, options);
    return { channel: existingChannel, created: false };
  }

  const channel = await createPrivateTextChannel(guild, options);
  return channel ? { channel, created: true } : undefined;
}

export async function deleteTextChannel(channel: TextChannel): Promise<void> {
  try {
    await channel.delete();
  } catch (_error) {
    // Fail silently. The caller already has a more useful failure to report.
  }
}

export function buildPrivateChannelName(prefix: string, users: User[]): string {
  return [prefix, ...users.map((user) => user.username)]
    .map(sanitizeChannelName)
    .filter(Boolean)
    .join("-")
    .slice(0, 100);
}

function getExistingPrivateTextChannel(
  guild: Guild,
  options: PrivateTextChannelOptions,
): TextChannel | undefined {
  const existingById = options.existingChannelId
    ? guild.channels.cache.get(options.existingChannelId)
    : undefined;

  if (existingById?.type === ChannelType.GuildText) {
    return existingById;
  }
}

async function applyPrivateChannelPermissions(
  channel: TextChannel,
  guild: Guild,
  options: PrivateTextChannelOptions,
): Promise<void> {
  await channel.permissionOverwrites.edit(guild.roles.everyone.id, {
    ViewChannel: false,
  });

  await channel.permissionOverwrites.edit(options.botUser.id, {
    ViewChannel: true,
    SendMessages: true,
    AddReactions: true,
    ReadMessageHistory: true,
    ManageMessages: true,
  });

  await Promise.all(
    options.users.map((user) =>
      channel.permissionOverwrites.edit(
        user.id,
        mapPermissionBits(options.userPermissions ?? DEFAULT_USER_PERMISSIONS),
      ),
    ),
  );
}

function mapPermissionBits(permissions: bigint[]): Record<string, boolean> {
  return {
    ViewChannel: permissions.includes(PermissionFlagsBits.ViewChannel),
    AddReactions: permissions.includes(PermissionFlagsBits.AddReactions),
    ReadMessageHistory: permissions.includes(
      PermissionFlagsBits.ReadMessageHistory,
    ),
    SendMessages: permissions.includes(PermissionFlagsBits.SendMessages),
  };
}

function sanitizeChannelName(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "user"
  );
}
