import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

const likes = createTRPCRouter({
    create: privateProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
        const like = await ctx.prisma.like.findFirst({ where: { postId: input.postId, authorId: ctx.auth.userId } });
        if (like) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You already liked this twitt' });
        return ctx.prisma.like.create({ data: { postId: input.postId, authorId: ctx.auth.userId } });
    }),
    delete: privateProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.prisma.like.deleteMany({ where: { postId: input.postId, authorId: ctx.auth.userId } });
    }),
});

export default likes;
