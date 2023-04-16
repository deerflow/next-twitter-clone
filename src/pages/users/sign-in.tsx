import { SignIn } from '@clerk/nextjs';
import { type NextPage } from 'next';
import { useContext, useEffect } from 'react';
import Layout from '~/components/Layout';
import { LoginModalContext } from '~/components/LoginModalProvider';

const SignInPage: NextPage = () => {
    const { isOpen, setIsOpen } = useContext(LoginModalContext);

    useEffect(() => {
        isOpen && setIsOpen?.(false);
    }, [isOpen, setIsOpen]);

    return (
        <Layout>
            <div className='flex h-screen w-full items-center justify-center'>
                <SignIn signUpUrl='/users/sign-up' redirectUrl='/' />
            </div>
        </Layout>
    );
};

export default SignInPage;
