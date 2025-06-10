"use client";
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of the user object (customize as needed)
export type User = {
  user_uuid?: string;
  username?: string;
  userRole?: string;
  [key: string]: any;
};

// Define the context type
interface UserContextType {
  user_uuid: string | null;
  setUser_uuid: Dispatch<SetStateAction<string | null>>;
  logout: () => void;
}

// Create the context with default undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user_uuid, setUser_uuid] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [Useremail,setUseremail] = useState<string | null>(null);
  const router = useRouter();
  console.log("user_uuid", user_uuid);
  
  const logout = () => {
    setUser_uuid(null);
    // delete cookie
    document.cookie = 'user_uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  }

  return (
    <UserContext.Provider value={{ user_uuid, setUser_uuid, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy access
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};