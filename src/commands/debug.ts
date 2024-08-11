
import { APIApplicationCommandInteraction, ApplicationCommandOptionType, ApplicationCommandType, BaseChannel, BaseInteraction, ChatInputCommandInteraction, CommandInteraction, Events, GuildChannel, Interaction, NonThreadGuildBasedChannel } from "discord.js";
import { benchmark } from "../data/benchmark.json";
import constants from "../utils/constants";
import { splitTextIntoChunks } from "../utils/strings";
import AI from "../ai/AI";
import { isNoMistakesSequence, isThereAnyRelevantCorrection, containsTheExactUserInput } from "../utils/spellscord-responses-management";

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
                        await interaction.channel.send("# Benchmark start:");
                        for (let test of benchmark) {
                            await interaction.channel.send("## User Input:");
                            const userInputChunks: string[] = splitTextIntoChunks(test.userInput, constants.MAX_MESSAGE_LENGTH);
                            for (const chunk of userInputChunks) {
                                await interaction.channel.send(chunk);
                            }
                            
                            interaction.channel.send("## Spellscord answer:");
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
                        // const messages          = await interaction.channel?.messages.fetch();
                        // const firstMessage      = messages?.last();
                        // const embeds            = firstMessage?.embeds;

                        // if (!embeds) {
                        //     await interaction.reply({ content: "No embeds found", ephemeral: true });
                        //     return;
                        // }

                        // const embedInfo         = embeds[0]?.description;
                        // const infoMatch         = embedInfo?.match(/(?<=\*\*Nombre de fois réclamé:\*\* )\d+/);
                        // const author            = embedInfo?.match(/(?<=\*\*Créé par:\*\* )<@\d+>/);

                        // if(!infoMatch){
                        //     await interaction.reply({ content: "Count number not found", ephemeral: true })
                        //     return;
                        // }

                        // const infoValue         = parseInt(infoMatch[0]);

                        // const embedDescription  = embeds[1]?.description;
                        // const descriptionMatch  = embedDescription?.match(/```(.*?)```/s);
                        // const descriptionValue  = descriptionMatch ? descriptionMatch[1] : null;

                        // await interaction.reply({ content: `Count: ${infoValue}\nDescription: ${descriptionValue}\nAuthor: ${author}`, ephemeral: true });
                    }
                }
            ]
        },
        {
            name: "emit",
            description: "Emit an event",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "event",
                    description: "Event to emit",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "channelCreate",
                            value: "channelCreate"
                        }
                    ],
                    required: true,
                }
            ],
            execute: async (interaction: ChatInputCommandInteraction) => {
                const event = interaction.options.getString("event")!;
                if (!(interaction.channel instanceof GuildChannel)) {
                    await interaction.reply({ content: `This command can only be used in a guild channel.`, ephemeral: true });
                    return;
                }
                const channel: NonThreadGuildBasedChannel = interaction.channel;
                interaction.client.emit(event, channel);
                await interaction.reply({ content: `Event ${event} triggered`, ephemeral: true });
            }
        }
    ]
};