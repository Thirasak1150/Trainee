"use client";
import { useRouter } from "next/navigation";
import React, { ReactNode, createContext, useState, useContext } from "react";
import { MenuHeader } from "./components/app-sidebar";

// Define the shape of the user object (customize as needed)
export type User = {
  user_uuid?: string;
  username?: string;
  userRole?: string;
  [key: string]: unknown;
};

// Define the shape of the context data
interface UserContextType {
  user_uuid: string | null;
  userRole: string | null;
  Useremail: string | null;
  Fullname: string | null;
  logout: () => void;
  menu: MenuHeader[];
  setMenu: React.Dispatch<React.SetStateAction<MenuHeader[]>>;
}

// Create the context with default undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper function to get a cookie by name
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // Guard for SSR
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user_uuid, setUser_uuid] = useState<string | null>(() => getCookie("user_uuid"));
  const [userRole, setUserRole] = useState<string | null>(() => getCookie("userRole"));
  const [Useremail, setUseremail] = useState<string | null>(() => getCookie("email"));
  const [Fullname, setFullname] = useState<string | null>(() => getCookie("full_name"));
  const [menu, setMenu] = useState<MenuHeader[]>([]);
  const router = useRouter();

  const logout = async () => {
    router.push('/');
    setUser_uuid(null);
    setUserRole(null);
    setUseremail(null);
    setFullname(null);
    // delete cookies
    document.cookie = 'user_uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'full_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setMenu([]);

  };

  const value = { user_uuid, userRole, Useremail, Fullname, logout, menu, setMenu };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};