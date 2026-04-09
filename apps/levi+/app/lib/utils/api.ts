import axios from 'axios';

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com',
  timeout: 30000,
});

export default apiInstance;