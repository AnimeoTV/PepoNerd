import { Client } from "discord.js";
import { config } from "dotenv";
import { getOutdatedThreads, untrackThread } from "../utils/database"

config();
const GUILD_ID = process.env["GUILD_ID"] as string;

export function handleOutdatedThreads(client: Client) {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
        console.error("No server found")
        return;
    }
    setInterval(() => {
        const outdatedThreads = getOutdatedThreads();
        for (let outdatedThread of outdatedThreads) {
            const threadChannel = guild.channels.cache.get(outdatedThread.thread_id);
            untrackThread(outdatedThread.thread_id);
            if (threadChannel) {
                threadChannel.delete()
                    .then(() => console.log(`Thread ${outdatedThread.thread_id} successfully deleted`))
                    .catch(console.error)
            } else {
                console.log(`Thread ${outdatedThread.thread_id} not found`)
            }
        }
    }, 10000) // TODO: config
}
