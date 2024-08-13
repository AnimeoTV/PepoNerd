
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import path from "path";
import { incrementBullyCounter } from "../utils/database";
import { loadTranslations } from "../utils/localization";
import { localization } from "../../config.json";


let bullyLines: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.bullyLines) {
        bullyLines = translation.bullyLines;
    }
});

let bullyCount = 0;

function resetBullyCount() {
    bullyCount = 0;
}


const now = new Date();
const nextMidnight = new Date(now);
nextMidnight.setDate(now.getDate() + 1);
nextMidnight.setHours(0, 0, 0, 0);
// reset bullyCount at midnight every day
setTimeout(() => {
    resetBullyCount();
    setInterval(() => {
        resetBullyCount();
    }, 24*3600*1000); // 24h
}, (nextMidnight.getTime() - now.getTime()))

export default {
    name: "bully",
    description: "Bully Spellscord because he's cringe",
    options: [
        {
            name: "spellscord",
            description: "Bully Spellscord because he's cringe",
            type: ApplicationCommandOptionType.Subcommand,
            execute: async (interaction: ChatInputCommandInteraction) => {
                incrementBullyCounter(interaction.user.id);
                let gifPath;
                if (bullyCount === bullyLines.length - 2) {
                    gifPath = path.join(__dirname, "../data/pepo-hanging-himself.gif");
                }
                await interaction.reply({
                    content: bullyLines[bullyCount >= bullyLines.length ? bullyLines.length-1 : bullyCount]?.replace("%n", (bullyCount+ 1).toString()),
                    files: (gifPath ? [gifPath] : undefined),
                    ephemeral: true })
                bullyCount++;
            }
        }
    ]
};
