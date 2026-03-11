import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001/api';
  if (Platform.OS === 'web') return 'http://localhost:3001/api';
  return 'http://192.168.1.3:3001/api'; 
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Функции для токена (экспортируем отдельно)
export const setToken = async (token: string) => {
  const cleanToken = token.replace(/"/g, '');
  Platform.OS === 'web' 
    ? localStorage.setItem('userToken', cleanToken) 
    : await AsyncStorage.setItem('userToken', cleanToken);
};

export const removeToken = async () => {
  Platform.OS === 'web' 
    ? localStorage.removeItem('userToken') 
    : await AsyncStorage.removeItem('userToken');
};

// Интерцептор для автоматической подстановки токена
apiClient.interceptors.request.use(async (config) => {
  const token = Platform.OS === 'web' 
    ? localStorage.getItem('userToken') 
    : await AsyncStorage.getItem('userToken').catch(() => null);

  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
  }
  return config;
});

// ГЛАВНОЕ: Объект api с методами, которые вызывают хуки
const api = {
  auth: {
    me: () => apiClient.get('/auth/me').then(res => res.data),
    login: (data: any) => apiClient.post('/auth/login', data).then(res => res.data),
    register: (data: any) => apiClient.post('/auth/register', data).then(res => res.data),
    logout: () => apiClient.post('/auth/logout').then(res => res.data),
  },
  users: {
    getAll: () => apiClient.get('/users').then(res => res.data),
    getOrbiting: () => apiClient.get('/users/me/orbiting').then(res => res.data),
  },
  posts: {
    getAll: () => apiClient.get('/posts').then(res => res.data),
    getPulsed: () => apiClient.get('/posts/me/pulsed').then(res => res.data),
    togglePulse: (id: string) => apiClient.post(`/posts/${id}/pulse`).then(res => res.data),
    create: (data: any) => apiClient.post('/posts', data).then(res => res.data),
  },
  orbit: {
    toggle: (id: string) => apiClient.post(`/orbit/toggle/${id}`).then(res => res.data),
  },
  upload: {
    image: (formData: FormData) => apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
  }
};

export default api;