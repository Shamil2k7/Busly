import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import ToastContainer from '@/components/ui/Toast';

export const metadata = {
  title: 'BUSLY | Smart School Transport',
  description: 'Production-grade School Transportation Management Platform for Schools, Teachers, Drivers, and Parents',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-busly-bg text-busly-dark antialiased">
        <AuthProvider>
          <SocketProvider>
            {children}
            <ToastContainer />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
