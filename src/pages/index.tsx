import { type NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { api } from '~/utils/api';
import TextAreaAutosize from 'react-textarea-autosize';
import userPlaceholder from '../assets/user-placeholder.jpeg';
import Image from 'next/image';
import { useClerk } from '@clerk/nextjs';
import NavBar from '~/components/NavBar';

const Home: NextPage = () => {
    const { signOut } = useClerk();
    const context = api.useContext();

    const getEmail = api.users.getEmail.useQuery();
    const getPosts = api.posts.getAll.useQuery();
    const createPost = api.posts.create.useMutation();

    const [content, setContent] = useState('');
    const [tweetButtonDisabled, setTweetButtonDisabled] = useState(true);

    return (
        <>
            <Head>
                <title>Twitty</title>
                <meta name='description' content='Generated by create-t3-app' />
                <link rel='icon' href='/favicon.svg' />
            </Head>
            <main className='flex min-h-screen'>
                <NavBar />
                <div className='w-[600px]'>
                    <p>{getEmail.data?.email}</p>
                    <button onClick={() => void signOut()}>Sign Out</button>
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
                            src={userPlaceholder}
                            alt='Default user image'
                            width={48}
                            className='mr-3 h-12 rounded-full'
                        />
                        <TextAreaAutosize
                            value={content}
                            onChange={e => setContent(e.currentTarget.value)}
                            placeholder="What's happening?"
                            className='mt-2.5 w-full resize-none text-xl placeholder-gray-600 outline-none'
                        />
                        <div>
                            <button className='rounded-full bg-blue-500 px-4 py-2 font-medium text-white' type='submit'>
                                Tweet
                            </button>
                        </div>
                    </form>

                    <div>
                        {getPosts.data?.map(post => (
                            <div
                                key={post.id}
                                className='flex break-words border-[1px] border-t-0 border-solid border-gray-200 p-4 transition-colors duration-200 hover:bg-gray-100'
                            >
                                <Image
                                    src={userPlaceholder}
                                    alt='Default user image'
                                    width={48}
                                    height={48}
                                    className='mr-3 h-12 rounded-full'
                                />
                                <div className='min-w-0'>
                                    <p className='break-words text-lg font-semibold'>{post.author?.username}</p>
                                    <p className='whitespace-pre-line break-words'>{post.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='flex-1'>
                    <input placeholder='Search Twitty' />
                </div>
            </main>
        </>
    );
};

export default Home;
