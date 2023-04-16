import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { type RouterOutput } from '~/server/api/root';
import { api } from '~/utils/api';

const usePostMutation = ({ post, onPostDeleteSuccess }: usePostMutationParams) => {
    const auth = useAuth();
    const context = api.useContext();
    const user = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });
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
            onPostDeleteSuccess?.();
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
            void context.posts.getFollowingPosts.invalidate();
        },
        onMutate: async ({ postId }) => {
            const [previousPosts, previousUserPosts, previousPost, previousFollowingPosts] = [
                context.posts.getAll.getData(),
                context.posts.getUserPosts.getData({ username: post.author.username }),
                context.posts.getOne.getData({ postId }),
                context.posts.getFollowingPosts.getData(),
            ];
            if (auth.userId) {
                await Promise.all([
                    context.posts.getAll.cancel(),
                    context.posts.getUserPosts.cancel({ username: post.author.username }),
                    context.posts.getOne.cancel({ postId }),
                    context.posts.getFollowingPosts.cancel(),
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

                context.posts.getFollowingPosts.setData(undefined, old => {
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
            }

            return { previousPosts, previousUserPosts, previousPost, previousFollowingPosts };
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
            const [previousPosts, previousUserPosts, previousPost, previousFollowingPosts] = [
                context.posts.getAll.getData(),
                context.posts.getUserPosts.getData({ username: post.author.username }),
                context.posts.getOne.getData({ postId }),
                context.posts.getFollowingPosts.getData(),
            ];
            if (auth.userId) {
                await Promise.all([
                    context.posts.getAll.cancel(),
                    context.posts.getUserPosts.cancel({ username: post.author.username }),
                    context.posts.getOne.cancel({ postId }),
                    context.posts.getFollowingPosts.cancel(),
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

                context.posts.getFollowingPosts.setData(undefined, old => {
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
            }

            return { previousPosts, previousUserPosts, previousPost, previousFollowingPosts };
        },
        onError: (error, _variables, previousState) => {
            toast.error(error.message);
            context.posts.getAll.setData(undefined, previousState?.previousPosts);
            context.posts.getUserPosts.setData({ username: post.author.username }, previousState?.previousUserPosts);
            context.posts.getOne.setData({ postId: post.id }, previousState?.previousPost);
            context.posts.getFollowingPosts.setData(undefined, previousState?.previousFollowingPosts);
        },
    });

    return { deletePost, createLike, deleteLike };
};

interface usePostMutationParams {
    post: RouterOutput['posts']['getAll'][0];
    onPostDeleteSuccess?: () => void;
}

export default usePostMutation;
