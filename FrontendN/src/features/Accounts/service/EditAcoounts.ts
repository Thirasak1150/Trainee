import axios from 'axios';
import type { Account, FormData } from '../../Accounts/types/Formdata';
import { toast } from 'sonner';
const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://192.168.1.126:8000';


export const editAccount = async (editingAccount: Account, formData: FormData, setOpenEditDialog: (open: boolean) => void, fetchData: () => void) => {
      if (!editingAccount) return
        console.log("editingAccount", editingAccount)
        console.log("formData", formData)
        try {
          const updateData = {
            ...formData,
            roles_id: formData.roles_id !== editingAccount.roles_id ? formData.roles_id : undefined,
            user_enabled: formData.user_enabled
          }
          console.log("updateData", updateData)
          const { data } = await axios.put(
            `${API_URL}/api/users/${editingAccount.users_id}`,
            updateData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
    
          if (data) {
            setOpenEditDialog(false)
            toast.success('Account updated successfully')
            fetchData() // Refresh the list
          }
        } catch (error) {
          toast.error('Error updating account')
          console.error('Error updating account:', error)
        }
}