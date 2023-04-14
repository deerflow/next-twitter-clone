import { useState, type Dispatch, type FC, type SetStateAction, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Button from './Button';
import InputText from './InputText';
import { type RouterOutput } from '~/server/api/root';
import Image from 'next/image';

const EditProfileModal: FC<Props> = ({ setIsEditing, user }) => {
    const [email, setEmail] = useState(user?.email || '');
    const [username, setUsername] = useState(user?.username || '');

    useEffect(() => {
        if (user?.email) setEmail(user.email);
    }, [user?.email]);

    useEffect(() => {
        if (user?.username) setUsername(user.username);
    }, [user?.username]);

    if (!user) {
        console.error('no user', user);
        return null;
    }

    return (
        <div
            className=' fixed left-0 top-0 flex h-screen w-full items-center justify-center bg-black/30 py-5'
            onClick={() => setIsEditing(false)}
        >
            <div onClick={e => e.stopPropagation()} className='w-[585px] rounded-xl bg-white px-4 py-2.5'>
                <div className='flex justify-between'>
                    <div className='flex items-center'>
                        <button>
                            <AiOutlineClose className='h-5 w-5' />
                        </button>
                        <h2 className='pl-8 text-xl font-semibold'>Edit profile</h2>
                    </div>
                    <Button black>Save</Button>
                </div>
                <button className='mt-6'>
                    <Image className='rounded-full' src={user.avatar} alt='Profile picture' width={100} height={100} />
                </button>
                <div className='mt-6'>
                    <InputText label='Email' value={email} onChange={e => setEmail(e.currentTarget.value)} />
                </div>
                <div className='mb-2 mt-6'>
                    <InputText label='Username' value={username} onChange={e => setUsername(e.currentTarget.value)} />
                </div>
            </div>
        </div>
    );
};

interface Props {
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    user: RouterOutput['users']['getCurrent'] | undefined;
}

export default EditProfileModal;
