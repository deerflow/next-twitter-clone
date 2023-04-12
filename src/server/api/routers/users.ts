import clerkClient from '@clerk/clerk-sdk-node';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, privateProcedure } from '~/server/api/trpc';
import { z } from 'zod';

const users = createTRPCRouter({
    getEmail: privateProcedure.query(async ({ ctx }) => {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        if (!user) {
            throw new TRPCError({ message: 'User not found', code: 'NOT_FOUND' });
        }
        return { email: user.emailAddresses[0]?.emailAddress };
    }),
    get: publicProcedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
        const user = (await clerkClient.users.getUserList({ username: [input.username] }))[0];
        if (!user) throw new TRPCError({ message: 'User not found', code: 'NOT_FOUND' });
        return { user };
    }),
});

export default users;
