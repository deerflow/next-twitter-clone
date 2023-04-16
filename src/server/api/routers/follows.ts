import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';

const follows = createTRPCRouter({
    getForUser: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
        const [following, followers] = await Promise.all([
            ctx.prisma.follow.findMany({ where: { followerId: input.userId } }),
            ctx.prisma.follow.findMany({ where: { followingId: input.userId } }),
        ]);
        return {
            following: following.map(follow => follow.followingId),
            followers: followers.map(follow => follow.followerId),
        };
    }),
    getFollowing: privateProcedure.query(async ({ ctx }) => { 
        const follows = await ctx.prisma.follow.findMany({ where: { followerId: ctx.auth.userId } });
        return follows.map(follow => follow.followingId);
    }),
    create: privateProcedure.input(z.object({ userId: z.string() })).mutation(async ({ ctx, input }) => {
        const follow = await ctx.prisma.follow.findFirst({
            where: { followingId: input.userId, followerId: ctx.auth.userId },
        });
        if (follow) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You already follow this user' });
        return ctx.prisma.follow.create({ data: { followingId: input.userId, followerId: ctx.auth.userId } });
    }),
    delete: privateProcedure.input(z.object({ userId: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.prisma.follow.deleteMany({ where: { followingId: input.userId, followerId: ctx.auth.userId } });
    }),
});

export default follows;
