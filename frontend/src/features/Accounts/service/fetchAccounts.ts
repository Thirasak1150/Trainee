import axios from 'axios';
import { toast } from 'sonner';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export const fetchAccounts = async () => {
    try {
        const { data } = await axios.get(`${API_URL}/api/users`);
        return data;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
}

export 
  const fetchRoles = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/roles')
      return data
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error fetching roles')
    }
  }