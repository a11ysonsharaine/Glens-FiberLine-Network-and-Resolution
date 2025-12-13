import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
