import {
    useState,
    type Dispatch,
    type FC,
    type SetStateAction,
    useEffect,
    useCallback,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Button from './Button';
import InputText from './InputText';
import { type RouterOutput } from '~/server/api/root';
import Image from 'next/image';
import { fileToBase64 } from 'deerflow-utils';
import { useClerk } from '@clerk/nextjs';

const EditProfileModal: FC<Props> = ({ setIsEditing, user }) => {
    const clerk = useClerk();
    const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
    const [email, setEmail] = useState<string | null>(user?.email || null);
    const [username, setUsername] = useState<string | null>(user?.username || null);

    useEffect(() => {
        if (user?.email && email === null) setEmail(user.email);
        if (user?.username && username === null) setUsername(user.username);
        if (user?.avatar && avatar === null) setAvatar(user.avatar);
    }, [user?.email, email, user?.username, user?.avatar, username, avatar]);

    const handleAvatarUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.currentTarget?.files?.[0]) return;
        const base64 = await fileToBase64(e.currentTarget.files[0]);
        typeof base64 === 'string' && setAvatar(base64);
    }, []);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (avatar && avatar !== user?.avatar) {
                const res = await fetch(avatar);
                const blob = await res.blob();
                await clerk.user?.setProfileImage({ file: blob });
            }
        },
        [avatar, user, clerk]
    );

    if (!user) {
        console.error('no user', user);
        return null;
    }

    return (
        <div
            className=' fixed left-0 top-0 flex h-screen w-full items-center justify-center bg-black/30 py-5'
            onClick={() => setIsEditing(false)}
        >
            <form
                onSubmit={handleSubmit}
                onClick={e => e.stopPropagation()}
                className='w-[585px] rounded-xl bg-white px-4 py-2.5'
            >
                <div className='flex justify-between'>
                    <div className='flex items-center'>
                        <button>
                            <AiOutlineClose className='h-5 w-5' />
                        </button>
                        <h2 className='pl-8 text-xl font-semibold'>Edit profile</h2>
                    </div>
                    <Button black type='submit'>
                        Save
                    </Button>
                </div>
                <label htmlFor='avatar-upload' className='mt-6 block w-fit cursor-pointer rounded-full'>
                    <Image
                        className='h-[100px] w-[100px] rounded-full object-cover object-center'
                        src={avatar}
                        alt='Profile picture'
                        width={100}
                        height={100}
                    />
                    <input
                        id='avatar-upload'
                        type='file'
                        className='hidden'
                        onChange={e => void handleAvatarUpload(e)}
                        accept='.jpg,.jpeg,.png'
                    />
                </label>
                <div className='mt-6'>
                    <InputText label='Email' value={email} onChange={e => setEmail(e.currentTarget.value)} />
                </div>
                <div className='mb-2 mt-6'>
                    <InputText label='Username' value={username} onChange={e => setUsername(e.currentTarget.value)} />
                </div>
            </form>
        </div>
    );
};

interface Props {
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    user: RouterOutput['users']['getCurrent'] | undefined;
}

export default EditProfileModal;
