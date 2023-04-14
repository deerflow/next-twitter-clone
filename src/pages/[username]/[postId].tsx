import { type NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '~/components/Layout';
import LoadingPage from '~/components/LoadingPage';
import { api } from '~/utils/api';
import Page404 from '../404';
import Link from 'next/link';
import { AiOutlineDelete } from 'react-icons/ai';
import Spinner from '~/components/Spinner';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';

const Post: NextPage = () => {
    const auth = useAuth();
    const router = useRouter();
    const context = api.useContext();
    const [username, postId] = [router.query.username, router.query.postId] as [string, string];

    const getPost = api.posts.getOne.useQuery({ postId });
    const deletePost = api.posts.delete.useMutation();

    if (getPost.isLoading || !auth.isLoaded) {
        return <LoadingPage />;
    }

    if (getPost.isError) {
        return <Page404 />;
    }

    if (getPost.data.author.username !== username) {
        void router.push(`/${getPost.data.author.username}/${getPost.data.id}`);
        return <LoadingPage />;
    }

    return (
        <Layout>
            <div className='flex break-words border-x-[1px] border-b-[1px] border-solid border-gray-200 p-4 transition-colors duration-200'>
                <div className='flex w-full'>
                    <Link href={`/${getPost.data.author.username}`}>
                        <Image
                            src={getPost.data.author.avatar}
                            alt='Default user image'
                            width={48}
                            height={48}
                            className='mr-3 h-12 w-12 rounded-full object-cover object-center'
                        />
                    </Link>

                    <div className='w-[512px] min-w-0'>
                        <Link
                            href={`/${getPost.data.author.username}`}
                            className='break-words text-lg font-semibold hover:underline'
                        >
                            {getPost.data.author?.username}
                        </Link>
                        <p className='whitespace-pre-line break-words'>{getPost.data.content}</p>
                    </div>
                </div>
                {auth && auth.userId === getPost.data.author.id && (
                    <button>
                        {!deletePost.isLoading ? (
                            <AiOutlineDelete
                                className='h-5 w-5'
                                onClick={() => {
                                    void deletePost.mutate(
                                        { postId: getPost.data.id },
                                        {
                                            onSuccess: () => {
                                                void context.posts.getAll.invalidate();
                                                void router.push('/');
                                            },
                                        }
                                    );
                                }}
                            />
                        ) : (
                            <Spinner size={5} />
                        )}
                    </button>
                )}
            </div>
        </Layout>
    );
};
export default Post;
