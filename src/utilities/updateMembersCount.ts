import { ActivityType } from "discord.js";
import type { CustomClient } from "../types/client.type.ts";

export default function updateMembersCount(client: CustomClient) {
  const userSet = new Set();
  client.guilds.cache.forEach((guild) => {
    guild.members.cache.forEach((member) => {
      if (!member.user.bot) userSet.add(member.user.id);
    });
  });
  const userCount = userSet.size;

  client.user?.setActivity({
    type: ActivityType.Watching,
    name: `${userCount} users | ${client.options.prefix}help`,
  });
}
