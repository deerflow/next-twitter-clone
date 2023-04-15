import { clerkClient } from '@clerk/nextjs/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';

const comments = createTRPCRouter({
    getAllForPost: publicProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx, input }) => {
        const comments = await ctx.prisma.comment.findMany({
            where: { postId: input.postId },
            orderBy: { createdAt: 'desc' },
        });
        const authors = await clerkClient.users.getUserList({ userId: comments.map(post => post.authorId) });
        const commentsWithAuthors = comments.map(comment => {
            const author = authors.find(author => author.id === comment.authorId);
            if (!author) throw new TRPCError({ message: 'Author not found', code: 'NOT_FOUND' });
            return {
                ...comment,
                author: {
                    id: author.id,
                    username: author.username as string,
                    email: author.emailAddresses[0]?.emailAddress as string,
                    avatar: author.profileImageUrl,
                },
            };
        });
        return commentsWithAuthors;
    }),
    create: privateProcedure
        .input(
            z.object({
                content: z.string(),
                postId: z.string(),
            })
        )
        .mutation(({ input, ctx }) => {
            return ctx.prisma.comment.create({
                data: { content: input.content, postId: input.postId, authorId: ctx.auth.userId },
            });
        }),
    delete: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        const comment = await ctx.prisma.comment.findUnique({ where: { id: input.id } });
        if (!comment) throw new TRPCError({ message: 'Comment not found', code: 'NOT_FOUND' });
        if (comment.authorId !== ctx.auth.userId)
            throw new TRPCError({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return ctx.prisma.comment.delete({ where: { id: input.id } });
    }),
});

export default comments;
