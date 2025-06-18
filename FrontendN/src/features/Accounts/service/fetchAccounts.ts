import axios from 'axios';
import { toast } from 'sonner';
const API_URL = 'http://192.168.1.126:8000';


export const fetchAccounts = async () => {
    try {
      console.log("API_URL", API_URL)
        const response = await axios.get(`${API_URL}/api/users/`);
        console.log("response", response)
        console.log("fetchAccountsdata", response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
}

export 
  const fetchRoles = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/roles/`)
      console.log("fetchRolesdata", data)
      return data
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error fetching roles')
      return [];
    }
  }