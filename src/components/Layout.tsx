import { type FCChildren } from 'deerflow-utils/types';
import NavBar from './NavBar';
import { type ReactNode } from 'react';

const Layout: FCChildren<Props> = ({ children, left, right }) => {
    return (
        <div className='flex min-h-screen'>
            {left || <NavBar />}
            <main className='w-[600px]'>{children}</main>
            {right || (
                <div className='flex-1'>
                    <input placeholder='Search Twitty' />
                </div>
            )}
        </div>
    );
};

interface Props {
    left?: ReactNode;
    right?: ReactNode;
}

export default Layout;
