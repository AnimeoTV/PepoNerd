import AI from "../ai/AI";
import { ActionRowBuilder, APIActionRowComponent, APIMessageActionRowComponent, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder, Message, ThreadAutoArchiveDuration } from "discord.js";
import { splitTextIntoChunks } from "../utils/strings";
import { isGuildTextThreadManager, isThreadable } from "../types/discordjs-typeguards";
import constants from "../utils/constants";
import { messagesCountToIgnore, endDisclaimer } from "../../config.json";
import { beautifyResponse, containsTheExactUserInput, isNoMistakesSequence, isThereAnyRelevantCorrection, parseResponse, trimStartMessageSequence } from "../utils/spellscord-responses-management";
import { addPrivateThread, addUser, db } from "../utils/database";


/**
 * This event listener handles incoming message creation events.
 */
export default {
    name: "messageCreate",
    once: false, // Set to true for a one-time execution
    async execute(message: Message, client: Client): Promise<void> {
        
        // Ignore messages from bots or sent in threads
        if (message.author.bot || message.channel.isThread()) return;
        
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

            const member = message.guild.members.cache.get(message.author.id);
            addUser(message.author.id, member?.displayName ?? message.author.globalName ?? message.author.username)
            
            // Generate AI response using user input
            const response = trimStartMessageSequence(await AI.generate(userInput));

            if (isNoMistakesSequence(response) || !isThereAnyRelevantCorrection(userInput, response)) {
                // || containsTheExactUserInput(userInput, response)
                console.log("The user's message has been considered valid");
                return;
            }

            const parsedResponse = parseResponse(response);
            
            const explanationEmbed = new EmbedBuilder()
                .setColor(0x5a8c3f)
                .setTitle("**Explications** :") //TODO: explanationDelimiter
                .setDescription(parsedResponse[1] || "Aucune explication n'a été fournie.")
                .setFooter({ text: endDisclaimer, iconURL: "https://i.imgur.com/bQdDRAm.png" });

            const MobileCopy = new ButtonBuilder()
                .setLabel("Copier")
                // check out https://github.com/Truiteseche/text2clipboard
                .setURL(`https://text2clipboard.netlify.app/?text=${encodeURIComponent(parsedResponse[0] ?? "")}`.slice(0, 500))
                .setStyle(ButtonStyle.Link)
                .setDisabled(!parsedResponse[0]);

            const ArchiveThread = new ButtonBuilder()
                .setCustomId("archive-thread")
                .setLabel("Archiver le thread")
                .setStyle(ButtonStyle.Secondary);

            const DeleteThread = new ButtonBuilder()
                .setCustomId("delete-thread")
                .setLabel("Supprimer le thread")
                .setStyle(ButtonStyle.Danger);
            
            const row: unknown = new ActionRowBuilder()
                .addComponents(MobileCopy, ArchiveThread, DeleteThread);

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
                            content: (responseChunks.length > 1 ? (i === 0 ? responseChunks[i] + "```" : (i === responseChunks.length-1 ? "```" + responseChunks[i] : ("```" + responseChunks[i] + "```"))) : responseChunks[i]),
                            embeds: (i === responseChunks.length-1 ? [explanationEmbed] : []),
                            components: (i === responseChunks.length-1 ? [row as APIActionRowComponent<APIMessageActionRowComponent>] : [])
                        });
                    }
                } catch (error) {
                    thread.delete();
                    console.error("Error sending response:", error);
                }
            }
        } catch (error) {
            console.error("Error generating response:", error);
        }
    }
}
