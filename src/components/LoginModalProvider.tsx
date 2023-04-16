import { type FCChildren } from 'deerflow-utils/types';
import Link from 'next/link';
import { type Dispatch, type SetStateAction, createContext, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

export const LoginModalContext = createContext<{
    setIsOpen: Dispatch<SetStateAction<boolean>> | null;
    isOpen: boolean;
}>({
    setIsOpen: null,
    isOpen: false,
});

const LoginModalProvider: FCChildren = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <LoginModalContext.Provider value={{ setIsOpen, isOpen }}>
            {isOpen && (
                <div
                    className='fixed left-0 top-0 z-10 flex h-screen w-full items-center justify-center bg-black/30 py-5'
                    onClick={() => setIsOpen(false)}
                >
                    <div onClick={e => e.stopPropagation()} className='rounded-xl bg-white p-2.5'>
                        <button onClick={() => setIsOpen(false)}>
                            <AiOutlineClose className='h-5 w-5' />
                        </button>
                        <div className='m-6 flex w-[400px] flex-col items-center'>
                            <h2 className='mb-8 text-2xl font-bold'>Join twitty to perform this action</h2>
                            <Link
                                href='users/sign-in'
                                className='mb-3 block h-12 w-full rounded-full bg-blue-400 text-lg font-semibold text-white'
                            >
                                <div className='flex h-full items-center justify-center rounded-full transition-[backdrop-filter] duration-200 hover:backdrop-brightness-90'>
                                    Sign In
                                </div>
                            </Link>
                            <Link
                                href='/users/sign-up'
                                className='flex w-full items-center justify-center rounded-full border-[1px] border-solid border-gray-200 bg-white py-2.5 text-lg font-semibold text-blue-400 transition-colors duration-200 hover:bg-blue-50'
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </LoginModalContext.Provider>
    );
};

export default LoginModalProvider;
