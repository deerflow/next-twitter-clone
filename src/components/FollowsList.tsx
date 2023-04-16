import Image from 'next/image';
import { type FC } from 'react';
import { type RouterOutput } from '~/server/api/root';
import Spinner from './Spinner';
import Link from 'next/link';

const FollowsList: FC<Props> = ({ follows, isLoading }) => {
    if (isLoading)
        return (
            <div className='mt-5 flex justify-center'>
                <Spinner />
            </div>
        );

    return (
        <div className='border-b-[1px] border-solid border-gray-200'>
            {!!follows &&
                follows.length > 0 &&
                follows.map(follow => (
                    <div key={follow.id} className='flex items-center border-x-[1px] border-solid border-gray-200 p-4'>
                        <div className='flex items-center'>
                            <Image
                                src={follow.avatar}
                                alt={`Profile picture of ${follow.username}`}
                                width={48}
                                height={48}
                                className='mr-3 h-12 w-12 rounded-full object-cover object-center'
                            />
                            <div className=''>
                                <Link href={`/${follow.username}`}>
                                    <p className='break-words text-lg font-semibold hover:underline'>
                                        {follow.username}
                                    </p>
                                    <p className='text-sm text-gray-500'>@{follow.username}</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
};

interface Props {
    follows: RouterOutput['follows']['getFollowersForUser'] | undefined;
    isLoading?: boolean;
}

export default FollowsList;
