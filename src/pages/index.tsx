import { type NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { api } from '~/utils/api';
import TextAreaAutoSize from 'react-textarea-autosize';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import Layout from '~/components/Layout';
import PostsList from '~/components/PostsList';
import LoadingPage from '~/components/LoadingPage';

/*export const getServerSideProps: GetServerSideProps = async context => {
    const ssg = createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, auth: getAuth(context.req), ip: context.req.headers['x-forwarded-for'] },
        transformer: SuperJSON,
    });

    await ssg.users.getCurrent.prefetch();
    await ssg.posts.getAll.prefetch();

    return { props: { trpcState: ssg.dehydrate() } };
};*/

const PageHead = () => (
    <Head>
        <title>Twitty</title>
        <meta name='description' content='Generated by create-t3-app' />
        <link rel='icon' href='/favicon.svg' />
    </Head>
);

const Home: NextPage = () => {
    const auth = useAuth();
    const context = api.useContext();

    const getCurrentUser = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });
    const getPosts = api.posts.getAll.useQuery();
    const createPost = api.posts.create.useMutation();

    const [content, setContent] = useState('');
    const [isTweetButtonDisabled, setIsTweetButtonDisabled] = useState(true);

    useEffect(() => {
        setIsTweetButtonDisabled(content.length === 0);
    }, [content.length]);

    if (!auth.isLoaded || getCurrentUser.isLoading)
        return (
            <LoadingPage>
                <PageHead />
            </LoadingPage>
        );

    return (
        <>
            <PageHead />
            <Layout>
                <div className='w-[600px]'>
                    {auth.isSignedIn && (
                        <form
                            className='flex justify-between border-[1px] border-solid border-gray-200 p-4'
                            onSubmit={e => {
                                e.preventDefault();
                                createPost.mutate(
                                    { content },
                                    {
                                        onSuccess: () => {
                                            setContent('');
                                            void context.posts.getAll.invalidate();
                                        },
                                    }
                                );
                            }}
                        >
                            <Image
                                src={getCurrentUser.data?.avatar}
                                alt='Default user image'
                                width={48}
                                height={48}
                                className='mr-3 h-12 rounded-full'
                            />
                            <TextAreaAutoSize
                                value={content}
                                onChange={e => setContent(e.currentTarget.value)}
                                placeholder="What's happening?"
                                className='mt-2.5 w-[424px] resize-none text-xl placeholder-gray-600 outline-none'
                            />
                            <div className='ml-3'>
                                <button
                                    className='rounded-full bg-blue-500 px-4 py-2 font-medium text-white disabled:bg-blue-200'
                                    type='submit'
                                    disabled={isTweetButtonDisabled}
                                >
                                    Tweet
                                </button>
                            </div>
                        </form>
                    )}

                    <div className={getPosts.isLoading ? '' : 'border-[1px] border-y-0 border-solid'}>
                        <PostsList posts={getPosts.data} isLoading={getPosts.isLoading} />
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default Home;
