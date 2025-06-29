import type { ProfileData, ResponseUpdateProfileData, updateProfileData } from '../types/Profile.type';
import axios from 'axios';
import { toast } from 'sonner';
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const updateUserProfile = async (user_uuid: string, formData: ProfileData, setInitialData: (data: ProfileData) => void, setFormData: (data: ProfileData) => void) => {
    if (formData.password && formData.password !== formData.confirm_password) {
        toast.error('Passwords do not match')
        return
      }
  
      try {
         // Create an object with only the fields we want to update
         const updatePayload: updateProfileData = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
        };
  
        if (formData.password) {
          updatePayload.password = formData.password;
        }
  
        const response = await axios.put(
          `${API_URL}/api/users/${user_uuid}`,
          updatePayload
        )
        const data: ResponseUpdateProfileData = response.data
        console.log("data", data)
        if (data) {
          toast.success('Profile updated successfully')
          const newInitialData: ResponseUpdateProfileData = {
            username: data.username,
            email: data.email,
            full_name: data.full_name,
          }
          setInitialData(newInitialData)
          setFormData({
            username: data.username,
            email: data.email,
            full_name: data.full_name,
            password: '',
            confirm_password: ''
          })
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('Error updating profile')
      }
}