import { ButtonInteraction, ChatInputCommandInteraction, Client, Collection, EmbedBuilder } from "discord.js";
import { untrackThread } from "../utils/database";
import { splitTextIntoChunks, stripCodeBlocksBacksticks } from "../utils/strings";
import constants from "../utils/constants";

/**
 * Event listener for handling chat input command interactions
 */
export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: ButtonInteraction, client:Client, commands: any[]) {
        // Check if the interaction is a chat input command
        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "send-raw":
                    interaction.channel?.messages.fetch({
                        limit: 100,
                        before: interaction.message.id
                    })
                    .then(async (messages) => {
                        messages.set(interaction.message.id, interaction.message);
                        const botAuthoredMessages = messages
                            .reverse()
                            .filter((message) => message.author.bot)
                            .map((message) => stripCodeBlocksBacksticks(message.content))
                            .join("\n");
                            
                        const responseChunks: string[] = splitTextIntoChunks(botAuthoredMessages, constants.MAX_MESSAGE_LENGTH);
                        await interaction.reply(responseChunks[0]!); // use reply for the first message
                        if (responseChunks.length > 1) {
                            for (const chunk of responseChunks.slice(1, responseChunks.length)) {
                                await interaction.channel?.send(chunk); // then send other messages in the usual way
                            }
                        }
                    })
                    break;

                case "archive-thread":
                    const success = untrackThread(interaction.channelId);
                    const embed = new EmbedBuilder()
                        .setColor(0x5a8c3f)
                        .setDescription(success ? "Thread archivé avec succès - il ne sera pas supprimé automatiquement." : "Le thread est déjà archivé.") // TODO: translation
                    interaction.reply({
                        embeds: [embed]
                    })
                    break;

                case "delete-thread":
                    if (interaction.channel?.isThread()) {
                        interaction.deferReply();
                        untrackThread(interaction.channelId);
                        interaction.channel?.delete();
                    }
                    break;

                default:
                    break;
            }
        } 
    },
}
