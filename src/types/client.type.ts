import type { Client, ClientOptions } from "discord.js";
import type {
  AdditionalOptions,
  CustomClientProperties,
} from "../interfaces/client.interface.ts";

export type CustomClientOptions = ClientOptions & AdditionalOptions;

export type CustomClient = Client &
  CustomClientProperties & { options: CustomClientOptions };
