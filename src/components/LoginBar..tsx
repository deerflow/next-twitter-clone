/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import { type FC } from 'react';

const LoginBar: FC = () => {
    return (
        <div className='fixed bottom-0 flex w-full justify-between bg-blue-400 p-2 text-white'>
            <div className='flex-1' />
            <div className='w-[600px]'>
                <p className='text-xl font-bold'>Don't miss out what's happening.</p>
                <p className='text-sm'>Twitty users are the first one to know. </p>
            </div>
            <div className='flex flex-1 items-center'>
                <div className='mr-3'>
                    <Link
                        href='/users/sign-in'
                        className='block rounded-full border-[1px] border-solid border-blue-300 bg-blue-400 px-4 py-1.5 font-semibold transition-colors hover:border-[#9cc7fc] hover:bg-[#58b5f3]'
                    >
                        Sign in
                    </Link>
                </div>
                <div>
                    <Link
                        href='/users/sign-up'
                        className='block rounded-full bg-white px-4 py-1.5 font-semibold text-black transition-colors hover:bg-gray-200'
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginBar;
