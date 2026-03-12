// hooks/useSocialStore.tsx
import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react'
import { User, Post } from '../app/types/social'
import api, { setToken, removeToken } from '../api/client'
// axios не нужен здесь напрямую, так как мы используем api из клиента

interface AuthError {
  field: 'username' | 'email' | 'password' | 'general'
  message: string
}

interface SocialState {
  currentUser: User | null
  users: User[]
  posts: Post[]
  orbiting: Set<string>
  pulsedPosts: Set<string>
  authError: AuthError | null
  isLoading: boolean

  login: (usernameOrEmail: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (data: {
    username: string
    email: string
    fullName: string
    password: string
    avatarUrl: string
    bio: string
  }) => Promise<boolean>
  clearAuthError: () => void
  toggleOrbit: (userId: string) => Promise<void>
  togglePulse: (postId: string) => Promise<void>
  createPost: (type: 'photo' | 'thought', caption: string, imageUrl?: string) => Promise<void>
  editProfile: (data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUrl'>> & Pick<User,'id'>) => Promise<void>
}

const SocialContext = createContext<SocialState | undefined>(undefined)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [orbiting, setOrbiting] = useState<Set<string>>(new Set())
  const [pulsedPosts, setPulsedPosts] = useState<Set<string>>(new Set())
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadUsers().catch(() => {}),
        loadPosts().catch(() => {})
      ])
      
      try {
        const user = await api.auth.me()
        setCurrentUser(user)
        // Загружаем персональные данные только если юзер авторизован
        const [orbitingData, pulsedData] = await Promise.all([
          api.users.getOrbiting(),
          api.posts.getPulsed()
        ])
        setOrbiting(new Set(orbitingData))
        setPulsedPosts(new Set(pulsedData))
      } catch (error) {
        console.log('No valid session')
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    const data = await api.users.getAll()
    setUsers(data)
  }

  const loadPosts = async () => {
    const data = await api.posts.getAll()
    setPosts(data)
  }

  const clearAuthError = () => setAuthError(null)

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setAuthError(null)
    try {
      const response = await api.auth.login({ usernameOrEmail, password })
      await setToken(response.token)
      setCurrentUser(response.user)
      
      // Перезагружаем всё после логина
      await loadInitialData()
      return true
    } catch (error: any) {
      setAuthError({ 
        field: error.response?.data?.field || 'general', 
        message: error.response?.data?.message || 'Login failed' 
      })
      return false
    }
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      await removeToken()
      setCurrentUser(null)
      setOrbiting(new Set())
      setPulsedPosts(new Set())
    }
  }

  const register = async (data: any): Promise<boolean> => {
    setAuthError(null)
    try {
      const response = await api.auth.register(data)
      await setToken(response.token)
      setCurrentUser(response.user)
      await loadUsers()
      return true
    } catch (error: any) {
      setAuthError({ 
        field: error.response?.data?.field || 'general', 
        message: error.response?.data?.message || 'Registration failed' 
      })
      return false
    }
  }

  const toggleOrbit = async (userId: string) => {
    try {
      const response = await api.orbit.toggle(userId)
      const isNowOrbiting = response.orbiting

      setOrbiting(prev => {
        const next = new Set(prev)
        isNowOrbiting ? next.add(userId) : next.delete(userId)
        return next
      })
      
      setUsers(prev =>
        prev.map(user => {
          // Обновляем счетчик того, на кого подписались
          if (user.id === userId) {
            return {
              ...user,
              followersCount: isNowOrbiting ? user.followersCount + 1 : user.followersCount - 1,
            }
          }
          // Обновляем свой счетчик в общем списке пользователей
          if (currentUser && user.id === currentUser.id) {
            return {
              ...user,
              followingCount: isNowOrbiting ? user.followingCount + 1 : user.followingCount - 1,
            }
          }
          return user
        })
      )
      
      // Обновляем самого currentUser, чтобы ProfilePage видел изменения
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          followingCount: isNowOrbiting ? currentUser.followingCount + 1 : currentUser.followingCount - 1
        })
      }
    } catch (error) {
      console.error('Failed to toggle orbit:', error)
    }
  }

  const togglePulse = async (postId: string) => {
    try {
      const response = await api.posts.togglePulse(postId)
      const isPulsed = response.pulsed
      
      setPulsedPosts(prev => {
        const next = new Set(prev)
        isPulsed ? next.add(postId) : next.delete(postId)
        return next
      })
      
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, pulsesCount: isPulsed ? post.pulsesCount + 1 : post.pulsesCount - 1 }
            : post
        )
      )
    } catch (error) {
      console.error('Failed to toggle pulse:', error)
    }
  }

  const createPost = async (type: 'photo' | 'thought', caption: string, imageUrl?: string) => {
    if (!currentUser) return
    try {
      const newPost = await api.posts.create({ type, caption, imageUrl })
      setPosts(prev => [newPost, ...prev])
      setUsers(prev =>
        prev.map(u => u.id === currentUser.id ? { ...u, postsCount: u.postsCount + 1 } : u)
      )
      setCurrentUser({ ...currentUser, postsCount: currentUser.postsCount + 1 })
    } catch (error) {
      console.error('Failed to create post:', error)
      throw error
    }
  }

  // ─── ИСПРАВЛЕННЫЙ EDIT PROFILE ───
  const editProfile = async (data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUrl'>> & Pick<User, 'id'>) => {
    if (!currentUser) return
    try {
      // Отправляем на сервер и получаем данные через response.data
      const response = await api.users.updateProfile(data);
      const updatedUser = response.data; 

      // Обновляем локальные стейты данными от сервера
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    } catch (error: any) {
      console.error('Edit profile failed:', error.response?.data || error.message);
      throw error; // Пробрасываем ошибку для UI
    }
  }

  return (
    <SocialContext.Provider
      value={{
        currentUser, users, posts, orbiting, pulsedPosts, authError, isLoading,
        login, logout, register, clearAuthError, toggleOrbit, togglePulse, createPost, editProfile,
      }}
    >
      {children}
    </SocialContext.Provider>
  )
}

export function useSocialStore() {
  const context = useContext(SocialContext)
  if (!context) throw new Error('useSocialStore must be used within a SocialProvider')
  return context
} 