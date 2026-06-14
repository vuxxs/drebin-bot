import type { CustomClient } from "../types/client.type.ts";
import { drebinLogger } from "../utilities/logger.ts";
import updateMembersCount from "../utilities/updateMembersCount.ts";

export default (client: CustomClient): void => {
  client.on("guildDelete", (guild) => {
    drebinLogger.info(`Removed from guild: ${guild.name} (id: ${guild.id}).`);

    updateMembersCount(client);
  });
};
