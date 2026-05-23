import './globals.css';
import { Inter, Outfit, Orbitron } from 'next/font/google';
import NavigationMenu from '@/components/NavigationMenu';
import ParticleBackground from '@/components/ParticleBackground';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-heading',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata = {
  title: 'Forza Horizon — Kalkulator Tekanan Ban & Gearing',
  description:
    'Kalkulator tekanan ban dan rasio gigi (gearing) untuk Forza Horizon 6. Fitur AI OCR untuk membaca grafik mesin secara otomatis. Gratis dan akurat.',
  keywords: [
    'forza horizon',
    'tire pressure calculator',
    'gearing calculator',
    'forza tuning',
    'kalkulator tekanan ban',
    'forza horizon 6',
    'base tune',
  ],
  openGraph: {
    title: 'Forza Horizon — Kalkulator Tekanan Ban & Gearing',
    description:
      'Hitung base tune tekanan ban dan rasio transmisi untuk Forza Horizon. Fitur AI otomatis!',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${outfit.variable} ${orbitron.variable} bg-background`}>
      <head>
        <meta name="theme-color" content="#0a0a0c" />
      </head>
      <body>
        <ParticleBackground />
        <NavigationMenu />
        {children}
      </body>
    </html>
  );
}
