import { type NextPage } from 'next';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';

/*export const getServerSideProps: GetServerSideProps = async context => {
    const ssg = getSSG(context);

    await ssg.users.get.prefetch({ username: context.params?.username as string });

    return {
        props: {
            trpcState: ssg.dehydrate(),
        },
    };
};*/

const ProfilePage: NextPage = () => {
    const router = useRouter();
    const username = router.query.username as string;
    const getUser = api.users.get.useQuery({ username }, { enabled: router.isReady });
    return <div />;
};

export default ProfilePage;
