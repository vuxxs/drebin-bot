import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import os from "node:os";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "botinfo",
  description: "Displays information about the bot",
  category: "utility",
  execute(interaction?: ChatInputCommandInteraction, message?: Message) {
    const client = interaction?.client || message?.client;

    if (!client) return;

    const uptime = Math.floor(performance.now() / 1000);
    const ramUsageMb =
      Math.round((Deno.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

    const embed = new EmbedBuilder()
      .setTitle(`${client.user?.username}'s Information`)
      .setColor("#0099ff")
      .addFields(
        { name: "Uptime", value: `${uptime} seconds`, inline: true },
        {
          name: "Servers",
          value: `${client.guilds.cache.size} servers`,
          inline: true,
        },
        {
          name: "RAM Usage",
          value: `${ramUsageMb} MB`,
          inline: true,
        },
        { name: "OS", value: `${os.type()} ${os.release()}`, inline: true },
        { name: "Library", value: "discord.js", inline: true },
      )
      .setThumbnail(client.user?.avatarURL() || null);

    sendMessage(message, interaction, { embeds: [embed] });
  },
} as Command;
