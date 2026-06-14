import type { CustomClient } from "../types/client.type.ts";
import { drebinLogger } from "../utilities/logger.ts";
import { MessageFlags } from "discord.js";

export default (client: CustomClient): void => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      drebinLogger.error(error);
      const errorPayload = {
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      } as const;

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(errorPayload);
      } else {
        await interaction.reply(errorPayload);
      }
    }
  });
};
