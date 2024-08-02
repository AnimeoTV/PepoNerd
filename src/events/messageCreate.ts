import AI                                                                       from "../ai/AI";
import { Client, DMMessageManager, GuildMessageManager, Message, MessageType }  from "discord.js";
import { splitTextIntoChunks } from "../utils/strings";
import constants from "../utils/constants";
import { clearContextMessage, messagesCountToIgnore } from "../../config.json";


/**
 * This event listener handles incoming message creation events.
 */
export default {
    name: "messageCreate",
    once: false, // Set to true for a one-time execution
    async execute(message: Message, client: Client): Promise<void> {
        
        // Ignore messages from bots or those mentioning everyone
        if (message.author.bot || message.mentions.everyone) return;

        // Check if the Discord client is ready (user object exists)
        if (client.user === null) {
            void message.reply("I'm just getting started, so please wait.");
            return;
        }

        // Extract user input from message
        const userInput = message.content;

        try {
            // Log user input
            console.log("\n===== INPUT MESSAGE\n", userInput, "\n");

            // Generate AI response using user input
            const response = `<@${message.author.id}>}\n` + (await AI.generate(userInput));

            // Reply to the message with the generated AI response
            // make sure to not send a message that exceeds discord's message length limit
            const responseChunks: string[] = splitTextIntoChunks(response, constants.MAX_MESSAGE_LENGTH);
            message.reply(responseChunks[0]!); // use reply for the first message
            if (response.length > 1) {
                for (const chunk of responseChunks.slice(1, responseChunks.length)) {
                    message.channel.send(chunk); // then send other messages in the usual way
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
