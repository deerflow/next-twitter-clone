import { type GetServerSideProps, type NextPage } from 'next';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import Layout from '~/components/Layout';
import { appRouter } from '../server/api/root';
import { prisma } from '~/server/db';
import superjson from 'superjson';
import { getAuth } from '@clerk/nextjs/server';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import Link from 'next/link';
import Image from 'next/image';
import Button from '~/components/Button';
import PostsList from '~/components/PostsList';

export const getServerSideProps: GetServerSideProps = async context => {
    const ssg = createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, auth: getAuth(context.req), ip: context.req.headers['x-forwarded-for'] },
        transformer: superjson,
    });

    const username = context.params?.username;

    if (typeof username !== 'string') {
        throw new Error('Invalid username');
    }

    await Promise.all([ssg.users.get.prefetch({ username }), ssg.users.getCurrent.prefetch()]);

    return {
        props: {
            trpcState: ssg.dehydrate(),
        },
    };
};

const ProfilePage: NextPage = () => {
    const router = useRouter();
    const username = router.query.username as string;
    const getUser = api.users.get.useQuery({ username }, { enabled: router.isReady });
    const getCurrentUser = api.users.getCurrent.useQuery();
    const getUserPosts = api.posts.getUserPosts.useQuery({ username });

    if (getUser.isLoading || getCurrentUser.isLoading || getUserPosts.isLoading) {
        return <Layout>Loading...</Layout>;
    }

    return (
        <Layout>
            <div className='h-13 flex items-center border-[1px] border-t-0 border-solid border-gray-200'>
                <Link href='/' className='ml-2 mr-6 rounded-full p-2 transition-colors duration-200 hover:bg-gray-200'>
                    <AiOutlineArrowLeft />
                </Link>
                <div className='flex flex-col justify-evenly'>
                    <h1 className='text-xl font-semibold'>{getUser.data?.username}</h1>
                    <p className='text-sm text-gray-600'>0 twitts</p>
                </div>
            </div>
            <div className='border-[1px] border-t-0 border-solid border-gray-200'>
                <div className='border-b-[1px] border-solid p-4'>
                    <div className='flex items-center justify-between'>
                        <Image
                            src={getUser.data?.avatar as string}
                            alt='Profile Picture'
                            width={120}
                            height={120}
                            className='rounded-full'
                        />
                        {getCurrentUser.data && getCurrentUser.data?.id === getUser.data?.id && (
                            <div>
                                <Button>Edit profile</Button>
                            </div>
                        )}
                    </div>
                    <div className='mt-3'>
                        <h1 className='text-xl font-bold'>{getUser.data?.username}</h1>
                        <p className='text-sm text-gray-500'>@{getUser.data?.username}</p>
                    </div>
                </div>
                <PostsList posts={getUserPosts.data} />
            </div>
        </Layout>
    );
};

export default ProfilePage;
