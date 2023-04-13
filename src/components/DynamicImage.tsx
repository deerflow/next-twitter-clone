import { type FC } from 'react';
import Image from 'next/image';

const DynamicImage: FC<Props> = ({ src, alt, containerHeight, containerWidth, className, ...props }) => {
    return (
        <div className={`relative h-${containerHeight} ${containerWidth ? `w-${containerWidth}` : ''}`}>
            <Image src={src} alt={alt} fill className={`object-contain ${className ? className : ''}`} {...props} />
        </div>
    );
};

type ImageProps = (typeof Image)['defaultProps'];
type Props = ImageProps & {
    containerHeight: number;
    containerWidth?: number;
    src: string;
    alt: string;
};

export default DynamicImage;
