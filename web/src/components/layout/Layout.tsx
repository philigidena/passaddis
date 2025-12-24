import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

export function Layout({ children, hideNavbar = false, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className={!hideNavbar ? 'pt-16' : ''}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
