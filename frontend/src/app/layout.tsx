import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hisse Analiz - AI Destekli Finansal Analiz',
  description: 'Hisse senedi grafiklerini ve finansal tabloları yapay zeka ile analiz edin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#0b1120] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
