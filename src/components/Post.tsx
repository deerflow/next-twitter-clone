import Link from 'next/link';
import router from 'next/router';
import { type FC } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegComment } from 'react-icons/fa';
import { type RouterOutput } from '~/server/api/root';
import Spinner from './Spinner';
import { useAuth } from '@clerk/nextjs';
import { api } from '~/utils/api';
import Image from 'next/image';

const Post: FC<Props> = ({ post, clickable }) => {
    const auth = useAuth();
    const context = api.useContext();
    const user = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });
    const deletePost = api.posts.delete.useMutation();

    return (
        <div
            onClick={clickable ? () => void router.push(`/${post.author.username}/${post.id}`) : undefined}
            key={post.id}
            className={`flex ${
                clickable ? 'cursor-pointer transition-colors duration-200 hover:bg-gray-100' : ''
            } flex-col break-words border-b-[1px] border-solid border-gray-200 p-4 pb-2 `}
        >
            <div className='mb-2 flex'>
                <div className='flex w-full'>
                    <Link href={`/${post.author.username}`}>
                        <Image
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
                <Image
                    alt='Uploaded image'
                    src={post.image.url}
                    width={post.image.width}
                    height={post.image.height}
                    blurDataURL={post.image.blurDataUrl}
                    placeholder='blur'
                    className='mb-2 mt-1'
                />
            )}
            <div className='mb-1 text-gray-600'>
                <div className='group flex w-fit items-center'>
                    <div className='rounded-full p-2 transition-colors duration-100 group-hover:bg-blue-300/25 group-hover:text-blue-500'>
                        <FaRegComment />
                    </div>
                    <p className='ml-1 text-sm transition-colors duration-100 group-hover:text-blue-500'>
                        {post._count.comments}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface Props {
    post: RouterOutput['posts']['getAll'][0];
    clickable?: boolean;
}

export default Post;
