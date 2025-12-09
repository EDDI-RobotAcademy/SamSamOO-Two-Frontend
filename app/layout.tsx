// app/layout.tsx
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from "react-hot-toast";
import Navbar from '../components/Navbar';

export const metadata = {
    title: 'SAMSAMOO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <Toaster position="top-center" />
                <AuthProvider>
                    <Navbar />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
