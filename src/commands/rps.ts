import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import type { Command } from "../interfaces/command.interface.ts";
import { getStringInput } from "../utilities/commandContext.ts";
import { sendMessage } from "../utilities/sendMessage.ts";

export default {
  name: "rps",
  description: "Play a game of rock paper scissors with the bot",
  category: "fun",
  options: [
    {
      name: "choice",
      type: ApplicationCommandOptionType.String,
      description: "Your choice",
      required: true,
      choices: [
        { name: "rock", value: "rock" },
        { name: "paper", value: "paper" },
        { name: "scissors", value: "scissors" },
      ],
    },
  ],
  execute(
    interaction?: ChatInputCommandInteraction,
    message?: Message,
    args?: string[],
  ) {
    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const userChoice = getStringInput(interaction, args, "choice", 0);
    const exists = choices.find((value: string) => userChoice === value);

    if (
      !userChoice ||
      /* Don't check for exists if it's an interaction, exists is undefined */
      (!exists && !interaction)
    ) {
      sendMessage(
        message,
        interaction,
        "You didn't choose a value! Use either rock, paper or scissors.",
      );
      return;
    }

    let result;
    if (botChoice == userChoice) {
      result = `**It's a draw!** Both of us chose ${botChoice}`;
    } else if (
      (botChoice === "rock" && userChoice === "scissors") ||
      (botChoice === "scissors" && userChoice === "paper") ||
      (botChoice === "paper" && userChoice === "rock")
    ) {
      result = `**I win!** I chose ${botChoice}`;
    } else {
      result = `**You win!** I chose ${botChoice}`;
    }

    sendMessage(message, interaction, result);
  },
} as Command;
