import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@radix-ui/themes/styles.css';
import './index.css';
import App from './App';
import ClientLayoutWrapper from './app/ClientLayoutWrapper';

import { ActiveThemeProvider } from '@/components/ui/active-theme';
import { ThemeProvider } from './app/components/mode-toggle';
import AccountsPage from './app/home/accounts/accounts';
import AccountSetting from './app/home/account-setting/account-setting';
import ExtensionsPage from './app/home/extensions/extensions';
import { Toaster } from 'sonner';
import DomainsPage from './app/advance/domains/domains';
import AccessControlsPage from './app/advance/access-controls/access-controls';
import MenuManagerPage from './app/advance/menu-manager/menu-manager';
import ContactsPage from './app/application/contacts/contacts';
// import Dashborad from './app/Dashborad/Dashborad';

const router = createBrowserRouter([
  {
    path: "/testpage",
    element: (
      <ClientLayoutWrapper>
        <App />
      </ClientLayoutWrapper>
    ),
  },
  //home
  {
    path: "/home/accounts",
    element: (
      <ClientLayoutWrapper>
        <AccountsPage />
      </ClientLayoutWrapper>
    ),
  },
  {
    path: "/home/account-setting",
    element: (
      <ClientLayoutWrapper>
        <AccountSetting />
      </ClientLayoutWrapper>
    ),
  },
  {
    path: "/home/extensions",
    element: (
      <ClientLayoutWrapper>
        <ExtensionsPage />
      </ClientLayoutWrapper>
    ),
  },
  //advacne
  {
    path: "/advance/domains",
    element: (
      <ClientLayoutWrapper>
        <DomainsPage />
      </ClientLayoutWrapper>
    ),
  },
  {
    path: "/advance/access-controls",
    element: (
      <ClientLayoutWrapper>
        <AccessControlsPage />
      </ClientLayoutWrapper>
    ),
  },
  {
    path: "/advance/menu-manager",
    element: (
      <ClientLayoutWrapper>
        <MenuManagerPage />
      </ClientLayoutWrapper>
    ),
  },
  //application
  {
    path: "/application/contacts",
    element: (
      <ClientLayoutWrapper>
        <ContactsPage />
      </ClientLayoutWrapper>
    ),
  },
  // Add more routes here as needed
]);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
    <ThemeProvider>
      <ActiveThemeProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-center"
          autoClose={1000}
          limit={3}
          hideProgressBar
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Zoom}
        />
        {/* เพิ่ม Toaster ของ sonner ให้ toast แสดงผลได้ */}
        <Toaster richColors position="bottom-right" />
      </ActiveThemeProvider>
    </ThemeProvider>
 
);
