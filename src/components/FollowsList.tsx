import Image from 'next/image';
import { useMemo, type FC, useContext } from 'react';
import { type RouterOutput } from '~/server/api/root';
import Spinner from './Spinner';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { api } from '~/utils/api';
import Button from './Button';
import toast from 'react-hot-toast';
import { LoginModalContext } from './LoginModalProvider';

const FollowsList: FC<Props> = ({ follows, isLoading }) => {
    const auth = useAuth();
    const context = api.useContext();
    const { setIsOpen } = useContext(LoginModalContext);

    const followsIds = api.follows.getIdsForUser.useQuery(
        { userId: auth.userId as string },
        { enabled: auth.isSignedIn }
    );
    const createFollow = api.follows.create.useMutation({
        onSuccess: () => {
            void context.follows.getIdsForUser.invalidate({ userId: auth.userId as string });
        },
        onError: (err, _variables, _prev) => {
            toast.error(err.message);
        },
    });

    const deleteFollow = api.follows.delete.useMutation({
        onSuccess: () => {
            void context.follows.getIdsForUser.invalidate({ userId: auth.userId as string });
        },
        onError: (err, _variables, _prev) => {
            toast.error(err.message);
        },
    });

    const followsWithIsFollowing = useMemo(() => {
        if (!follows || !followsIds.data) return follows?.map(follow => ({ ...follow, isFollowing: false }));
        return follows.map(follow => {
            return {
                ...follow,
                isFollowing: followsIds.data.following.includes(follow.id),
            };
        });
    }, [followsIds.data, follows]);

    if (isLoading || !followsWithIsFollowing)
        return (
            <div className='mt-5 flex justify-center'>
                <Spinner />
            </div>
        );

    if (!followsWithIsFollowing || followsWithIsFollowing.length === 0) {
        return null;
    }

    return (
        <div className='border-b-[1px] border-solid border-gray-200'>
            {followsWithIsFollowing.map(follow => (
                <div key={follow.id} className='flex justify-between border-x-[1px] border-solid border-gray-200 p-4'>
                    <div className='flex items-center'>
                        <Link href={`/${follow.username}`}>
                            <Image
                                src={follow.avatar}
                                alt={`Profile picture of ${follow.username}`}
                                width={48}
                                height={48}
                                className='mr-3 h-12 w-12 rounded-full object-cover object-center'
                            />
                        </Link>
                        <div>
                            <Link href={`/${follow.username}`}>
                                <p className='break-words text-lg font-semibold hover:underline'>{follow.username}</p>
                                <p className='text-sm text-gray-500'>@{follow.username}</p>
                            </Link>
                        </div>
                    </div>
                    {follow.isFollowing ? (
                        <Button onClick={() => deleteFollow.mutate({ userId: follow.id })}>Unfollow</Button>
                    ) : (
                        <Button
                            black
                            onClick={() => {
                                if (!auth.isSignedIn) return setIsOpen?.(true);
                                createFollow.mutate({ userId: follow.id });
                            }}
                        >
                            Follow
                        </Button>
                    )}
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
