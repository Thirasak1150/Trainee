import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const fetchUserProfile = async (user_uuid: string) => {
    try {
        const { data: profileData } = await axios.get(`${API_URL}/api/users/${user_uuid}`)
        return profileData
    } catch (error) {
        console.error('Error fetching profile:', error)
        throw error
    }
}
