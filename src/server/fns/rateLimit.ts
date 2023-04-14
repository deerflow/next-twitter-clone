import { type RedisClientType } from '@redis/client';
import { TRPCError } from '@trpc/server';

const rateLimit = async ({ ip, key, tokens, delayMs, redisClient }: RateLimitOptions) => {
    await redisClient.connect();
    try {
        if (typeof ip !== 'string') {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
        const limitJson = await redisClient.get(`${key}${ip}`);
        if (limitJson) {
            const limit = JSON.parse(limitJson) as RateLimit;
            if (Date.now() - limit.timestamp < delayMs) {
                if (limit.tokens <= 0) {
                    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
                }
                await redisClient.set(
                    `${key}${ip}`,
                    JSON.stringify({ timestamp: limit.timestamp, tokens: limit.tokens - 1 })
                );
            } else {
                await redisClient.set(`${key}${ip}`, JSON.stringify({ timestamp: Date.now(), tokens: tokens - 1 }));
            }
        } else {
            await redisClient.set(`${key}${ip}`, JSON.stringify({ timestamp: Date.now(), tokens: tokens - 1 }));
        }
    } finally {
        await redisClient.disconnect();
    }
};

interface RateLimit {
    timestamp: number;
    tokens: number;
}

interface RateLimitOptions {
    ip: string | string[] | undefined;
    key: string;
    tokens: number;
    delayMs: number;
    redisClient: RedisClientType;
}

export default rateLimit;
