import { type FC } from 'react';
import Spinner from './Spinner';
import { type RouterOutput } from '~/server/api/root';
import Post from './Post';

const PostsList: FC<Props> = ({ posts, isLoading, clickable }) => {
    if (isLoading)
        return (
            <div className='mt-5 flex justify-center'>
                <Spinner />
            </div>
        );

    return (
        <>
            {!!posts && posts.length > 0 && (
                <div>
                    {posts.map(post => (
                        <Post post={post} key={post.id} clickable={clickable} />
                    ))}
                </div>
            )}
        </>
    );
};

interface Props {
    posts?: RouterOutput['posts']['getAll'] | undefined;
    isLoading?: boolean;
    clickable?: boolean;
}

export default PostsList;
