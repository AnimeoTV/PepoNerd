
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import path from "path";
import { lines } from "../data/bully-lines.json";
import { incrementBullyCounter } from "../utils/database";


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
                if (bullyCount === lines.length - 2) {
                    gifPath = path.join(__dirname, "../data/pepo-hanging-himself.gif");
                }
                await interaction.reply({
                    content: lines[bullyCount >= lines.length ? lines.length-1 : bullyCount]?.replace("%n", (bullyCount+ 1).toString()),
                    files: (gifPath ? [gifPath] : undefined),
                    ephemeral: true })
                bullyCount++;
            }
        }
    ]
};
