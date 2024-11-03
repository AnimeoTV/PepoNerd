
import { APIApplicationCommandInteraction, ApplicationCommandOptionType, ApplicationCommandType, BaseChannel, BaseInteraction, ChatInputCommandInteraction, CommandInteraction, Events, GuildChannel, Interaction, NonThreadGuildBasedChannel } from "discord.js";
import { benchmark } from "../data/benchmark.json";
import constants from "../utils/constants";
import { splitTextIntoChunks } from "../utils/strings";
import AI from "../ai/AI";
import { isNoMistakesSequence, isThereAnyRelevantCorrection, containsTheExactUserInput } from "../utils/pepo-nerd-responses-management";

export default {
    name: "debug",
    description: "Debug tools for developers",
    options: [
        {
            name: "prompt",
            description: "Test for prompts",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "benchmark",
                    description: "Run a benchmark to test the current prompt",
                    type: ApplicationCommandOptionType.Subcommand,
                    execute: async (interaction: ChatInputCommandInteraction) => {
                        if (!interaction.channel) return;
                        await interaction.deferReply();
                        interaction.deleteReply();
                        await interaction.channel.send("# Benchmark start:");
                        for (let test of benchmark) {
                            await interaction.channel.send("## User Input:");
                            const userInputChunks: string[] = splitTextIntoChunks(test.userInput, constants.MAX_MESSAGE_LENGTH);
                            for (const chunk of userInputChunks) {
                                await interaction.channel.send(chunk);
                            }

                            interaction.channel.send("## Pepo Nerd answer:");
                            const response = (await AI.generate(test.userInput));
                            if (isNoMistakesSequence(response) || !isThereAnyRelevantCorrection(test.userInput, response)) {
                                await interaction.channel.send("[No mistakes]");
                            } else {
                                const responseChunks: string[] = splitTextIntoChunks(response, constants.MAX_MESSAGE_LENGTH);
                                for (const chunk of responseChunks) {
                                    await interaction.channel.send(chunk);
                                }
                            }

                            await interaction.channel.send("## -------------------");
                        }
                        await interaction.channel.send("# Benchmark end");
                    }
                }
            ]
        }
    ]
};