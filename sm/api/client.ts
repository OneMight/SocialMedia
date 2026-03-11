// services/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api'
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:3001/api'
    } else {
      return 'http://localhost:3001/api'
    }
  }
  return 'https://your-production-url.com/api'
}

const BASE_URL = getBaseUrl()

// Безопасная обертка для AsyncStorage
const secureAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key)
    } catch (error) {
      console.error('AsyncStorage getItem error:', error)
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      console.error('AsyncStorage setItem error:', error)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error)
    }
  }
}

async function getToken() {
  return secureAsyncStorage.getItem('token')
}

async function setToken(token: string) {
  return secureAsyncStorage.setItem('token', token)
}

async function removeToken() {
  return secureAsyncStorage.removeItem('token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken()
  const url = `${BASE_URL}${path}`
  
  console.log('🌐 Fetching:', url)
  console.log('📦 Method:', options.method || 'GET')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)
    
    const text = await res.text()
    const data = text ? JSON.parse(text) : {}

    if (!res.ok) {
      throw data
    }

    return data as T
  } catch (error: any) {
    console.error('❌ API Request failed:', {
      url,
      method: options.method || 'GET',
      error: error.message
    })
    
    if (error.name === 'AbortError') {
      throw { field: 'general', message: 'Request timeout - server not responding' }
    }
    
    throw error
  }
}

export const api = {
  auth: {
    register: (body: any) => request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    login: (body: { usernameOrEmail: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    me: () => request<any>('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  users: {
    getAll: () => request<any[]>('/users'),
    getMe: () => request<any>('/users/me'),
    getById: (id: string) => request<any>(`/users/${id}`),
    getOrbiting: () => request<string[]>('/users/me/orbiting'),
  },
  posts: {
    getAll: () => request<any[]>('/posts'),
    create: (data: any) => request<any>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    togglePulse: (postId: string) =>
      request<{ pulsed: boolean }>(`/posts/${postId}/pulse`, {
        method: 'POST',
      }),
    getPulsed: () => request<string[]>('/posts/me/pulsed'),
  },
  orbit: {
    toggle: (userId: string) =>
      request<{ orbiting: boolean }>(`/orbit/${userId}`, {
        method: 'POST',
      }),
  },
}

export { setToken, removeToken }