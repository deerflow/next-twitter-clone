import { clerkClient } from '@clerk/nextjs/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';

const follows = createTRPCRouter({
    getIdsForUser: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
        const [following, followers] = await Promise.all([
            ctx.prisma.follow.findMany({ where: { followerId: input.userId } }),
            ctx.prisma.follow.findMany({ where: { followingId: input.userId } }),
        ]);
        return {
            following: following.map(follow => follow.followingId),
            followers: followers.map(follow => follow.followerId),
        };
    }),
    getFollowersForUser: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
        const followers = await ctx.prisma.follow.findMany({ where: { followingId: input.userId } });
        const users = await clerkClient.users.getUserList({ userId: followers.map(follower => follower.followerId) });
        return followers.map(follower => {
            const user = users.find(user => user.id === follower.followerId);
            if (!user) throw new TRPCError({ message: 'User not found', code: 'NOT_FOUND' });
            return {
                id: user.id,
                username: user.username as string,
                email: user.emailAddresses[0]?.emailAddress as string,
                avatar: user.profileImageUrl,
            };
        });
    }),
    getFollowingForUser: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
        const followers = await ctx.prisma.follow.findMany({ where: { followerId: input.userId } });
        const users = await clerkClient.users.getUserList({ userId: followers.map(follower => follower.followerId) });
        return followers.map(follower => {
            const user = users.find(user => user.id === follower.followerId);
            if (!user) throw new TRPCError({ message: 'user not found', code: 'NOT_FOUND' });
            return {
                id: user.id,
                username: user.username as string,
                email: user.emailAddresses[0]?.emailAddress as string,
                avatar: user.profileImageUrl,
            };
        });
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
