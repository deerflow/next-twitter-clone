import { type FC } from 'react';
import Link from 'next/link';
import { AiOutlineUser, AiOutlineHome, AiOutlineDisconnect } from 'react-icons/ai';
import logo from '../assets/favicon.svg';
import Image, { type StaticImageData } from 'next/image';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { useAuth } from '@clerk/nextjs';
import { undefined } from 'zod';

const NavBar: FC = () => {
    const auth = useAuth();
    const getCurrentUser = api.users.getCurrent.useQuery(undefined, { enabled: auth.isSignedIn });
    const router = useRouter();
    console.log(router.route);

    return (
        <nav className='sticky top-0 box-border flex h-screen flex-1 justify-center pt-6 text-xl'>
            <div className='flex w-fit flex-col items-center justify-between'>
                <ul className='w-full'>
                    <li>
                        <Link
                            href='/'
                            className='ml-1.5 flex w-fit rounded-full p-2 transition-colors duration-200 hover:bg-gray-200'
                        >
                            <Image src={logo as StaticImageData} alt='Main Logo' width={36} />
                        </Link>
                    </li>
                    <li>
                        <Link
                            href='/'
                            className='my-0.5 flex w-fit items-center rounded-full py-3 pl-4 pr-5 transition-colors duration-200 hover:bg-gray-200'
                        >
                            <AiOutlineHome className='mr-4 h-7 w-7' strokeWidth={router.route === '/' ? 24 : 4} />
                            <p className={`${router.route === '/' ? 'font-bold' : ''}`}>Home</p>
                        </Link>
                    </li>
                    {auth.isSignedIn && (
                        <li>
                            <Link
                                href={`/${getCurrentUser.data?.username || ''}`}
                                className='my-0.5 flex w-fit items-center rounded-full py-3 pl-4 pr-5 transition-colors duration-200 hover:bg-gray-200'
                            >
                                <AiOutlineUser
                                    className='mr-4 h-7 w-7'
                                    strokeWidth={router.query.username === getCurrentUser?.data?.username ? 24 : 4}
                                />
                                <p
                                    className={`${
                                        router.query.username && router.query.username === getCurrentUser.data?.username
                                            ? 'font-bold'
                                            : ''
                                    }`}
                                >
                                    Profile
                                </p>
                            </Link>
                        </li>
                    )}
                </ul>

                {auth.isSignedIn && (
                    <div className='mb-5 flex w-64 justify-between p-2'>
                        <div className='flex items-center'>
                            <Image
                                src={getCurrentUser.data?.avatar}
                                alt={`${getCurrentUser.data?.username}'s avatar`}
                                width={48}
                                height={48}
                                className='h-12 w-12 rounded-full'
                            />
                            <div className='ml-2'>
                                <p className='text-base font-semibold leading-4'>{getCurrentUser.data?.username}</p>
                                <p className='text-sm text-gray-400'>@{getCurrentUser.data?.username}</p>
                            </div>
                        </div>
                        <button onClick={() => void auth.signOut()}>
                            <AiOutlineDisconnect />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
