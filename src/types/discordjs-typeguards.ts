
import { AllowedThreadTypeForTextChannel, ForumChannel, GuildBasedChannel, GuildTextBasedChannel, GuildTextThreadCreateOptions, GuildTextThreadManager, MediaChannel, NewsChannel, TextBasedChannel, TextChannel } from "discord.js";

export function isThreadable(obj: GuildTextBasedChannel | GuildBasedChannel | TextBasedChannel): obj is NewsChannel | TextChannel | ForumChannel | MediaChannel {
    return (obj as NewsChannel | TextChannel | ForumChannel | MediaChannel).threads !== undefined;
}

export function isGuildTextThreadManager(obj: GuildTextThreadManager<any>): obj is GuildTextThreadManager<AllowedThreadTypeForTextChannel> {
    return (obj as GuildTextThreadManager<AllowedThreadTypeForTextChannel>).create !== undefined;
}
