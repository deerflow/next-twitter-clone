import { type FCChildren } from 'deerflow-utils/types';
import { type ButtonHTMLAttributes } from 'react';

const Button: FCChildren<Props> = ({ children, black, ...props }) => {
    return (
        <button
            className={`rounded-full border-[1px] border-solid border-gray-300 px-4 py-1.5 font-semibold ${
                black ? 'bg-black text-white' : ''
            }`}
            {...props}
        >
            {children}
        </button>
    );
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    black?: boolean;
}

export default Button;
