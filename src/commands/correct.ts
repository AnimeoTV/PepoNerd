
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, Colors, EmbedBuilder } from "discord.js";
import { analyzeAndCorrectMessage, sendCorrection } from "../helpers/core-feature";
import { loadTranslations } from "../utils/localization";
import { localization } from "../../config.json";


let correctMessageReplyMessageContainsMistakes: string = "";
let correctMessageReplynoNotableMistakes: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.correctMessageReplyMessageContainsMistakes) {
        correctMessageReplyMessageContainsMistakes = translation.correctMessageReplyMessageContainsMistakes;
    }
    if (translation?.correctMessageReplynoNotableMistakes) {
        correctMessageReplynoNotableMistakes = translation.correctMessageReplynoNotableMistakes;
    }
});

export default {
    name: "correct",
    description: "Correct the selected message",
    options: [
        {
            name: "message",
            description: "The message to correct",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message_link",
                    description: "Link to the target message",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "force",
                    description: "Send the report even if the message is correct",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                }
            ],
            execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
                try {
                    const messageLink = interaction.options.getString("message_link")?.trim();
                    const force = interaction.options.getBoolean("force") ?? false;
                    if (!messageLink) {
                        throw new Error("No link provided");
                    }

                    // Extract information from the message link
                    const regex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
                    const match = messageLink.match(regex);

                    if (!match) {
                        throw new Error("Invalid link");
                    }

                    const channelId = match[2];
                    const messageId = match[3];

                    // Channel recovery
                    const channel = await interaction.guild?.channels.fetch(channelId ?? "");
                    if (!channel || !channel.isTextBased()) {
                        throw new Error("Channel not found or non-textual");
                    }

                    // Message recovery
                    const message = await channel.messages.fetch(messageId ?? "");
                    if (!message) {
                        throw new Error("Message not found");
                    }

                    await interaction.deferReply({ ephemeral: true })
                    const analysisReport = await analyzeAndCorrectMessage(message);
                    if (analysisReport && (analysisReport.correctionNeeded || force)) {
                        const threadChannel = await sendCorrection(analysisReport, interaction.client, interaction.channel ?? undefined);
                        if (threadChannel) {
                            const redirectToThreadEmbed = new EmbedBuilder()
                                .setColor(0x5a8c3f)
                                .setDescription(`${correctMessageReplyMessageContainsMistakes} https://discord.com/channels/${threadChannel.guildId}/${threadChannel.id}/${threadChannel.id}`)
                            interaction.editReply({
                                embeds: [redirectToThreadEmbed]
                            })
                        }
                    } else {
                        const noNotableMistakes = new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription(correctMessageReplynoNotableMistakes)
                        interaction.editReply({
                            embeds: [noNotableMistakes]
                        })
                    }
                } catch (error) {
                    console.error(error);
                    const errorEmbed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription("**" + (error?.toString() ?? "Unknown error") + "**")

                    interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                }
            }
        }
    ]
};