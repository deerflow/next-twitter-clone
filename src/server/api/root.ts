import { prisma } from '~/server/db';
import { createTRPCRouter } from '~/server/api/trpc';
import users from './routers/users';
import posts from './routers/posts';
import comments from './routers/comments';
import { type GetServerSidePropsContext } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import superjson from 'superjson';
import { createServerSideHelpers } from '@trpc/react-query/server';
import images from './routers/images';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import likes from './routers/likes';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    users,
    posts,
    images,
    comments,
    likes,
});

export const getSSG = (context: GetServerSidePropsContext) =>
    createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, auth: getAuth(context.req), ip: context.req.headers['x-forwarded-for'] },
        transformer: superjson,
    });

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
