import { type Image, type Post } from '@prisma/client';
import { type FC } from 'react';
import Spinner from './Spinner';
import { type RouterOutput } from '~/server/api/root';
import { AiOutlineDelete } from 'react-icons/ai';
import { api } from '~/utils/api';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NextImage from 'next/image';

const PostsList: FC<Props> = ({ posts, isLoading }) => {
    const router = useRouter();
    const auth = useAuth();
    const context = api.useContext();
    const user = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });
    const deletePost = api.posts.delete.useMutation();

    if (isLoading)
        return (
            <div className='mt-5 flex justify-center'>
                <Spinner />
            </div>
        );

    return posts && posts.length > 0 ? (
        <div>
            {posts.map(post => (
                <div
                    onClick={() => void router.push(`/${post.author.username}/${post.id}`)}
                    key={post.id}
                    className='flex cursor-pointer flex-col break-words border-b-[1px] border-solid border-gray-200 p-4 transition-colors duration-200 hover:bg-gray-100'
                >
                    <div className='mb-3 flex'>
                        <div className='flex w-full'>
                            <Link href={`/${post.author.username}`}>
                                <NextImage
                                    src={post.author.avatar}
                                    alt='Default user image'
                                    width={48}
                                    height={48}
                                    className='mr-3 h-12 w-12 rounded-full object-cover object-center'
                                />
                            </Link>

                            <div className='w-[512px] min-w-0'>
                                <Link
                                    href={`/${post.author.username}`}
                                    className='break-words text-lg font-semibold hover:underline'
                                >
                                    {post.author?.username}
                                </Link>
                                <p className='whitespace-pre-line break-words'>{post.content}</p>
                            </div>
                        </div>
                        {user && user.data?.id === post.author.id && (
                            <button>
                                {!deletePost.isLoading ? (
                                    <AiOutlineDelete
                                        className='h-5 w-5'
                                        onClick={e => {
                                            e.stopPropagation();
                                            void deletePost.mutate(
                                                { postId: post.id },
                                                {
                                                    onSuccess: () => {
                                                        void context.posts.getAll.invalidate();
                                                        void context.posts.getUserPosts.invalidate({
                                                            username: user.data?.username,
                                                        });
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
                    {post.image && (
                        <NextImage
                            alt='Uploaded image'
                            src={post.image.url}
                            width={post.image.width}
                            height={post.image.height}
                        />
                    )}
                </div>
            ))}
        </div>
    ) : (
        <></>
    );
};

interface Props {
    posts?: (Omit<Post, 'author'> & { author: RouterOutput['users']['get'] } & { image: Image })[] | null;
    isLoading?: boolean;
}

export default PostsList;
