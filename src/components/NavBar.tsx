import { type FC } from 'react';
import Link from 'next/link';
import { AiOutlineUser, AiOutlineHome } from 'react-icons/ai';

const NavBar: FC = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link href='/'>
                        <AiOutlineHome />
                        <p>Home</p>
                    </Link>
                </li>
                <li>
                    <Link href='/'>
                        <AiOutlineUser />
                        <p>Profile</p>
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
