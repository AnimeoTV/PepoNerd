import AI from "../ai/AI";
import { ActionRowBuilder, APIActionRowComponent, APIMessageActionRowComponent, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder, Message, Snowflake, ThreadAutoArchiveDuration } from "discord.js";
import { splitTextIntoChunks } from "../utils/strings";
import { isGuildTextThreadManager, isThreadable } from "../types/discordjs-typeguards";
import constants from "../utils/constants";
import { beautifyResponse, generateDiff, isNoMistakesSequence, isThereAnyRelevantCorrection, parseResponse, trimStartMessageSequence } from "../utils/spellscord-responses-management";
import { addPrivateThread, addUser, isSTFUed, untrackThread } from "../utils/database";
import { loadTranslations } from "../utils/localization";
import { localization, channelCategories, channelsToIgnore, consideredRoles, autoDeletionDuration } from "../../config.json";


let explanationBeautifier: string = "";
let noExplanationProvided: string = "";
let endDisclaimer: string = "";
let copyButtonLabel: string = "";
let sendRawButtonLabel: string = "";
let archiveThreadButtonLabel: string = "";
let deleteThreadButtonLabel: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.explanationBeautifier) {
        explanationBeautifier = translation.explanationBeautifier;
    }
    if (translation?.noExplanationProvided) {
        noExplanationProvided = translation.noExplanationProvided;
    }
    if (translation?.endDisclaimer) {
        endDisclaimer = translation.endDisclaimer;
    }
    if (translation?.copyButtonLabel) {
        copyButtonLabel = translation.copyButtonLabel;
    }
    if (translation?.sendRawButtonLabel) {
        sendRawButtonLabel = translation.sendRawButtonLabel;
    }
    if (translation?.archiveThreadButtonLabel) {
        archiveThreadButtonLabel = translation.archiveThreadButtonLabel;
    }
    if (translation?.deleteThreadButtonLabel) {
        deleteThreadButtonLabel = translation.deleteThreadButtonLabel;
    }
});


/**
 * This event listener handles incoming message creation events.
 */
export default {
    name: "messageCreate",
    once: false, // Set to true for a one-time execution
    async execute(message: Message, client: Client): Promise<void> {
        // Ignore messages from a not whitelisted categories and blacklisted channels
        // @ts-ignore
        if ((message.channel.parentId && !channelCategories.includes(message.channel.parentId)) || channelsToIgnore.includes(message.channelId)) return;

        // Select messages from authors with considered roles
        if (!message.member?.roles.cache.some((role) => consideredRoles.includes(role.id))) return;

        // Ignore messages from bots or sent in threads
        if (message.author.bot || message.channel.isThread()) return;

        // ignore STFU and whitelisted
        if (isSTFUed(message.author.id)) return;

        // Check if the Discord client is ready (user object exists)
        if (client.user === null) {
            void message.reply("I'm just getting started, so please wait.");
            return;
        }

        // Extract user input from message
        const userInput = message.content;
        if (!userInput) return;

        try {
            // Log user input
            console.log(`\n===== INPUT MESSAGE\n${userInput}\n`);
            if (!message.guild) return;

            addUser(message.author.id)

            // Generate AI response using user input
            const response = trimStartMessageSequence(await AI.generate(userInput));

            if (isNoMistakesSequence(response) || !isThereAnyRelevantCorrection(userInput, response)) {
                // || containsTheExactUserInput(userInput, response)
                console.log("The user's message has been considered valid");
                return;
            }

            const parsedResponse = parseResponse(response);
            const diff = generateDiff(parseResponse(userInput)[0] ?? "", parsedResponse[0] ?? "");

            const explanationEmbed = new EmbedBuilder()
                .setColor(0x5a8c3f)
                .setDescription((diff && ("### Text diff\n" + diff + "\n" +  "-# ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" + explanationBeautifier)) + (parsedResponse[1] || noExplanationProvided))
                .setFooter({ text: endDisclaimer, iconURL: "https://i.imgur.com/bQdDRAm.png" });

            const txt2clipboardURL = `https://text2clipboard.netlify.app/?text=${encodeURIComponent(parsedResponse[0] ?? "")}`;
            const MobileCopy = new ButtonBuilder()
                .setLabel(copyButtonLabel)
                // check out https://github.com/Truiteseche/text2clipboard
                .setURL(txt2clipboardURL.slice(0, 512))
                .setStyle(ButtonStyle.Link)
                .setDisabled(!parsedResponse[0] || txt2clipboardURL !== txt2clipboardURL.slice(0, 512));

            const sendRaw = new ButtonBuilder()
                .setCustomId("send-raw")
                .setLabel(sendRawButtonLabel)
                .setStyle(ButtonStyle.Secondary);

            const ArchiveThread = new ButtonBuilder()
                .setCustomId("archive-thread")
                .setLabel(archiveThreadButtonLabel)
                .setStyle(ButtonStyle.Secondary);

            const DeleteThread = new ButtonBuilder()
                .setCustomId("delete-thread")
                .setLabel(deleteThreadButtonLabel)
                .setStyle(ButtonStyle.Danger);

            const row: unknown = new ActionRowBuilder()
                .addComponents(MobileCopy, sendRaw, ArchiveThread, DeleteThread);

            const header = `<@${message.author.id}> 🗣️ https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}\n`;

            // ensure we can create a private thread in the current channel
            if (isThreadable(message.channel) && isGuildTextThreadManager(message.channel.threads)) {
                const thread = await message.channel.threads.create({
                    name: "Hum... Actually☝️🤓",
                    type: ChannelType.PrivateThread,
                    autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
                    reason: "Needed a separate and private thread so as to not disclose to everyone the user's mistakes",
                });
                try {
                    addPrivateThread(thread.id, message.author.id, thread.createdTimestamp ?? Date.now());

                    let finalOutput = "";
                    finalOutput = header + beautifyResponse(parsedResponse[0] ?? "");

                    // Make sure to not send a message that exceeds discord's message length limit
                    const responseChunks: string[] = splitTextIntoChunks(finalOutput, constants.MAX_MESSAGE_LENGTH);
                    for (let i = 0; i < responseChunks.length; i++) {
                        await thread.send({
                            content: (responseChunks.length > 1 ? (i === 0 ? responseChunks[i] + "```" : (i === responseChunks.length - 1 ? "```" + responseChunks[i] : ("```" + responseChunks[i] + "```"))) : responseChunks[i]),
                            embeds: (i === responseChunks.length - 1 ? [explanationEmbed] : []),
                            components: (i === responseChunks.length - 1 ? [row as APIActionRowComponent<APIMessageActionRowComponent>] : [])
                        });
                    }
                    setTimeout(async () => {
                        try {
                            const success = untrackThread(thread.id);
                            const channel = await client.channels.fetch(thread.id);
                            if (success && channel) { // check if the thread actually exists
                                thread.delete()
                                    .then(() => console.log(`Thread ${thread.id} successfully deleted`))
                                    .catch(console.error)
                            }
                        } catch(err) {
                            console.log(`Thread ${thread.id} has already been deleted`)
                        }
                    }, autoDeletionDuration);
                } catch (error) {
                    console.error("Error sending response:", error);
                    thread.delete();
                }
            }
        } catch (error) {
            console.error("Error generating response:", error);
        }
    }
}
