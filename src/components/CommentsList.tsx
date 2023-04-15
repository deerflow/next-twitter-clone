import Link from 'next/link';
import { type FC } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Spinner from './Spinner';
import Image from 'next/image';
import { type RouterOutput } from '~/server/api/root';
import { useAuth } from '@clerk/nextjs';
import { api } from '~/utils/api';

const CommentsList: FC<Props> = ({ comments }) => {
    const auth = useAuth();
    const context = api.useContext();

    const user = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });
    const deleteComment = api.comments.delete.useMutation();

    if (!comments) return null;

    return (
        comments &&
        comments.length > 0 && (
            <div>
                {comments.map(comment => (
                    <div
                        key={comment.id}
                        className='flex flex-col break-words border-b-[1px] border-solid border-gray-200 p-4 transition-colors duration-200 hover:bg-gray-100'
                    >
                        <div className='mb-3 flex'>
                            <div className='flex w-full'>
                                <Link href={`/${comment.authorId}`}>
                                    <Image
                                        src={comment.author.avatar}
                                        alt='Default user image'
                                        width={48}
                                        height={48}
                                        className='mr-3 h-12 w-12 rounded-full object-cover object-center'
                                    />
                                </Link>

                                <div className='w-[512px] min-w-0'>
                                    <Link
                                        href={`/${comment.author.username}`}
                                        className='break-words text-lg font-semibold hover:underline'
                                    >
                                        {comment.author?.username}
                                    </Link>
                                    <p className='whitespace-pre-line break-words'>{comment.content}</p>
                                </div>
                            </div>
                            {user && user.data?.id === comment.author.id && (
                                <button>
                                    {!deleteComment.isLoading ? (
                                        <AiOutlineDelete
                                            className='h-5 w-5'
                                            onClick={e => {
                                                e.stopPropagation();
                                                void deleteComment.mutate(
                                                    { id: comment.id },
                                                    {
                                                        onSuccess: () => {
                                                            void context.comments.getAllForPost.invalidate({
                                                                postId: comment.postId,
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
                        {/*post.image && (
                        <NextImage
                            alt='Uploaded image'
                            src={post.image.url}
                            width={post.image.width}
                            height={post.image.height}
                            blurDataURL={post.image.blurDataUrl}
                            placeholder='blur'
                        />
                    )*/}
                    </div>
                ))}
            </div>
        )
    );
};

interface Props {
    comments?: RouterOutput['comments']['getAllForPost'];
    isLoading?: boolean;
}

export default CommentsList;
