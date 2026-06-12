import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sintex Analytics Hub | Dashboard Portal',
  description:
    'Enterprise analytics portal for Sintex — access all Power BI dashboards, reports, and AI analytics tools in one place.',
  keywords: ['Sintex', 'analytics', 'dashboard', 'Power BI', 'reports', 'enterprise'],
  authors: [{ name: 'Sintex Analytics Team' }],
  openGraph: {
    title: 'Sintex Analytics Hub',
    description: 'One portal for all your business intelligence dashboards.',
    type: 'website',
    siteName: 'Sintex Analytics Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sintex Analytics Hub',
    description: 'Enterprise analytics portal for Sintex.',
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('sintex_theme');
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
