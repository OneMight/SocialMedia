import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User, Post } from '../app/types/social'

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

  login: (usernameOrEmail: string, password: string) => boolean
  logout: () => void
  register: (data: {
    username: string
    email: string
    fullName: string
    password: string
    avatarUrl: string
    bio: string
  }) => boolean
  clearAuthError: () => void
  toggleOrbit: (userId: string) => void
  togglePulse: (postId: string) => void
  createPost: (type: 'photo' | 'thought', caption: string, imageUrl?: string) => void
  editProfile: (data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUrl'>>) => void

}

// Хранилище паролей отдельно от User (пароль не должен быть в типе User)
interface StoredCredentials {
  userId: string
  password: string
}

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  {
    id: '1', username: 'nova.creates', email: 'nova@example.com',
    fullName: 'Nova', avatarUrl: 'https://picsum.photos/150?random=10',
    bio: 'Chasing light and shadows. ✧ Visual artist',
    followersCount: 1240, followingCount: 342, postsCount: 5, status: 'online',
  },
  {
    id: '2', username: 'midnight_coder', email: 'elias@example.com',
    fullName: 'Elias', avatarUrl: 'https://picsum.photos/150?random=11',
    bio: 'Turning coffee into architecture.',
    followersCount: 8900, followingCount: 450, postsCount: 12, status: 'away',
  },
  {
    id: '3', username: 'wanderlust.kai', email: 'kai@example.com', 
    fullName: 'Kai', avatarUrl: 'https://picsum.photos/150?random=12',
    bio: 'Earth is art. Documenting the journey.',
    followersCount: 4500, followingCount: 800, postsCount: 8, status: 'offline',
  },
  {
    id: '4', username: 'pixel.witch', email: 'luna@example.com',
    fullName: 'Luna', avatarUrl: 'https://picsum.photos/150?random=13',
    bio: 'Digital sorcery & design systems. ✨',
    followersCount: 12000, followingCount: 200, postsCount: 15, status: 'online',
  },
  {
    id: '5', username: 'zen.garden', email: 'kenji@example.com',
    fullName: 'Kenji', avatarUrl: 'https://picsum.photos/150?random=14',
    bio: 'Minimalism. Breath. Focus.',
    followersCount: 5600, followingCount: 150, postsCount: 10, status: 'offline',
  },
  {
    id: '6', username: 'cosmic.drift', email: 'aria@example.com',
    fullName: 'Aria', avatarUrl: 'https://picsum.photos/150?random=15',
    bio: 'Soundscapes and visual poetry. 🎵',
    followersCount: 3200, followingCount: 400, postsCount: 6, status: 'online',
  },
]

// Мок-пароли для тестовых юзеров (все одинаковые для удобства)
const MOCK_CREDENTIALS: StoredCredentials[] = MOCK_USERS.map((u) => ({
  userId: u.id,
  password: 'password123',
}))

const MOCK_POSTS: Post[] = [
  {
    id: '101', userId: '2', type: 'thought',
    caption: 'There is a profound silence that settles over the city at 3 AM.',
    pulsesCount: 342, comments: [], createdAt: '2h ago',
  },
  {
    id: '102', userId: '1', type: 'photo',
    imageUrl: 'https://picsum.photos/600?random=101',
    caption: 'Caught the exact moment the sun dipped below the horizon. 🌅',
    pulsesCount: 1205, comments: [], createdAt: '5h ago',
  },
  {
    id: '103', userId: '4', type: 'thought',
    caption: 'Design isnt just about making things look good.',
    pulsesCount: 890, comments: [], createdAt: '1d ago',
  },
  {
    id: '104', userId: '3', type: 'photo',
    imageUrl: 'https://picsum.photos/600?random=102',
    caption: 'Lost in the concrete jungle.',
    pulsesCount: 215, comments: [], createdAt: '1d ago',
  },
  {
    id: '105', userId: '5', type: 'thought',
    caption: 'Declutter your physical space to declutter your mind.',
    pulsesCount: 450, comments: [], createdAt: '2d ago',
  },
  {
    id: '106', userId: '6', type: 'photo',
    imageUrl: 'https://picsum.photos/600?random=103',
    caption: 'New synth setup is finally complete. 🎛️✨',
    pulsesCount: 670, comments: [], createdAt: '3d ago',
  },
]

// --- CONTEXT ---
const SocialContext = createContext<SocialState | undefined>(undefined)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [orbiting, setOrbiting] = useState<Set<string>>(new Set(['2', '3', '4']))
  const [pulsedPosts, setPulsedPosts] = useState<Set<string>>(new Set(['101', '103']))
  const [credentials, setCredentials] = useState<StoredCredentials[]>(MOCK_CREDENTIALS)
  const [authError, setAuthError] = useState<AuthError | null>(null)

  // Восстанавливаем сессию при запуске
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedId = await AsyncStorage.getItem('currentUserId')
        if (savedId) {
          const user = users.find((u) => u.id === savedId)
          if (user) setCurrentUser(user)
        }
      } catch (e) {
        console.log('Session restore failed', e)
      }
    }
    restoreSession()
  }, [])

  const clearAuthError = () => setAuthError(null)

  // --- LOGIN ---
  const login = (usernameOrEmail: string, password: string): boolean => {
    setAuthError(null)

    if (!usernameOrEmail.trim()) {
      setAuthError({ field: 'username', message: 'Enter your username or email' })
      return false
    }
    if (!password || password.length < 6) {
      setAuthError({ field: 'password', message: 'Password must be at least 6 characters' })
      return false
    }

    const user = users.find(
      (u) => u.username === usernameOrEmail.trim() || u.email === usernameOrEmail.trim()
    )

    if (!user) {
      setAuthError({ field: 'username', message: 'No account found with that username or email' })
      return false
    }

    const cred = credentials.find((c) => c.userId === user.id)
    if (!cred || cred.password !== password) {
      setAuthError({ field: 'password', message: 'Incorrect password' })
      return false
    }

    setCurrentUser(user)
    AsyncStorage.setItem('currentUserId', user.id)
    return true
  }

  // --- LOGOUT ---
  const logout = () => {
    setCurrentUser(null)
    AsyncStorage.removeItem('currentUserId')
  }

  // --- REGISTER ---
  const register = (data: {
    username: string
    email: string
    fullName: string
    password: string
    avatarUrl: string
    bio: string
  }): boolean => {
    setAuthError(null)

    // Валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      setAuthError({ field: 'email', message: 'Enter a valid email address' })
      return false
    }
    if (data.username.length < 3) {
      setAuthError({ field: 'username', message: 'Username must be at least 3 characters' })
      return false
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(data.username)) {
      setAuthError({ field: 'username', message: 'Username can only contain letters, numbers, _ and .' })
      return false
    }
    if (data.password.length < 6) {
      setAuthError({ field: 'password', message: 'Password must be at least 6 characters' })
      return false
    }

    // Проверка на уникальность
    const usernameTaken = users.some((u) => u.username === data.username)
    if (usernameTaken) {
      setAuthError({ field: 'username', message: 'This username is already taken' })
      return false
    }
    const emailTaken = users.some((u) => u.email === data.email)
    if (emailTaken) {
      setAuthError({ field: 'email', message: 'An account with this email already exists' })
      return false
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      status: 'online',
    }

    setUsers((prev) => [...prev, newUser])
    setCredentials((prev) => [...prev, { userId: newUser.id, password: data.password }])
    setCurrentUser(newUser)
    AsyncStorage.setItem('currentUserId', newUser.id)
    return true
  }

  // --- TOGGLE ORBIT ---
  const toggleOrbit = (userId: string) => {
    setOrbiting((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            followersCount: orbiting.has(userId)
              ? user.followersCount - 1
              : user.followersCount + 1,
          }
        }
        if (currentUser && user.id === currentUser.id) {
          return {
            ...user,
            followingCount: orbiting.has(userId)
              ? user.followingCount - 1
              : user.followingCount + 1,
          }
        }
        return user
      })
    )
  }

  // --- TOGGLE PULSE ---
  const togglePulse = (postId: string) => {
    setPulsedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              pulsesCount: pulsedPosts.has(postId)
                ? post.pulsesCount - 1
                : post.pulsesCount + 1,
            }
          : post
      )
    )
  }

  // --- CREATE POST ---
  const createPost = (type: 'photo' | 'thought', caption: string, imageUrl?: string) => {
    if (!currentUser) return
    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      userId: currentUser.id,
      type,
      imageUrl,
      caption,
      pulsesCount: 0,
      comments: [],
      createdAt: 'Just now',
    }
    setPosts((prev) => [newPost, ...prev])
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, postsCount: u.postsCount + 1 } : u
      )
    )
  }
  const editProfile = (data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUrl'>>) => {
    if (!currentUser) return
    const updated = { ...currentUser, ...data }
    setCurrentUser(updated)
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)))
  }

  return (
    <SocialContext.Provider
      value={{
        currentUser, users, posts, orbiting, pulsedPosts, authError, editProfile,
        login, logout, register, clearAuthError,
        toggleOrbit, togglePulse, createPost,
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