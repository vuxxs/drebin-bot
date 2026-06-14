import type { CustomClient } from "../types/client.type.ts";
import { drebinLogger } from "../utilities/logger.ts";
import { MessageFlags, type RepliableInteraction } from "discord.js";

export default (client: CustomClient): void => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      drebinLogger.error(error);
      await replyToInteractionError(
        interaction,
        "There was an error while executing this command!",
      );
    }
  });
};

async function replyToInteractionError(
  interaction: RepliableInteraction,
  content: string,
): Promise<void> {
  const errorPayload = {
    content,
    flags: MessageFlags.Ephemeral,
  } as const;

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(errorPayload);
      return;
    }

    await interaction.reply(errorPayload);
  } catch (error) {
    drebinLogger.error(error);
  }
}
