
import { ActionRowBuilder, APIActionRowComponent, APIMessageActionRowComponent, ButtonBuilder, ButtonStyle, Channel, ChannelType, Client, EmbedBuilder, GuildTextBasedChannel, Message, Snowflake, ThreadAutoArchiveDuration, ThreadChannel } from "discord.js";
import { splitTextIntoChunks } from "../utils/strings";
import { isGuildTextThreadManager, isThreadable } from "../types/discordjs-typeguards";
import AI from "../ai/AI";
import constants from "../utils/constants";
import { addPrivateThread, addUser, untrackThread } from "../utils/database";
import { beautifyResponse, generateDiff, isNoMistakesSequence, isThereAnyRelevantCorrection, parseResponse, trimStartMessageSequence } from "../utils/pepo-nerd-responses-management";
import { loadTranslations } from "../utils/localization";
import { localization, autoDeletionDuration } from "../../config.json";


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

export async function analyzeAndCorrectMessage(message: Message): Promise<MessageAnalysisReport | undefined> {

    // Ignore messages from bots or sent in threads
    if (message.author.bot || message.channel.isThread()) return;
        
    // Extract user input from message
    const userInput = message.content;
    if (!userInput) return;

    try {
        // Log user input
        console.log(`\n===== INPUT MESSAGE\n${userInput}\n`);

        addUser(message.author.id) // add user into the database if it doesn't already exist

        // Generate AI response using user input
        const response = trimStartMessageSequence(await AI.generate(userInput));

        let correctionNeeded = true;
        if (isNoMistakesSequence(response) || !isThereAnyRelevantCorrection(userInput, response)) {
            console.log("The user's message has been considered valid");
            correctionNeeded = false;
        }

        const parsedResponse = parseResponse(response);
        
        // generate a quick overview of what changed ("diff" syntax)
        const diff = generateDiff(parseResponse(userInput)[0] ?? "", parsedResponse[0] ?? "");

        return {
            correctionNeeded: correctionNeeded,
            oldMessage: message,
            correction: parsedResponse[0],
            explanations: parsedResponse[1],
            textDiff: diff,
        }    
        
    } catch (error) {
        console.error("Error generating response:", error);
    }
    return;
}

export async function sendCorrection(analysisReport: MessageAnalysisReport, client: Client, channel?: Channel): Promise<ThreadChannel<boolean> | undefined> {
    try {
        const oldMsg = analysisReport.oldMessage;

        if (!oldMsg.guild) return;

        const explanationEmbed = new EmbedBuilder()
            .setColor(0x5a8c3f)
            .setDescription((analysisReport.textDiff && ("### Text diff\n" + analysisReport.textDiff + "\n" +  "-# ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" + explanationBeautifier)) + (analysisReport.explanations || noExplanationProvided))
            .setFooter({ text: endDisclaimer, iconURL: "https://i.imgur.com/bQdDRAm.png" });

        const txt2clipboardURL = `https://text2clipboard.netlify.app/?text=${encodeURIComponent(analysisReport.correction ?? "")}`;
        const MobileCopy = new ButtonBuilder()
            .setLabel(copyButtonLabel)
            // check out https://github.com/Truiteseche/text2clipboard
            .setURL(txt2clipboardURL.slice(0, 512))
            .setStyle(ButtonStyle.Link)
            .setDisabled(!analysisReport.correction || txt2clipboardURL !== txt2clipboardURL.slice(0, 512));

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
        
        // Ping the message author to invite them in the private thread + link to the message to direct access and edit
        const header = `<@${oldMsg.author.id}> 🗣️ https://discord.com/channels/${oldMsg.guildId}/${oldMsg.channelId}/${oldMsg.id}\n`;

        const targetChannel: GuildTextBasedChannel = channel ?? oldMsg.channel;
        // ensure we can create a private thread in the current channel
        if (isThreadable(targetChannel) && isGuildTextThreadManager(targetChannel.threads)) {
            const thread = await targetChannel.threads.create({
                name: "Hum... Actually☝️🤓",
                type: ChannelType.PrivateThread,
                autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
                reason: "Needed a separate and private thread so as to not disclose to everyone the user's mistakes",
            });
            try {
                addPrivateThread(thread.id, oldMsg.author.id, thread.createdTimestamp ?? Date.now());

                let finalOutput = header + beautifyResponse(analysisReport.correction ?? "");

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
                return thread;
            } catch (error) {
                console.error("Error sending response:", error);
                thread.delete();
            }
        }
    } catch (error) {
        console.error("Error sending the response:", error);
    }
    return;
}

