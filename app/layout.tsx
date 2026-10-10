import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Bounce Tennis — Play it different.',
  description: 'Mais que uma loja de tênis. Um ponto de encontro para quem vive o esporte. Explore a seleção Bounce.',
  icons: { icon: '/favicon.svg' },
};
export const viewport: Viewport = { themeColor: '#F4F1E8' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
