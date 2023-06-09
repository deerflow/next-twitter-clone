import { type NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Layout from '~/components/Layout';
import { useAuth } from '@clerk/nextjs';
import GoBackButton from '~/components/GoBackButton';
import { api } from '~/utils/api';
import FollowsList from '~/components/FollowsList';
import Link from 'next/link';

const Followers: NextPage = () => {
    const router = useRouter();
    const auth = useAuth();

    const username = router.query.username as string;
    const getUser = api.users.get.useQuery({ username }, { enabled: router.isReady });
    const getFollowers = api.follows.getFollowersForUser.useQuery(
        { userId: getUser.data?.id as string },
        { enabled: getUser.isSuccess }
    );

    const PageHead = useMemo(
        () => (
            <Head>
                <title>{`People followed by ${username} - Twitty`}</title>
                <meta name='description' content='Generated by create-t3-app' />
                <link rel='icon' href='/favicon.svg' />
            </Head>
        ),
        [username]
    );

    return (
        <>
            {PageHead}
            <Layout>
                <div className='w-[600px]'>
                    <header className='border-x-[1px] border-b-[1px] border-solid border-gray-200'>
                        <div className='h-13 flex items-center border-x-[1px] border-solid border-gray-200'>
                            <GoBackButton href={`/${username}`} />
                            <div className='flex flex-col justify-evenly'>
                                <h1 className='text-xl font-semibold'>{getUser.data?.username}</h1>
                                <p className='text-sm text-gray-600'>@{getUser.data?.username}</p>
                            </div>
                        </div>
                        <ul className='mt-1 flex justify-around'>
                            <li className='block flex-1'>
                                <Link
                                    href={`/${username}/followers`}
                                    className='flex w-full justify-center p-3.5 font-bold transition-colors duration-200 hover:bg-gray-200'
                                >
                                    Followers
                                </Link>
                            </li>
                            <li className='block flex-1'>
                                <Link
                                    href={`/${username}/following`}
                                    className='flex w-full justify-center p-3.5 transition-colors duration-200 hover:bg-gray-200'
                                >
                                    Following
                                </Link>
                            </li>
                        </ul>
                    </header>
                    <FollowsList follows={getFollowers.data} isLoading={getFollowers.isLoading} />
                </div>
            </Layout>
        </>
    );
};

export default Followers;
