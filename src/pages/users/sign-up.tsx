import { SignUp } from '@clerk/nextjs';
import { type NextPage } from 'next';

const SignUpPage: NextPage = () => {
    return <SignUp signInUrl='/users/sign-in' redirectUrl='/' />;
};

export default SignUpPage;
