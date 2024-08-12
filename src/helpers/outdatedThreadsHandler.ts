import { Client } from "discord.js";
import { config } from "dotenv";
import { getThreads, untrackThread } from "../utils/database"

config();
const GUILD_ID = process.env["GUILD_ID"] as string;

export async function handleOutdatedThreads(client: Client) {
    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) {
        console.error("No server found")
        return;
    }

    const threads = getThreads();
    for (let thread of threads) {
        try {
            const threadChannel = await guild.channels.fetch(thread.thread_id);
            setTimeout(() => {
                untrackThread(thread.thread_id);
                if (threadChannel) {
                    threadChannel.delete()
                        .then(() => console.log(`Thread ${thread.thread_id} successfully deleted`))
                        .catch(console.error)
                } else {
                    console.log(`Thread ${thread.thread_id} not found`)
                }
            }, 5*60*1000 - (Date.now() - thread.timestamp)); // TODO: config
        } catch (err) {/* fail silently pls */}
    }
}