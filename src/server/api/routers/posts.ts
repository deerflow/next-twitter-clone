import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';
import users from './users';
import { TRPCError } from '@trpc/server';

const posts = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
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

    getUserPosts: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
        const usersCaller = users.createCaller(ctx);
        const user = await usersCaller.get({ username: input.username });
        const posts = await ctx.prisma.post.findMany({ where: { author: user.id }, orderBy: { createdAt: 'desc' } });
        return posts.map(post => ({ ...post, author: user }));
    }),
    getOne: publicProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findUnique({ where: { id: input.postId } });
        if (!post) throw new TRPCError({ message: 'Post not found', code: 'NOT_FOUND' });
        const author = await clerkClient.users.getUser(post.author);
        return {
            ...post,
            author,
        };
    }),
    create: privateProcedure
        .input(z.object({ content: z.string().min(1).max(280) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.post.create({ data: { content: input.content, author: ctx.auth.userId } });
        }),
    delete: privateProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findUnique({ where: { id: input.postId } });
        if (!post) throw new TRPCError({ message: 'Post not found', code: 'NOT_FOUND' });
        if (post.author !== ctx.auth.userId) throw new TRPCError({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return ctx.prisma.post.delete({ where: { id: input.postId } });
    }),
});

export default posts;
