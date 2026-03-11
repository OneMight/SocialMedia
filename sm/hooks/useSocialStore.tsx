// hooks/useSocialStore.tsx
import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react'
import { User, Post } from '../app/types/social'
import api, { setToken, removeToken } from '../api/client' // Импортируем функции

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
  editProfile: (data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUrl'>>) => Promise<void>
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
      // Сначала загружаем публичные данные
      await Promise.all([
        loadUsers().catch(() => {}),
        loadPosts().catch(() => {})
      ])
      
      // Пытаемся загрузить данные пользователя если есть токен
      try {
        const user = await api.auth.me()
        setCurrentUser(user)
        await Promise.all([
          loadOrbiting().catch(() => {}),
          loadPulsedPosts().catch(() => {})
        ])
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
    try {
      const data = await api.users.getAll()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      throw error
    }
  }

  const loadPosts = async () => {
    try {
      const data = await api.posts.getAll()
      setPosts(data)
    } catch (error) {
      console.error('Failed to load posts:', error)
      throw error
    }
  }

  const loadOrbiting = async () => {
    try {
      const data = await api.users.getOrbiting()
      setOrbiting(new Set(data))
    } catch (error) {
      console.error('Failed to load orbiting:', error)
      throw error
    }
  }

  const loadPulsedPosts = async () => {
    try {
      const data = await api.posts.getPulsed()
      setPulsedPosts(new Set(data))
    } catch (error) {
      console.error('Failed to load pulsed posts:', error)
      throw error
    }
  }

  const clearAuthError = () => setAuthError(null)

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setAuthError(null)

    if (!usernameOrEmail.trim()) {
      setAuthError({ field: 'username', message: 'Enter your username or email' })
      return false
    }
    if (!password || password.length < 6) {
      setAuthError({ field: 'password', message: 'Password must be at least 6 characters' })
      return false
    }

    try {
      console.log('Attempting login for:', usernameOrEmail)
      const response = await api.auth.login({ usernameOrEmail, password })
      console.log('Login response:', response)
      
      await setToken(response.token)
      setCurrentUser(response.user)
      
      await Promise.all([
        loadUsers(),
        loadPosts(),
        loadOrbiting(),
        loadPulsedPosts(),
      ])
      
      return true
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.field) {
        setAuthError({ field: error.field, message: error.message })
      } else {
        setAuthError({ field: 'general', message: error.message || 'Login failed' })
      }
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

  const register = async (data: {
    username: string
    email: string
    fullName: string
    password: string
    avatarUrl: string
    bio: string
  }): Promise<boolean> => {
    setAuthError(null)

    try {
      console.log('Attempting registration for:', data.username)
      const response = await api.auth.register(data)
      console.log('Registration response:', response)
      
      await setToken(response.token)
      setCurrentUser(response.user)
      await loadUsers()
      return true
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.field) {
        setAuthError({ field: error.field, message: error.message })
      } else {
        setAuthError({ field: 'general', message: error.message || 'Registration failed' })
      }
      return false
    }
  }

  const toggleOrbit = async (userId: string) => {
    try {
      const response = await api.orbit.toggle(userId)
      
      setOrbiting(prev => {
        const next = new Set(prev)
        if (response.orbiting) {
          next.add(userId)
        } else {
          next.delete(userId)
        }
        return next
      })
      
      setUsers(prev =>
        prev.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              followersCount: response.orbiting 
                ? user.followersCount + 1 
                : user.followersCount - 1,
            }
          }
          if (currentUser && user.id === currentUser.id) {
            return {
              ...user,
              followingCount: response.orbiting 
                ? user.followingCount + 1 
                : user.followingCount - 1,
            }
          }
          return user
        })
      )
    } catch (error) {
      console.error('Failed to toggle orbit:', error)
    }
  }

  const togglePulse = async (postId: string) => {
    try {
      const response = await api.posts.togglePulse(postId)
      
      setPulsedPosts(prev => {
        const next = new Set(prev)
        if (response.pulsed) {
          next.add(postId)
        } else {
          next.delete(postId)
        }
        return next
      })
      
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                pulsesCount: response.pulsed 
                  ? post.pulsesCount + 1 
                  : post.pulsesCount - 1,
              }
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
      console.log('Creating post:', { type, caption, imageUrl })
      const newPost = await api.posts.create({ type, caption, imageUrl })
      console.log('Post created:', newPost)
      
      setPosts(prev => [newPost, ...prev])
      
      setUsers(prev =>
        prev.map(u =>
          u.id === currentUser.id ? { ...u, postsCount: u.postsCount + 1 } : u
        )
      )
    } catch (error) {
      console.error('Failed to create post:', error)
      throw error
    }
  }

  const editProfile = async (data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUrl'>>) => {
    if (!currentUser) return
    // TODO: Add API endpoint for profile update
    const updated = { ...currentUser, ...data }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)))
  }

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        users,
        posts,
        orbiting,
        pulsedPosts,
        authError,
        isLoading,
        login,
        logout,
        register,
        clearAuthError,
        toggleOrbit,
        togglePulse,
        createPost,
        editProfile,
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