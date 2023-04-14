import { type FCChildren } from 'deerflow-utils/types';
import NavBar from './NavBar';
import { type ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import LoginBar from './LoginBar.';

const Layout: FCChildren<Props> = ({ children, left, right }) => {
    const auth = useAuth();
    return (
        <div className='flex min-h-screen'>
            {left || <NavBar />}
            <main className='w-[600px]'>{children}</main>
            {right || <div className='flex-1' />}
            {auth.isLoaded && !auth.isSignedIn && <LoginBar />}
        </div>
    );
};

interface Props {
    left?: ReactNode;
    right?: ReactNode;
}

export default Layout;
