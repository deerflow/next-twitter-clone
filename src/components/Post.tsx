import Link from 'next/link';
import router from 'next/router';
import { useMemo, type FC } from 'react';
import { AiFillHeart, AiOutlineDelete, AiOutlineHeart } from 'react-icons/ai';
import { FaRegComment } from 'react-icons/fa';
import { type RouterOutput } from '~/server/api/root';
import Spinner from './Spinner';
import { useAuth } from '@clerk/nextjs';
import { api } from '~/utils/api';
import Image from 'next/image';
import toast from 'react-hot-toast';

const Post: FC<Props> = ({ post, clickable }) => {
    const auth = useAuth();
    const context = api.useContext();
    const user = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });

    const hasUserLikedThePost = useMemo(
        () => !!auth.userId && post.likes.map(like => like.authorId).includes(auth.userId),
        [auth.userId, post.likes]
    );

    const deletePost = api.posts.delete.useMutation({
        onMutate: async ({ postId }) => {
            await Promise.all([context.posts.getAll.cancel(), context.posts.getUserPosts.cancel()]);

            const previousPosts = context.posts.getAll.getData();

            context.posts.getAll.setData(undefined, old => {
                return old?.filter(post => post.id !== postId);
            });

            if (user.data?.username) {
                const previousUserPosts = context.posts.getUserPosts.getData({ username: user.data?.username });
                context.posts.getUserPosts.setData({ username: user.data.username }, old => {
                    return old?.filter(post => post.id !== postId);
                });
                return { previousPosts, previousUserPosts };
            }

            return { previousPosts, previousUserPosts: null };
        },
        onSuccess: () => {
            void context.posts.getAll.invalidate();
            void context.posts.getUserPosts.invalidate({
                username: user.data?.username,
            });
        },
        onError: (error, _variables, prev) => {
            toast.error(error.message);
            context.posts.getAll.setData(undefined, prev?.previousPosts);
            if (prev?.previousUserPosts)
                context.posts.getUserPosts.setData(
                    { username: user.data?.username as string },
                    prev?.previousUserPosts
                );
        },
    });

    const createLike = api.likes.create.useMutation({
        onSuccess: () => {
            void context.posts.getAll.invalidate();
            void context.posts.getUserPosts.invalidate({
                username: user.data?.username,
            });
            void context.posts.getOne.invalidate({ postId: post.id });
        },
        onMutate: async ({ postId }) => {
            const [previousPosts, previousUserPosts, previousPost] = [
                context.posts.getAll.getData(),
                context.posts.getUserPosts.getData({ username: post.author.username }),
                context.posts.getOne.getData({ postId }),
            ];
            if (auth.userId) {
                await Promise.all([
                    context.posts.getAll.cancel(),
                    context.posts.getUserPosts.cancel({ username: post.author.username }),
                    context.posts.getOne.cancel({ postId }),
                ]);

                context.posts.getAll.setData(undefined, old => {
                    return old?.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                likes: [...post.likes, { id: 'optimistic', authorId: auth.userId, postId }],
                            };
                        }
                        return post;
                    });
                });

                context.posts.getUserPosts.setData({ username: post.author.username }, old => {
                    return old?.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                likes: [...post.likes, { id: 'optimistic', authorId: auth.userId, postId }],
                            };
                        }
                        return post;
                    });
                });

                context.posts.getOne.setData({ postId }, old => {
                    if (!old) return old;
                    return { ...old, likes: [...old.likes, { id: 'optimistic', authorId: auth.userId, postId }] };
                });
            }

            return { previousPosts, previousUserPosts, previousPost };
        },
        onError: (error, _variables, previousState) => {
            toast.error(error.message);
            context.posts.getAll.setData(undefined, previousState?.previousPosts);
            context.posts.getUserPosts.setData({ username: post.author.username }, previousState?.previousUserPosts);
            context.posts.getOne.setData({ postId: post.id }, previousState?.previousPost);
        },
    });

    const deleteLike = api.likes.delete.useMutation({
        onSuccess: () => {
            void context.posts.getAll.invalidate();
            void context.posts.getUserPosts.invalidate({
                username: user.data?.username,
            });
            void context.posts.getOne.invalidate({ postId: post.id });
        },
        onMutate: async ({ postId }) => {
            const [previousPosts, previousUserPosts, previousPost] = [
                context.posts.getAll.getData(),
                context.posts.getUserPosts.getData({ username: post.author.username }),
                context.posts.getOne.getData({ postId }),
            ];
            if (auth.userId) {
                await Promise.all([
                    context.posts.getAll.cancel(),
                    context.posts.getUserPosts.cancel({ username: post.author.username }),
                    context.posts.getOne.cancel({ postId }),
                ]);

                context.posts.getAll.setData(undefined, old => {
                    return old?.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                likes: post.likes.filter(like => like.authorId !== auth.userId),
                            };
                        }
                        return post;
                    });
                });

                context.posts.getUserPosts.setData({ username: post.author.username }, old => {
                    return old?.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                likes: post.likes.filter(like => like.authorId !== auth.userId),
                            };
                        }
                        return post;
                    });
                });

                context.posts.getOne.setData({ postId }, old => {
                    if (!old) return old;
                    return { ...old, likes: old.likes.filter(like => like.authorId !== auth.userId) };
                });
            }

            return { previousPosts, previousUserPosts, previousPost };
        },
        onError: (error, _variables, previousState) => {
            toast.error(error.message);
            context.posts.getAll.setData(undefined, previousState?.previousPosts);
            context.posts.getUserPosts.setData({ username: post.author.username }, previousState?.previousUserPosts);
            context.posts.getOne.setData({ postId: post.id }, previousState?.previousPost);
        },
    });

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
                                    deletePost.mutate({ postId: post.id });
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
            <div className='mb-1 flex text-gray-600'>
                <div className='group flex w-fit items-center'>
                    <div className='rounded-full p-2 transition-colors duration-100 group-hover:bg-blue-300/25 group-hover:text-blue-500'>
                        <FaRegComment />
                    </div>
                    <p className='ml-1 text-sm transition-colors duration-100 group-hover:text-blue-500'>
                        {post._count.comments}
                    </p>
                </div>
                <div
                    className='group ml-8 flex w-fit cursor-pointer items-center'
                    onClick={e => {
                        e.stopPropagation();
                        hasUserLikedThePost
                            ? deleteLike.mutate({ postId: post.id })
                            : createLike.mutate({ postId: post.id });
                    }}
                >
                    <div className='rounded-full p-2 transition-colors duration-100 group-hover:bg-red-300/25 group-hover:text-red-500'>
                        {hasUserLikedThePost ? <AiFillHeart className='text-red-500' /> : <AiOutlineHeart />}
                    </div>
                    <p
                        className={`ml-1 text-sm transition-colors duration-100 ${
                            hasUserLikedThePost ? 'text-red-500' : 'group-hover:text-red-500'
                        }`}
                    >
                        {post.likes?.length || 0}
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
