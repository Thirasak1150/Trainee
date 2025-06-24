import axios from 'axios';
import { Account } from '../types/Formdata';
import { toast } from 'sonner';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.126:8000';

export const deleteAccount = async (deletingAccount: Account, fetchData: () => void,setDeletingAccount: (deletingAccount: Account | null) => void) => {
    if (!deletingAccount) return

    try {
      const { data } = await axios.delete(`${API_URL}/api/users/${deletingAccount.users_id}`)
      
      if (data) {
        toast.success('Account deleted successfully')
        fetchData() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Error deleting account')
    } finally {
      setDeletingAccount(null)
    }
}
