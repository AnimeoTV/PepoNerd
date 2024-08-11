import { ButtonInteraction, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { untrackThread } from "../utils/database";

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
                case "archive-thread":
                    const success = untrackThread(interaction.channelId);
                    const embed = new EmbedBuilder()
                        .setDescription(success ? "Thread archivé avec succès" : "Une erreur inconnue est survenue") // TODO: translation
                    interaction.reply({
                        embeds: [embed]
                    })
                    break;

                case "delete-thread":
                    if (interaction.channel?.isThread()) {
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
