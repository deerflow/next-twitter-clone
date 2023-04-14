import { useRef, type FC, type InputHTMLAttributes } from 'react';

const InputText: FC<Props> = ({ label, maxChar, minLength, value, ...props }) => {
    const ref = useRef<HTMLInputElement>(null);

    return (
        <div
            onClick={() => ref.current?.focus()}
            className='input-container box-border flex cursor-text flex-col rounded border-[1px] border-solid border-gray-300 px-1.5 py-1 [&:has(input:focus)]:border-2 [&:has(input:focus)]:border-blue-500'
        >
            <div className='flex justify-between'>
                <label
                    htmlFor={label}
                    className={`w-fit ${
                        !value ? 'translate-x-2 translate-y-[11px] scale-[1.2]' : ''
                    } text-sm text-gray-500 transition-transform`}
                >
                    {label}
                </label>
                {maxChar && (
                    <p
                        className={`${
                            minLength && value.length < minLength ? 'text-red-400' : 'text-gray-500'
                        } text-sm`}
                    >
                        {value.length}/{maxChar}
                    </p>
                )}
            </div>
            <input
                ref={ref}
                id={label}
                className='outline-none'
                value={value}
                maxLength={maxChar}
                minLength={minLength}
                {...props}
            />
        </div>
    );
};

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    maxChar?: number;
    value: string;
}

export default InputText;
