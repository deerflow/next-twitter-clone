import { type Post } from '@prisma/client';
import { type FC } from 'react';
import Image from 'next/image';
import { type SimpleUser } from '~/types';

const PostsList: FC<Props> = ({ posts }) => {
    return posts && posts.length > 0 ? (
        <div>
            {posts.map(post => (
                <div
                    key={post.id}
                    className='flex break-words border-b-[1px] border-solid border-gray-200 p-4 transition-colors duration-200 hover:bg-gray-100'
                >
                    <Image
                        src={post.author.avatar}
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
    ) : (
        <></>
    );
};

interface Props {
    posts?: (Omit<Post, 'author'> & { author: SimpleUser })[] | null;
}

export default PostsList;
