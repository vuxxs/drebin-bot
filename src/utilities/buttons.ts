import { ComponentType, Message, MessageFlags, User } from "discord.js";

export async function waitForButtonClickAcceptInvite(
  message: Message,
  user: User,
  customId: string,
  timeoutMs: number,
): Promise<boolean> {
  let accepted = false;
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeoutMs,
  });

  return await new Promise<boolean>((resolve) => {
    collector.on("collect", async (interaction) => {
      if (interaction.customId !== customId) {
        return;
      }

      if (interaction.user.id !== user.id) {
        await interaction.reply({
          content: `Only <@${user.id}> can accept this invite.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      accepted = true;
      await interaction.deferUpdate();
      collector.stop("accepted");
    });

    collector.once("end", () => {
      resolve(accepted);
    });
  });
}
