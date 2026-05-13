import {redis} from "@/lib/redis"

export async function accuireLock(key: string): Promise<boolean> {
    const result = await redis.set(key, "1", {
        nx: true,
        ex: 5
    })

    return result === "OK";
}


export async function releaseLock(key: string): Promise<void> {
    await redis.del(key);
}


export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
    const lockAcquired = await accuireLock(key);

    if (!lockAcquired) {
        return null;
    }

    try {
        return await fn();
    } finally {
        await releaseLock(key);
    }
}