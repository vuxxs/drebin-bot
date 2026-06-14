import type { CustomClient } from "../types/client.type.ts";
import { drebinLogger } from "../utilities/logger.ts";
import updateMembersCount from "../utilities/updateMembersCount.ts";

export default (client: CustomClient): void => {
  client.on("guildCreate", (guild) => {
    drebinLogger.info(`Joined Guild: ${guild.name} ID: ${guild.id}`);

    drebinLogger.info(
      `Joined new guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members.`,
    );

    updateMembersCount(client);
  });
};
