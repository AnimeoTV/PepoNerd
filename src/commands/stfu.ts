
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import path from "path";
import { addSTFU } from "../utils/database";
import { loadTranslations } from "../utils/localization";
import { localization } from "../../config.json";


let stfuPepoNerd: string = "";
let stfuPepoNerdComeback: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.stfuPepoNerd) {
        stfuPepo Nerd = translation.stfuPepoNerd;
    }
    if (translation?.stfuPepoNerdComeback) {
        stfuPepoNerdComeback = translation.stfuPepoNerdComeback;
    }
});


export default {
    name: "stfu",
    description: "Shut the fuck up",
    options: [
        {
            name: "pepo-nerd",
            description: "Shut the fuck up Pepo Nerd",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "duration",
                    description: "For how many hours will Pepo Nerd be mute (0 to cancel)",
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                }
            ],
            execute: async (interaction: ChatInputCommandInteraction) => {
                const duration = interaction.options.getInteger("duration") ?? 1
                addSTFU(interaction.user.id, duration);
                let gifPath: string;
                let message: string;
                if (duration === 0) {
                    // stfu cleared
                    message = stfuPepoNerdComeback;
                    gifPath = path.join(__dirname, "../data/pepo-comfy.gif")
                } else {
                    // stfued
                    message = stfuPepoNerd.replace("%duration", duration.toString());
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