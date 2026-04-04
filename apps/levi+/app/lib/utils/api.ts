import axios from 'axios';

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 30000,
});

// Add token to every request.
// levi+ stores the JWT under 'admin_token' (set after admin OTP login).
// Falls back to 'token' / 'accessToken' for compatibility.
apiInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401, clear admin_token so stale tokens don't loop
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      console.warn('[api] 401 received — token may be invalid or expired');
    }
    return Promise.reject(error);
  },
);

export default apiInstance;
