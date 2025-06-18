import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.126:8000';
console.log('Using API baseURL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export default api; 