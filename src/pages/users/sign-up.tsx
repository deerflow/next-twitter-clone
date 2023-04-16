import { SignUp } from '@clerk/nextjs';
import { type NextPage } from 'next';
import { useContext, useEffect } from 'react';
import Layout from '~/components/Layout';
import { LoginModalContext } from '~/components/LoginModalProvider';

const SignUpPage: NextPage = () => {
    const { isOpen, setIsOpen } = useContext(LoginModalContext);

    useEffect(() => {
        isOpen && setIsOpen?.(false);
    }, [isOpen, setIsOpen]);

    return (
        <Layout>
            <div className='flex h-screen w-full items-center justify-center'>
                <SignUp signInUrl='/users/sign-in' redirectUrl='/' />
            </div>
        </Layout>
    );
};

export default SignUpPage;
