import axios, { AxiosError } from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const handleLogin = async (
  username: string,
  password: string,
  setError: (error: string) => void,
  router: AppRouterInstance
) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/login`, 
            { username, password }
          );

          const data = response.data;
          console.log("data", data);
          if (data == 'User not found') {   
            console.log("No data returned");
            setError('Login failed: No access token returned.');
            return;
          }
          else {
            
        const userRole = data.permissions || undefined;
        // Expires in 1 day, adjust as needed
        const expires = new Date(Date.now() + 86400e3).toUTCString();
        const path = "/";
        const sameSite = "SameSite=Lax";

        document.cookie = `userRole=${userRole}; path=${path}; expires=${expires}; ${sameSite}`;
        document.cookie = `user_uuid=${data.user_id}; path=${path}; expires=${expires}; ${sameSite}`;
        document.cookie = `full_name=${encodeURIComponent(data.full_name)}; path=${path}; expires=${expires}; ${sameSite}`;
        document.cookie = `email=${data.email}; path=${path}; expires=${expires}; ${sameSite}`;

        // Redirect to the dashboard, the context will update on the new page
        router.push('/dashboard'); 
          }
    } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        setError('An unexpected error occurred. Please try again.');
        if (axiosError.response && axiosError.response.data && axiosError.response.data.detail) {
            setError(axiosError.response.data.detail);
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    }
};