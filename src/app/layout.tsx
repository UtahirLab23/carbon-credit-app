import type { Metadata } from 'next';
import MuiThemeProvider from '@/components/providers/MuiThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Carbon Credit Exchange',
  description: 'Carbon credit management platform powered by Blackstone QMS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MuiThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
