import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';
import rateLimit from '~/server/fns/rateLimit';
import users from './users';
import { TRPCError } from '@trpc/server';

const posts = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany();
        const authors = await clerkClient.users.getUserList({ userId: posts.map(post => post.author) });
        const postsWithAuthors = posts.map(post => {
            const author = authors.find(author => author.id === post.author);
            if (!author) throw new TRPCError({ message: 'Author not found', code: 'NOT_FOUND' });
            return {
                ...post,
                author: {
                    id: author.id,
                    username: author.username as string,
                    email: author.emailAddresses[0]?.emailAddress as string,
                    avatar: author.profileImageUrl,
                },
            };
        });
        return postsWithAuthors;
    }),
    create: privateProcedure
        .input(z.object({ content: z.string().min(1).max(280) }))
        .mutation(async ({ ctx, input }) => {
            await rateLimit({ ip: ctx.ip, key: 'createPost', tokens: 1, delayMs: 10000 });
            return ctx.prisma.post.create({ data: { content: input.content, author: ctx.auth.userId } });
        }),
    getUserPosts: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
        const usersCaller = users.createCaller(ctx);
        const user = await usersCaller.get({ username: input.username });
        const posts = await ctx.prisma.post.findMany({ where: { author: user.id } });
        return posts.map(post => ({ ...post, author: user }));
    }),
});

export default posts;
