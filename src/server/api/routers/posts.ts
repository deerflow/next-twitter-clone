import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';
import users from './users';
import { TRPCError } from '@trpc/server';
import ratelimit from '~/server/rateLimit';
import imageKit from '~/server/imageKit';
import { applyImageKitParams } from '~/server/fns/imageKit';
import { getPlaiceholder } from 'plaiceholder';

const posts = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: { image: true, _count: { select: { comments: true } } },
        });
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
        const posts = await ctx.prisma.post.findMany({
            where: { author: user.id },
            orderBy: { createdAt: 'desc' },
            include: { image: true, _count: { select: { comments: true } } },
        });
        return posts.map(post => ({ ...post, author: user }));
    }),
    getOne: publicProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findUnique({ where: { id: input.postId }, include: { image: true } });
        if (!post) throw new TRPCError({ message: 'Post not found', code: 'NOT_FOUND' });
        const author = await clerkClient.users.getUser(post.author);
        return {
            ...post,
            author: {
                id: author.id,
                username: author.username as string,
                email: author.emailAddresses[0]?.emailAddress as string,
                avatar: author.profileImageUrl,
            },
        };
    }),
    create: privateProcedure
        .input(
            z.object({
                content: z.string().min(1).max(280),
                imageSrc: z.string().url().optional(),
                imageWidth: z.number().optional(),
                imageHeight: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { success } = await ratelimit.limit(ctx.auth.userId);
            if (!success)
                throw new TRPCError({
                    message: 'You can only make a twitt every 20 seconds',
                    code: 'TOO_MANY_REQUESTS',
                });
            if (input.imageSrc) {
                if (!input.imageWidth || !input.imageHeight)
                    throw new TRPCError({
                        message: 'Image width and height are required when an image is provided',
                        code: 'BAD_REQUEST',
                    });
                const result = await imageKit.upload({
                    file: input.imageSrc,
                    fileName: ctx.auth.userId,
                    folder: 'posts',
                });

                const url = applyImageKitParams(
                    result.url,
                    `tr:w-${input.imageWidth},h-${input.imageHeight},c-maintain-aspect-ratio`
                );

                const { base64: blurDataUrl } = await getPlaiceholder(url);

                return ctx.prisma.post.create({
                    data: {
                        content: input.content,
                        author: ctx.auth.userId,
                        image: {
                            create: {
                                url,
                                width: input.imageWidth,
                                height: input.imageHeight,
                                fileId: result.fileId,
                                blurDataUrl,
                            },
                        },
                    },
                });
            }
            return ctx.prisma.post.create({
                data: {
                    content: input.content,
                    author: ctx.auth.userId,
                },
            });
        }),
    delete: privateProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findUnique({ where: { id: input.postId }, include: { image: true } });
        if (!post) throw new TRPCError({ message: 'Post not found', code: 'NOT_FOUND' });
        if (post.author !== ctx.auth.userId)
            throw new TRPCError({ message: "You're not allowed to delete this twitt", code: 'UNAUTHORIZED' });
        if (post.image?.fileId) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await imageKit.deleteFile(post.image.fileId);
        }

        return ctx.prisma.post.delete({ where: { id: input.postId } });
    }),
});

export default posts;
