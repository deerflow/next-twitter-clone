import { type NextPage } from 'next';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import Layout from '~/components/Layout';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import Link from 'next/link';
import Image from 'next/image';
import Button from '~/components/Button';
import { useAuth } from '@clerk/nextjs';
import Head from 'next/head';
import LoadingPage from '~/components/LoadingPage';
import { useMemo, useState } from 'react';
import PostsList from '~/components/PostsList';
import Page404 from '../404';
import EditProfileModal from '~/components/EditProfileModal';
import toast from 'react-hot-toast';

const ProfilePage: NextPage = () => {
    const context = api.useContext();
    const auth = useAuth();
    const getCurrentUser = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });
    const router = useRouter();
    const username = router.query.username as string;

    const getUser = api.users.get.useQuery({ username }, { enabled: router.isReady });
    const getUserPosts = api.posts.getUserPosts.useQuery({ username }, { enabled: router.isReady });
    const follows = api.follows.getForUser.useQuery(
        { userId: getUser.data?.id as string },
        { enabled: getUser.isSuccess }
    );

    const createFollow = api.follows.create.useMutation({
        onSuccess: () => {
            void context.follows.getForUser.invalidate({ userId: getUser.data?.id as string });
        },
        onMutate: async ({ userId }) => {
            await context.follows.getForUser.cancel();
            const previousFollows = context.follows.getForUser.getData({ userId });
            context.follows.getForUser.setData({ userId }, prev => {
                if (!prev || !getCurrentUser.data) return prev;
                return {
                    ...prev,
                    followers: [...prev.followers, getCurrentUser.data.id],
                };
            });
            return previousFollows;
        },
        onError: (err, variables, prev) => {
            toast.error(err.message);
            context.follows.getForUser.setData(variables, prev);
        },
    });

    const deleteFollow = api.follows.delete.useMutation({
        onSuccess: () => {
            void context.follows.getForUser.invalidate({ userId: getUser.data?.id as string });
        },
        onMutate: async ({ userId }) => {
            await context.follows.getForUser.cancel();
            const previousFollows = context.follows.getForUser.getData({ userId });
            context.follows.getForUser.setData({ userId }, prev => {
                if (!prev || !getCurrentUser.data) return prev;
                return {
                    ...prev,
                    followers: prev.followers.filter(followerId => followerId !== getCurrentUser.data.id),
                };
            });
            return previousFollows;
        },
        onError: (err, variables, prev) => {
            toast.error(err.message);
            context.follows.getForUser.setData(variables, prev);
        },
    });

    const isCurrentUserFollowing = useMemo(
        () => !!getCurrentUser.data && follows.data?.followers.includes(getCurrentUser.data?.id),
        [follows.data?.followers, getCurrentUser.data]
    );

    const isCurrentUserFollowed = useMemo(
        () => !!getCurrentUser.data && follows.data?.following.includes(getCurrentUser.data?.id),
        [follows.data?.following, getCurrentUser.data]
    );

    const postsNumber = getUserPosts.data?.length || 0;

    const [isEditing, setIsEditing] = useState(false);

    const PageHead = useMemo(
        () => (
            <Head>
                <title>{router.query.username ? `${router.query.username as string} - Twitty` : 'Twitty'}</title>
                <meta name='description' content='Generated by create-t3-app' />
                <link rel='icon' href='/favicon.svg' />
            </Head>
        ),
        [router.query.username]
    );

    if (getUser.isError && getUser.error.data?.httpStatus === 404) {
        return <Page404 />;
    }

    if (!auth.isLoaded || getUser.isLoading || getCurrentUser.isLoading || follows.isLoading) {
        return <LoadingPage>{PageHead}</LoadingPage>;
    }

    return (
        <>
            {PageHead}
            <Layout>
                <div className='h-13 flex items-center border-[1px] border-t-0 border-solid border-gray-200'>
                    <Link
                        href='/'
                        className='ml-2 mr-6 rounded-full p-2 transition-colors duration-200 hover:bg-gray-200'
                    >
                        <AiOutlineArrowLeft />
                    </Link>
                    <div className='flex flex-col justify-evenly'>
                        <h1 className='text-xl font-semibold'>{getUser.data?.username}</h1>
                        <p className='text-sm text-gray-600'>
                            {postsNumber > 1 ? `${postsNumber} twitts` : `${postsNumber} twitt`}
                        </p>
                    </div>
                </div>
                <div className='border-[1px] border-t-0 border-solid border-gray-200'>
                    <div className='p-4'>
                        <div className='flex items-center justify-between'>
                            <Image
                                src={getUser.data?.avatar as string}
                                alt='Profile Picture'
                                width={120}
                                height={120}
                                className='h-[120px] w-[120px] rounded-full object-cover object-center'
                            />
                            <div>
                                {getCurrentUser.data && getCurrentUser.data?.id === getUser.data?.id ? (
                                    <Button onClick={() => setIsEditing(true)}>Edit profile</Button>
                                ) : (
                                    <>
                                        {isCurrentUserFollowing ? (
                                            <Button
                                                onClick={() =>
                                                    deleteFollow.mutate({ userId: getUser.data?.id as string })
                                                }
                                            >
                                                Unfollow
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() =>
                                                    createFollow.mutate({ userId: getUser.data?.id as string })
                                                }
                                                black
                                            >
                                                Follow
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='mt-3'>
                            <h1 className='text-xl font-bold'>{getUser.data?.username}</h1>
                            <p className='text-sm text-gray-500'>@{getUser.data?.username}</p>
                        </div>
                    </div>
                </div>
                <div className={getUserPosts.isLoading ? '' : 'border-x-[1px] border-solid border-gray-200'}>
                    <PostsList posts={getUserPosts.data} isLoading={getUserPosts.isLoading} clickable={true} />
                </div>
            </Layout>
            {isEditing && <EditProfileModal setIsEditing={setIsEditing} user={getCurrentUser.data} />}
        </>
    );
};

export default ProfilePage;
