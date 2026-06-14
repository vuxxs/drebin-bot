import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import type { CustomClient } from "../types/client.type.ts";
import { ApplicationCommandType } from "discord.js";
import { readDirArray } from "./readDirectory.ts";
import { drebinLogger } from "./logger.ts";
import type { Command } from "../interfaces/command.interface.ts";

export const registerSlashCommands = async (
  client: CustomClient,
  clientId: string,
  _guildId?: string,
) => {
  const commands = Array.from(client.commands.values()).map((command) => {
    return {
      name: command.name,
      description: command.description,
      options: command.options || [],
      type: ApplicationCommandType.ChatInput,
    };
  });

  const token = Deno.env.get("TOKEN");
  if (!token) {
    drebinLogger.error("Missing TOKEN environment variable.");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    drebinLogger.info("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    drebinLogger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    drebinLogger.error(error);
  }
};

export const registerCommands = async (): Promise<Map<string, Command>> => {
  const commands = new Map<string, Command>();

  const commandFiles = readDirArray(new URL("../commands/", import.meta.url));

  // Run even if the directory isn't found
  for (const file of commandFiles) {
    const commandModule = await import(
      new URL(`../commands/${file}`, import.meta.url).href
    );
    const command = commandModule.default as Command;
    commands.set(command.name, command);
  }

  return commands;
};
