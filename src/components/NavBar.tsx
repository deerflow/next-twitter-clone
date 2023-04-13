import { type FC } from 'react';
import Link from 'next/link';
import { AiOutlineUser, AiOutlineHome } from 'react-icons/ai';
import logo from '../assets/favicon.svg';
import Image, { type StaticImageData } from 'next/image';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';

const NavBar: FC = () => {
    const getCurrentUser = api.users.getCurrent.useQuery();
    const router = useRouter();

    return (
        <nav className='mt-6 flex-1 text-xl'>
            <div className='flex justify-center'>
                <ul>
                    <Link
                        href='/'
                        className='my-0.5 ml-1 flex w-fit rounded-full p-2 transition-colors duration-200 hover:bg-gray-200'
                    >
                        <Image src={logo as StaticImageData} alt='Main Logo' width={36} />
                    </Link>
                    <li>
                        <Link
                            href='/'
                            className='my-0.5 flex w-fit items-center rounded-full py-3 pl-4 pr-5 transition-colors duration-200 hover:bg-gray-200'
                        >
                            <AiOutlineHome className='mr-4 h-7 w-7' />
                            <p className={`${router.route === '/' ? 'font-bold' : ''}`}>Home</p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={`/${getCurrentUser.data?.username || ''}`}
                            className='my-0.5 flex w-fit items-center rounded-full py-3 pl-4 pr-5 transition-colors duration-200 hover:bg-gray-200'
                        >
                            <AiOutlineUser className='mr-4 h-7 w-7' />
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
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
