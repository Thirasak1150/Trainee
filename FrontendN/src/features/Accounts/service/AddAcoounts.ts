import axios from 'axios';

import { toast } from 'sonner';
import type { FormData } from '../types/Formdata';
const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://192.168.1.126:8000';

export const addAcount = async (addFormData: FormData, setOpenDialog: (open: boolean) => void, fetchData: () => void,setAddFormData: (formData: FormData) => void) => {
    try {
        console.log("addFormData", addFormData)
        const { data } = await axios.post(
          `${API_URL}/api/users`,
          addFormData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
  
        if (data) {
          setOpenDialog(false)
          toast.success('Account created successfully')
          fetchData() // Refresh the list
          // Reset form
          setAddFormData({
            username: '',
            email: '',
            password: '',
            user_enabled: true,
            roles_id: ''
          })
        }
      } catch (error) {
        console.error('Error creating account:', error)
        toast.error('Error creating account')
      }
}