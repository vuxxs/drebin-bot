import { ChannelType } from "discord.js";
import { afkStatuses } from "../consts/afk.ts";
import { CustomClient } from "../interfaces/client.interface.ts";
import { drebinLogger } from "../utilities/logger.ts";

export default (client: CustomClient): void => {
  client.on("messageCreate", async (message) => {
    if (
      message.channel.type !== ChannelType.GuildText ||
      message.author.id === client.user!.id ||
      !client.commands
    ) {
      return;
    }

    if (afkStatuses[message.author.id]) {
      delete afkStatuses[message.author.id];
      await message.reply("Welcome back, your AFK status has been removed.");
    }

    for (const [userId, reason] of Object.entries(afkStatuses)) {
      if (message.mentions.users.has(userId)) {
        await message.reply(`<@${userId}> is currently AFK. Reason: ${reason}`);
      }
    }

    if (!message.content.startsWith(client.options.prefix)) return;

    const args = message.content
      .slice(client.options.prefix.length)
      .trim()
      .split(/ +/);

    const commandName = args.shift()?.toLowerCase();

    const command = client.commands.get(commandName!);

    if (!command) return;

    try {
      await command.execute(undefined, message, args);
    } catch (err) {
      drebinLogger.error(`Error executing command "${commandName}": ${err}`);
      message.channel.send("An error occured while executing the command.");
    }
  });
};
