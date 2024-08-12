
import Database from "better-sqlite3";
// const Database = require("better-sqlite3");
import { Snowflake } from "discord.js";
import path from "path";
import { isHallOfShameArray, isThreadsArray } from "../types/spellscord-typeguards";

const dbPath = path.join(__dirname, "../data/database.db");

const db = new Database(dbPath, { verbose: console.log });

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username VARCHAR(32)
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS hall_of_shame (
        user_id TEXT PRIMARY KEY,
        bully_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS threads (
        thread_id TEXT PRIMARY KEY,
        user_id TEXT,
        timestamp INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS stfu (
        user_id TEXT PRIMARY KEY,
        stfu_end_timestamp INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
`).run();

export {
    db
}

// setters
export function addUser(userId: Snowflake, displayName: string) {
    const stmt = db.prepare("INSERT OR REPLACE INTO users (user_id, username) VALUES (?, ?)");
    stmt.run(userId, displayName);
}

export function addPrivateThread(threaId: Snowflake, ownerId: Snowflake, timestamp: Number) {
    const stmt = db.prepare("INSERT OR REPLACE INTO threads (thread_id, user_id, timestamp) VALUES (?, ?, ?)");
    stmt.run(threaId, ownerId, timestamp);
}

export function incrementBullyCounter(userId: Snowflake): void {
    const getUserQuery = "SELECT COUNT(*) AS count FROM hall_of_shame WHERE user_id = ?";
    const incrementUserQuery = "UPDATE hall_of_shame SET bully_count = bully_count + 1 WHERE user_id = ?";
    const insertUserQuery = "INSERT INTO hall_of_shame (user_id, bully_count) VALUES (?, 1)";

    const userCheck: any = db.prepare(getUserQuery).get(userId);
    console.log("userCheck:", userCheck)

    if (userCheck.count > 0) {
        // the user exists
        db.prepare(incrementUserQuery).run(userId);
    } else {
        // the user doesn't exist
        db.prepare(insertUserQuery).run(userId);
    }
}


export function untrackThread(threadId: Snowflake): boolean {
    const stmt = db.prepare("DELETE FROM threads WHERE thread_id = ?");

    const info = stmt.run(threadId);

    if (info.changes > 0) {
        return true;
    } else {
        return false;
    }
}

export function addSTFU(userId: Snowflake, duration: number) {
    const stmt = db.prepare("INSERT OR REPLACE INTO stfu (user_id, stfu_end_timestamp) VALUES (?, ?)");
    const now = Date.now();
    const endTimestamp = Math.floor(now + duration*3600*1000);
    stmt.run(userId, endTimestamp);
}

// getters
export function getHallOfShame(): Array<HallOfShame> {
    const rows = db.prepare("SELECT * FROM hall_of_shame").all();
    if (isHallOfShameArray(rows)) {
        return rows;
    }
    return [];
}

export function getUsername(userId: Snowflake | undefined): string | undefined {
    if (!userId) {
        return;
    }

    const stmt = db.prepare("SELECT username FROM users WHERE user_id = ?");

    const row = stmt.get(userId);

    if ((row as User).username) {
        return (row as User).username;
    }

    return;
}

export function getOutdatedThreads(): Array<Thread> {
    const fiveMinutesAgo = Date.now() - 5*60*1000; // TODO: config

    const stmt = db.prepare("SELECT * FROM threads WHERE timestamp < ?");
    const threads = stmt.all(fiveMinutesAgo);
    if (isThreadsArray(threads)) {
        return threads;
    }

    return [];
}

export function getThreads(): Array<Thread> {
    const stmt = db.prepare("SELECT * FROM threads");
    const threads = stmt.all();
    if (isThreadsArray(threads)) {
        return threads;
    }

    return [];
}

export function isSTFUed(userId: Snowflake): boolean {
    const stmt = db.prepare("DELETE FROM stfu WHERE stfu_end_timestamp < ?");
    stmt.run(Date.now());
    const stmt2 = db.prepare("SELECT COUNT(*) AS count FROM stfu WHERE user_id = ?");
    const stfu: any = stmt2.get(userId);
    return (stfu.count > 0);
}
