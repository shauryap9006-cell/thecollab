import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const soriaFont = localFont({
  src: '../public/soria-font.ttf',
  variable: '--font-soria',
  display: 'swap',
  fallback: ['serif'],
});

const vercettiFont = localFont({
  src: '../public/Vercetti-Regular.woff',
  variable: '--font-vercetti',
  display: 'swap',
  fallback: ['sans-serif'],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : (process.env.NEXT_PUBLIC_BASE_PATH ? 'https://shauryap9006-cell.github.io/thecollab' : 'https://thecollab.vercel.app');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'thecollab — Your Website. Your Brand. Your Reach.',
  description:
    'thecollab is a digital growth agency helping businesses build a stronger online presence through high-quality websites, social media content, and creator-led marketing campaigns.',
  keywords:
    'thecollab, digital growth agency, website development, Instagram marketing, creator collaborations, influencer marketing, local marketing, reels, social media strategy, brand presence',
  authors: [{ name: 'thecollab' }],
  creator: 'thecollab',
  publisher: 'thecollab',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'thecollab — Your Website. Your Brand. Your Reach.',
    description:
      'A digital growth agency: websites, social media, and creator-led marketing campaigns.',
    url: siteUrl,
    siteName: 'thecollab',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'thecollab — Your Website. Your Brand. Your Reach.',
    description:
      'A digital growth agency: websites, social media, and creator-led marketing campaigns.',
  },
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.svg`.replace(/^\/\//, '/'),
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-y-none">
      <body className={`${soriaFont.variable} ${vercettiFont.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
