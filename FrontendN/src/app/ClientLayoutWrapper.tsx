import { useLocation } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';
import { SiteHeader } from './components/site-header';
import React, { useEffect, useState } from 'react';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const location = useLocation();
  const isLogin = location.pathname === '/';
  
  console.log('ClientLayoutWrapper - pathname:', location.pathname, 'isLogin:', isLogin);

  const [isLoading, setIsLoading] = useState(true);
  const [prevPath, setPrevPath] = useState('');

  useEffect(() => {
    console.log('ClientLayoutWrapper - useEffect - current path:', location.pathname, 'previous path:', prevPath);
    
    if (location.pathname !== prevPath) {
      console.log('Path changed from', prevPath, 'to', location.pathname);
      setPrevPath(location.pathname);
    }
    setIsLoading(false);
    // const timer = setTimeout(() => {
    //   console.log('Setting loading to false after timeout');
 
    // }, 3000); // Add a small delay to ensure we can see the loading state
    
    // return () => {
    //   console.log('Cleaning up ClientLayoutWrapper');
    //   clearTimeout(timer);
    // };
  }, [location.pathname, prevPath]);

  if (isLoading) {
    return <div className='  h-screen w-screen flex items-center justify-center'>
      <div className=''>
        <video src="/Animation/logovedio.mp4" autoPlay loop muted playsInline className="w-[500px] h-[500px] object-cover"></video>
      </div>
    </div>;
  }

  return (
    <Theme appearance="light" accentColor="indigo" grayColor="gray" panelBackground="solid" radius="medium">
      {isLogin ? (
        children
      ) : (
        <SidebarProvider
          style={{
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties}
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <main className="p-4">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      )}
    </Theme>
  );
}
