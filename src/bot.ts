import { Client } from "discord.js";
import "@std/dotenv/load";
import type { CustomClient, CustomClientOptions } from "./types/client.type.ts";
import { drebinLogger } from "./utilities/logger.ts";
import { registerCommands } from "./utilities/registerCommands.ts";
import { readDirArray } from "./utilities/readDirectory.ts";

drebinLogger.info("Bot is starting...");

const options: CustomClientOptions = {
  prefix: "$",
  intents: [
    "AutoModerationConfiguration",
    "AutoModerationExecution",
    "Guilds",
    "GuildMembers",
    "GuildBans",
    "GuildEmojisAndStickers",
    "GuildIntegrations",
    "GuildWebhooks",
    "GuildInvites",
    "GuildVoiceStates",
    "GuildPresences",
    "GuildMessages",
    "GuildMessageReactions",
    "GuildMessageTyping",
    "GuildModeration",
    "GuildScheduledEvents",
    "MessageContent",
  ],
};

const client = new Client(options) as CustomClient;

async function startBot() {
  client.commands = await registerCommands();

  if (client.commands.size === 0) {
    drebinLogger.warn("No client commands were defined.");
  }

  const events = readDirArray(new URL("./events/", import.meta.url));

  if (events.length > 0) {
    await Promise.all(
      events.map(async (file) => {
        const event = await import(
          new URL(`./events/${file}`, import.meta.url).href
        );
        event.default(client);
      }),
    );
  } else {
    drebinLogger.error("No events were defined.");
  }

  const token = Deno.env.get("TOKEN");
  if (!token) {
    drebinLogger.error("Missing TOKEN environment variable.");
    return;
  }

  client.login(token);
}

await startBot();
