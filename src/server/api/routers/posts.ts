import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';
import rateLimit from '~/server/fns/rateLimit';

const posts = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany();
        const authors = await clerkClient.users.getUserList({ userId: posts.map(post => post.author) });
        const postsWithAuthors = posts.map(post => {
            return { ...post, author: authors.find(author => author.id === post.author) };
        });
        return postsWithAuthors;
    }),
    create: privateProcedure
        .input(z.object({ content: z.string().min(1).max(280) }))
        .mutation(async ({ ctx, input }) => {
            await rateLimit({ ip: ctx.ip, key: 'createPost', tokens: 1, delayMs: 10000 });
            return ctx.prisma.post.create({ data: { content: input.content, author: ctx.auth.userId } });
        }),
});

export default posts;
