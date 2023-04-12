import clerkClient from '@clerk/clerk-sdk-node';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

const users = createTRPCRouter({
    getEmail: privateProcedure.query(async ({ ctx }) => {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        if (!user) {
            throw new TRPCError({ message: 'User not found', code: 'NOT_FOUND' });
        }
        return { email: user.emailAddresses[0]?.emailAddress };
    }),
});

export default users;
