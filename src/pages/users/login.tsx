import { SignIn } from '@clerk/nextjs';
import { type NextPage } from 'next';

const Login: NextPage = () => {
    return <SignIn signUpUrl='/users/register' redirectUrl='/' />;
};

export default Login;
