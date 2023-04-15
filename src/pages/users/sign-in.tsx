import { SignIn } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Layout from '~/components/Layout';

const SignInPage: NextPage = () => {
    return (
        <Layout>
            <div className='flex h-screen w-full items-center justify-center'>
                <SignIn signUpUrl='/users/sign-up' redirectUrl='/' />
            </div>
        </Layout>
    );
};

export default SignInPage;
