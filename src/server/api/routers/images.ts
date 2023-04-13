import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { applyImageKitParams } from '~/server/fns/imageKit';
import imageKit from '~/server/imageKit';

const images = createTRPCRouter({
    uploadAvatar: privateProcedure.input(z.object({ base64: z.string() })).mutation(async ({ ctx, input }) => {
        const res = await imageKit.upload({ file: input.base64, fileName: ctx.auth.userId, folder: 'avatars' });
        return applyImageKitParams(res.url, 'tr:w-120,h-120,c-maintain-aspect-ratio ');
    }),
});

export default images;
