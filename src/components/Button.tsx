import { type FCChildren } from 'deerflow-utils/types';
import { type ButtonHTMLAttributes } from 'react';

const Button: FCChildren<Props> = ({ children, black, ...props }) => {
    return (
        <button
            className={`rounded-full border-[1px] border-solid border-gray-300 px-4 py-1.5 font-semibold transition-colors duration-200 ${
                black ? 'bg-black text-white hover:bg-gray-800' : 'hover:bg-gray-200'
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
