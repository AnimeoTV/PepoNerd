import AI from "../ai/AI";
import { ChannelType, Client, Message, ThreadAutoArchiveDuration } from "discord.js";
import { splitTextIntoChunks } from "../utils/strings";
import { isGuildTextThreadManager, isThreadable } from "../types/discordjs-typeguards";
import constants from "../utils/constants";
import { messagesCountToIgnore } from "../../config.json";
import { beautifyResponse, containsTheExactUserInput, isNoMistakesSequence, isThereAnyRelevantCorrection } from "../utils/spellscord-responses-management";


/**
 * This event listener handles incoming message creation events.
 */
export default {
    name: "messageCreate",
    once: false, // Set to true for a one-time execution
    async execute(message: Message, client: Client): Promise<void> {
        
        // Ignore messages from bots
        if (message.author.bot) return;

        // Check if the Discord client is ready (user object exists)
        if (client.user === null) {
            void message.reply("I'm just getting started, so please wait.");
            return;
        }

        // Extract user input from message
        const userInput = message.content;

        try {
            // Log user input
            console.log(`\n===== INPUT MESSAGE\n${userInput}\n`);

            // Generate AI response using user input
            const response = (await AI.generate(userInput));
            
            if (isNoMistakesSequence(response) || !isThereAnyRelevantCorrection(userInput, response) || containsTheExactUserInput(userInput, response)) {
                console.log("The user's message has been considered valid");
                return;
            }

            const header = `<@${message.author.id}> 🗣️ https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}\n`;
            const finalOutput = header + beautifyResponse(response);
            
            // ensure we can create a private thread in the current channel
            if (isThreadable(message.channel) && isGuildTextThreadManager(message.channel.threads)) {
                const thread = await message.channel.threads.create({
                    name: "Hum... Actually☝️🤓",
                    type: ChannelType.PrivateThread,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                    reason: "Needed a separate and private thread so as to not disclose to everyone the user's mistakes",
                });
                
                // Make sure to not send a message that exceeds discord's message length limit
                const responseChunks: string[] = splitTextIntoChunks(finalOutput, constants.MAX_MESSAGE_LENGTH);
                for (const chunk of responseChunks) {
                    await thread.send(chunk);
                }
            }
        } catch (error) {
            
            // Log error for debugging
            console.error("Error generating response:", error);

            // Inform user about the error and suggest retrying
            message.reply("An error has occurred. Please try again later.");
        }
    }
}
