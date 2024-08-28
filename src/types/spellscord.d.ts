
interface User {
    user_id: string,
    username: string
}

interface Thread {
    user_id: string,
    thread_id: string,
    timestamp: number
}

interface HallOfShame {
    user_id: string,
    bully_count: number
}

interface MessageAnalysisReport {
    correctionNeeded: boolean,
    oldMessage: Message,
    correction?: string,
    explanations?: string,
    textDiff?: string,
}
