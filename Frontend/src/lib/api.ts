import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
});

// A custom hook to use the authenticated API client
export const useApi = () => {
  const { getToken } = useAuth();
  
  const authedClient = axios.create({
    baseURL: NEXT_PUBLIC_API_URL,
  });

  authedClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return authedClient;
};
