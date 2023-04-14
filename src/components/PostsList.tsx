import { type Post } from '@prisma/client';
import { type FC } from 'react';
import Image from 'next/image';
import Spinner from './Spinner';
import { type RouterOutput } from '~/server/api/root';
import { AiOutlineDelete } from 'react-icons/ai';
import { api } from '~/utils/api';
import { useAuth } from '@clerk/nextjs';

const PostsList: FC<Props> = ({ posts, isLoading }) => {
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
                    key={post.id}
                    className='flex break-words border-b-[1px] border-solid border-gray-200 p-4 transition-colors duration-200 hover:bg-gray-100'
                >
                    <div className='flex w-full items-center'>
                        <Image
                            src={post.author.avatar}
                            alt='Default user image'
                            width={48}
                            height={48}
                            className='mr-3 h-12 w-12 rounded-full object-cover object-center'
                        />

                        <div className='w-[512px] min-w-0'>
                            <p className='break-words text-lg font-semibold'>{post.author?.username}</p>
                            <p className='whitespace-pre-line break-words'>{post.content}</p>
                        </div>
                    </div>
                    {user && user.data?.id === post.author.id && (
                        <button>
                            {!deletePost.isLoading ? (
                                <AiOutlineDelete
                                    className='h-5 w-5'
                                    onClick={() =>
                                        void deletePost.mutate(
                                            { postId: post.id },
                                            {
                                                onSuccess: () => void context.posts.getAll.invalidate(),
                                            }
                                        )
                                    }
                                />
                            ) : (
                                <Spinner size={5} />
                            )}
                        </button>
                    )}
                </div>
            ))}
        </div>
    ) : (
        <></>
    );
};

interface Props {
    posts?: (Omit<Post, 'author'> & { author: RouterOutput['users']['get'] })[] | null;
    isLoading?: boolean;
}

export default PostsList;
