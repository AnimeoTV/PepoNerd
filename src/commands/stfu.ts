
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import path from "path";
import { addSTFU } from "../utils/database";

export default {
    name: "stfu",
    description: "Shut the fuck up",
    options: [
        {
            name: "spellscord",
            description: "Shut the fuck up Spellscord",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "duration",
                    description: "For how many hours will Spellscord be mute (0 to cancel)",
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                }
            ],
            execute: async (interaction: ChatInputCommandInteraction) => {
                const duration = interaction.options.getInteger("duration") ?? 1
                addSTFU(interaction.user.id, duration);
                let gifPath: string;
                let message: string; // TODO: translation
                if (duration === 0) {
                    message = `Spellscord est de retour pour vous servir <:pepo_nerd:1269678622583554119>\n-# Note : cela ne s'applique qu'à vous`;
                    gifPath = path.join(__dirname, "../data/pepo-comfy.gif")
                } else {
                    message = `Vous avez envoyé Spellscord au coin pour ${duration}h.\n-# Note : cela ne s'applique qu'à vous`;
                    gifPath = path.join(__dirname, "../data/pepo-go-away.gif")
                }
                await interaction.reply({
                    content: message,
                    files: (gifPath ? [gifPath] : undefined),
                    ephemeral: true })
            }
        }
    ]
};