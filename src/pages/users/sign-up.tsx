import { SignUp } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Layout from '~/components/Layout';

const SignUpPage: NextPage = () => {
    return (
        <Layout>
            <div className='flex h-screen w-full items-center justify-center'>
                <SignUp signInUrl='/users/sign-in' redirectUrl='/' />
            </div>
        </Layout>
    );
};

export default SignUpPage;
