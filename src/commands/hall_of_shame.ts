
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getHallOfShame } from "../utils/database";
import { loadTranslations } from "../utils/localization";
import { localization } from "../../config.json";


let nobodyBullied: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.nobodyBullied) {
        nobodyBullied = translation.nobodyBullied;
    }
});

export default {
    name: "hall",
    description: "List members according to a parameter",
    options: [
        {
            name: "of",
            description: "Parameter",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "shame",
                    description: "List the best bulliers",
                    type: ApplicationCommandOptionType.Subcommand,
                    execute: async (interaction: ChatInputCommandInteraction) => {
                        
                        const hallOfShame = [];
                        const rows = getHallOfShame().toSorted((itemA, itemB) => (itemB?.bully_count ?? 0) - (itemA?.bully_count ?? 0));
                        for (let i = 0; i < rows.length && i < 10; i++) {
                            hallOfShame.push(`\`${i+1}.\` \`${rows[i]?.bully_count}\` ${(rows[i]?.user_id ? `<@${rows[i]?.user_id}>` : "[inconnu]")} <:thumb_up_happy_face:1269679946796765310> `)
                        }

                        const embed = new EmbedBuilder()
                            .setColor(0x5a8c3f)
                            .setTitle("Hall of Shame - Top bulliers")
                            .setDescription(hallOfShame.join("\n") || nobodyBullied);
                        
                        await interaction.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                }
            ]
        }
    ]
};
