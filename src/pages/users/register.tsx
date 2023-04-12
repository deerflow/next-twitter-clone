import { SignUp } from '@clerk/nextjs';
import { type NextPage } from 'next';

const Register: NextPage = () => {
    return <SignUp signInUrl='/users/login' redirectUrl='/' />;
};

export default Register;
