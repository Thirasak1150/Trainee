import axios, { AxiosError } from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const handleLogin = async (username: string, password: string,setError: (error: string) => void, router: any) => {

    console.log(username,password);
    try {
        const response = await axios.post(`${API_URL}/api/users/login`, 
            { username, password },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
        
          const data = response.data;
      console.log(data);
      // data.permissions is now an array of strings like ["admin"]
      if (data.permissions && data.permissions.length > 0) {
        // Use the first permission as the user role
        const userRole = data.permissions[0].toLowerCase();
        // Set cookie for middleware to pick up
        // Expires in 1 day, adjust as needed
        const expires = new Date(Date.now() + 86400e3).toUTCString();
        document.cookie = `userRole=${userRole}; path=/; expires=${expires}; SameSite=Lax`;
        
        // The middleware will handle redirection from '/' if userRole cookie is set.
        // So, we can just push to '/' and let middleware do its job.
        router.push('/'); 
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ detail?: string }>;
            setError(axiosError.response?.data?.detail || axiosError.message || 'Login failed due to a server error.');
        } else if (error instanceof Error) {
            setError(error.message || 'An unexpected error occurred.');
        } else {
            setError('Please check your username and password.');
        }
    }
};