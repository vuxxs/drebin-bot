import type { Client, ClientOptions } from "discord.js";
import type { Command } from "./command.interface.ts";

export interface AdditionalOptions extends ClientOptions {
  prefix: string;
}

export interface CustomClientProperties extends Client {
  commands: Map<string, Command>;
}
