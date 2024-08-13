
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import path from "path";
import { addSTFU } from "../utils/database";
import { loadTranslations } from "../utils/localization";
import { localization } from "../../config.json";


let stfuSpellscord: string = "";
let stfuSpellscordComeback: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.stfuSpellscord) {
        stfuSpellscord = translation.stfuSpellscord;
    }
    if (translation?.stfuSpellscordComeback) {
        stfuSpellscordComeback = translation.stfuSpellscordComeback;
    }
});


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
                let message: string;
                if (duration === 0) {
                    message = stfuSpellscordComeback;
                    gifPath = path.join(__dirname, "../data/pepo-comfy.gif")
                } else {
                    message = stfuSpellscord.replace("%duration", duration.toString());
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