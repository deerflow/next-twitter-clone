import { SignIn } from '@clerk/nextjs';
import { type NextPage } from 'next';

const SignInPage: NextPage = () => {
    return <SignIn signUpUrl='/users/sign-up' redirectUrl='/' />;
};

export default SignInPage;
