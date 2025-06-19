import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios';

const ExtensionSetting = () => {
    const API_URL = import.meta.env.VITE_PUBLIC_API_URL ;
    const domains_id = useSelector((state: any) => state.user.domains_id);
    const domain_name = useSelector((state: any) => state.user.domain_name);

    const fetchExtension = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/extensions/domain/${domains_id}`);
            const data = response.data;
            console.log("data Extension", data);
            return data;
        } catch (error) {
            console.error("Error fetching domains:", error);
            return [];
        }
    };
    useEffect(() => {
        fetchExtension();
    }, []);

  return (
    <div>

    </div>
  )
}

export default ExtensionSetting