import mainIcon from '../assets/favicon.svg';
import Image, { type StaticImageData } from 'next/image';
import { type FCChildren } from 'deerflow-utils/types';

const LoadingPage: FCChildren = ({ children }) => {
    return (
        <>
            {children}
            <div className='flex h-screen items-center justify-center'>
                <Image src={mainIcon as StaticImageData} alt='Main Icon' width={64} height={64} />
            </div>
        </>
    );
};

export default LoadingPage;
