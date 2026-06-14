import type { CustomClient } from "../types/client.type.ts";
import updateMembersCount from "../utilities/updateMembersCount.ts";

export default (client: CustomClient): void => {
  client.on("guildMemberRemove", () => {
    updateMembersCount(client);
  });
};
