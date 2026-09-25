import type { Metadata } from 'next';
import '@liqui-design/glass/styles.css';
import './globals.css';
import './liquid-glass.css';
export const metadata: Metadata = { title: 'AI Token Visualizer', description: 'Explore how AI models break text into tokens. Private, local tokenization.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
