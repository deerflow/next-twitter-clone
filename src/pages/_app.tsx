import { type AppType } from 'next/app';
import { Inter } from 'next/font/google';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <ClerkProvider {...pageProps}>
            <Toaster />
            <div className={inter.className}>
                <Component {...pageProps} />
            </div>
        </ClerkProvider>
    );
};

export default api.withTRPC(MyApp);
