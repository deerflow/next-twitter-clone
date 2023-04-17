import { type FCChildren } from 'deerflow-utils/types';
import NavBar from './NavBar';
import { type ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import LoginBar from './LoginBar.';
import { useRouter } from 'next/router';

const Layout: FCChildren<Props> = ({ children, left, right }) => {
    const auth = useAuth();
    const router = useRouter();
    return (
        <div className='flex min-h-screen'>
            {left || <NavBar />}
            <main className='w-[600px] max-md:w-[500px] max-sm:w-[380px] max-[460px]:w-[240px]'>{children}</main>
            {right || <div className='flex-1 max-lg:hidden' />}
            {auth.isLoaded &&
                !auth.isSignedIn &&
                router.route !== '/users/sign-in' &&
                router.route !== '/users/sign-up' && <LoginBar />}
        </div>
    );
};

interface Props {
    left?: ReactNode;
    right?: ReactNode;
}

export default Layout;
