
export function isHallOfShameArray(arr: Array<any>): arr is Array<HallOfShame> {
    return arr.every((item) => (item as HallOfShame).bully_count !== undefined && (item as HallOfShame).user_id !== undefined);
}

export function isThreadsArray(arr: Array<any>): arr is Array<Thread> {
    return arr.every((item) => (item as Thread).thread_id !== undefined && (item as Thread).user_id !== undefined && (item as Thread).timestamp !== undefined);
}
