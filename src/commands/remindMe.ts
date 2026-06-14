import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import {
  getIntegerInput,
  getStringInputFromRest,
  normalizeArgs,
} from "../utilities/commandContext.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "remindme",
  description: "Sets a reminder for a certain number of minutes",
  category: "utility",
  options: [
    {
      name: "time",
      type: ApplicationCommandOptionType.Integer,
      description: "The number of minutes to wait before reminding you",
      required: true,
    },
    {
      name: "message",
      type: ApplicationCommandOptionType.String,
      description: "The reminder message",
      required: true,
    },
  ],
  async execute(
    interaction?: ChatInputCommandInteraction,
    message?: Message,
    args?: string[],
  ) {
    const parsedArgs = normalizeArgs(args);
    const minutes = getIntegerInput(interaction, parsedArgs, "time", 0);
    const time = minutes ? minutes * 60 : 0;
    const reminder = getStringInputFromRest(
      interaction,
      parsedArgs,
      "message",
      1,
    );

    if (!time || !reminder) {
      sendMessage(
        message,
        interaction,
        "You must specify both a time (in minutes) and a reminder message",
      );
      return;
    }

    await sendMessage(
      message,
      interaction,
      `Got it! I'll remind you in ${time / 60} minute(s).`,
    );

    setTimeout(() => {
      const channel = message?.channel || interaction?.channel;
      const user = message?.author.id || interaction?.user.id;

      if (!channel || !channel.isTextBased() || !("send" in channel) || !user) {
        return;
      }

      void channel.send(`**Reminder!** "${reminder}" <@!${user}>`);
    }, time * 1000);
  },
} as Command;
