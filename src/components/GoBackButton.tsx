import Link from 'next/link';
import { type FC } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';

const GoBackButton: FC<Props> = ({ href }) => {
    return (
        <Link href={href} className='ml-2 mr-6 rounded-full p-2 transition-colors duration-200 hover:bg-gray-200'>
            <AiOutlineArrowLeft />
        </Link>
    );
};

interface Props {
    href: string;
}

export default GoBackButton;
