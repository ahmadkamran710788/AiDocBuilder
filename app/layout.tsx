import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Montserrat, Public_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/Toaster';
import { baseUrl, SITE_NAME } from '@/lib/site';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-public-sans', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: 'Guides for setting up processes, keys, parties and agents in AIDocBuilder, uploading transactions, and fixing common problems.',
  openGraph: { siteName: SITE_NAME, type: 'website' },
};
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#282f40' },
    { media: '(prefers-color-scheme: dark)', color: '#20263a' },
  ],
};

// Applies the reader's saved light/dark choice before the first paint.
const themeScript = `try{var t=localStorage.getItem('adb-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${publicSans.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
