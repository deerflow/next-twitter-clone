import { type TRPCError } from '@trpc/server';
import toast from 'react-hot-toast';

export const toastError = (e: unknown) => {
    if (typeof (e as TRPCError)?.message === 'string') {
        return toast.error((e as TRPCError).message);
    }
    toast.error('An error occurred while fetching data.');
    console.log('error', e);
};
