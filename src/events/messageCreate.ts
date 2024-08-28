
import { Client, Message } from "discord.js";
import { isSTFUed } from "../utils/database";
import { loadTranslations } from "../utils/localization";
import { localization, channelCategories, channelsToIgnore, consideredRoles } from "../../config.json";
import { analyzeAndCorrectMessage, sendCorrection } from "../helpers/core-feature";


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

        // ignore STFU and whitelisted
        if (isSTFUed(message.author.id)) return;
        
        const analysisReport = await analyzeAndCorrectMessage(message);
        if (analysisReport && analysisReport.correctionNeeded) {
            sendCorrection(analysisReport, client);
        }
    }
}
