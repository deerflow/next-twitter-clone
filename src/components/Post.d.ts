import { type FC } from 'react';
import { type RouterOutput } from '~/server/api/root';
declare const Post: FC<Props>;
interface Props {
    post: RouterOutput['posts']['getAll'][0];
    clickable?: boolean;
    onMutate?: ((variables: {
        postId: string;
    }) => void | Promise<void | undefined> | undefined) | undefined;
}
export default Post;
