import React, { useState, createContext, useContext, ReactNode } from 'react'
import { User, Post } from '../app/types/social'
interface SocialState {
  currentUser: User | null
  users: User[]
  posts: Post[]
  orbiting: Set<string>
  pulsedPosts: Set<string>
  
  login: (username: string) => void
  logout: () => void
  register: (
    user: Omit<
      User,
      'id' | 'followersCount' | 'followingCount' | 'postsCount' | 'status'
    >,
  ) => void
  toggleOrbit: (userId: string) => void
  togglePulse: (postId: string) => void
  createPost: (
    type: 'photo' | 'thought',
    caption: string,
    imageUrl?: string,
  ) => void
}
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'nova.creates',
    email: 'nova@example.com',
    fullName: 'Nova',
    avatarUrl: 'https://picsum.photos/150?random=10',
    bio: 'Chasing light and shadows. ✧ Visual artist',
    followersCount: 1240,
    followingCount: 342,
    postsCount: 5,
    status: 'online',
  },
  {
    id: '2',
    username: 'midnight_coder',
    email: 'elias@example.com',
    fullName: 'Elias',
    avatarUrl: 'https://picsum.photos/150?random=11',
    bio: 'Turning coffee into architecture. Late night thoughts.',
    followersCount: 8900,
    followingCount: 450,
    postsCount: 12,
    status: 'away',
  },
  {
    id: '3',
    username: 'wanderlust.kai',
    email: 'kai@example.com',
    fullName: 'Kai',
    avatarUrl: 'https://picsum.photos/150?random=12',
    bio: 'Earth is art. Documenting the journey.',
    followersCount: 4500,
    followingCount: 800,
    postsCount: 8,
    status: 'offline',
  },
  {
    id: '4',
    username: 'pixel.witch',
    email: 'luna@example.com',
    fullName: 'Luna',
    avatarUrl: 'https://picsum.photos/150?random=13',
    bio: 'Digital sorcery & design systems. ✨',
    followersCount: 12000,
    followingCount: 200,
    postsCount: 15,
    status: 'online',
  },
  {
    id: '5',
    username: 'zen.garden',
    fullName: 'Kenji',
    email: 'kenji@example.com',
    avatarUrl: 'https://picsum.photos/150?random=14',
    bio: 'Minimalism. Breath. Focus.',
    followersCount: 5600,
    followingCount: 150,
    postsCount: 10,
    status: 'offline',
  },
  {
    id: '6',
    username: 'cosmic.drift',
    fullName: 'Aria',
    email: 'aria@example.com',
    avatarUrl: 'https://picsum.photos/150?random=15',
    bio: 'Soundscapes and visual poetry. 🎵',
    followersCount: 3200,
    followingCount: 400,
    postsCount: 6,
    status: 'online',
  },
]
const MOCK_POSTS: Post[] = [
  {
    id: '101',
    userId: '2',
    type: 'thought',
    caption:
      'There is a profound silence that settles over the city at 3 AM. It’s the only time the noise of ambition fades enough to hear your own thoughts clearly. The screen glows, the world sleeps, and for a moment, everything makes sense.',
    pulsesCount: 342,
    comments: [],
    createdAt: '2h ago',
  },
  {
    id: '102',
    userId: '1',
    type: 'photo',
    imageUrl: 'https://picsum.photos/600?random=101',
    caption:
      'Caught the exact moment the sun dipped below the horizon. The amber hues are unreal today. 🌅',
    pulsesCount: 1205,
    comments: [],
    createdAt: '5h ago',
  },
  {
    id: '103',
    userId: '4',
    type: 'thought',
    caption:
      'Design isn’t just about making things look good. It’s about creating a frequency that resonates with the user. If they don’t feel it, you haven’t designed it.',
    pulsesCount: 890,
    comments: [],
    createdAt: '1d ago',
  },
  {
    id: '104',
    userId: '3',
    type: 'photo',
    imageUrl: 'https://picsum.photos/600?random=102',
    caption:
      'Lost in the concrete jungle. Every alleyway tells a different story if you look closely enough.',
    pulsesCount: 215,
    comments: [],
    createdAt: '1d ago',
  },
  {
    id: '105',
    userId: '5',
    type: 'thought',
    caption:
      'Declutter your physical space to declutter your mind. The less you own, the less owns you. Finding peace in the void.',
    pulsesCount: 450,
    comments: [],
    createdAt: '2d ago',
  },
  {
    id: '106',
    userId: '6',
    type: 'photo',
    imageUrl: 'https://picsum.photos/600?random=103',
    caption:
      'New synth setup is finally complete. The analog warmth is exactly what I’ve been searching for. 🎛️✨',
    pulsesCount: 670,
    comments: [],
    createdAt: '3d ago',
  },
  {
    id: '107',
    userId: '2',
    type: 'photo',
    imageUrl: 'https://picsum.photos/600?random=104',
    caption: 'My workspace at midnight. Just me, the code, and a cold brew.',
    pulsesCount: 520,
    comments: [],
    createdAt: '4d ago',
  },
  {
    id: '108',
    userId: '1',
    type: 'thought',
    caption:
      'Sometimes the best creative decision you can make is to step away from the canvas. Inspiration rarely strikes when you’re forcing it.',
    pulsesCount: 980,
    comments: [],
    createdAt: '5d ago',
  },
]
const SocialContext = createContext<SocialState | undefined>(undefined)
export function SocialProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0])
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [orbiting, setOrbiting] = useState<Set<string>>(
    new Set(['2', '3', '4']),
  )
  const [pulsedPosts, setPulsedPosts] = useState<Set<string>>(
    new Set(['101', '103']),
  )
  const login = (username: string) => {
    const user = users.find(
      (u) => u.username === username || u.email === username,
    )
    if (user) {
      setCurrentUser(user)
    } else {
      setCurrentUser(users[0])
    }
  }
  const logout = () => {
    setCurrentUser(null)
  }
  const register = (
    userData: Omit<
      User,
      'id' | 'followersCount' | 'followingCount' | 'postsCount' | 'status'
    >,
  ) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(7),
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      status: 'online',
    }
    setUsers((prev) => [...prev, newUser])
    setCurrentUser(newUser)
  }
  const toggleOrbit = (userId: string) => {
    setOrbiting((prev) => {
      const newOrbiting = new Set(prev)
      if (newOrbiting.has(userId)) {
        newOrbiting.delete(userId)
      } else {
        newOrbiting.add(userId)
      }
      return newOrbiting
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
      }),
    )
  }
  const togglePulse = (postId: string) => {
    setPulsedPosts((prev) => {
      const newPulsed = new Set(prev)
      if (newPulsed.has(postId)) {
        newPulsed.delete(postId)
      } else {
        newPulsed.add(postId)
      }
      return newPulsed
    })
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            pulsesCount: pulsedPosts.has(postId)
              ? post.pulsesCount - 1
              : post.pulsesCount + 1,
          }
        }
        return post
      }),
    )
  }
  const createPost = (
    type: 'photo' | 'thought',
    caption: string,
    imageUrl?: string,
  ) => {
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
      prev.map((user) => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            postsCount: user.postsCount + 1,
          }
        }
        return user
      }),
    )
  }
  return (
    <SocialContext.Provider
      value={{
        currentUser,
        users,
        posts,
        orbiting,
        pulsedPosts,
        login,
        logout,
        register,
        toggleOrbit,
        togglePulse,
        createPost,
      }}
    >
      {children}
    </SocialContext.Provider>
  )
}
export function useSocialStore() {
  const context = useContext(SocialContext)
  if (context === undefined) {
    throw new Error('useSocialStore must be used within a SocialProvider')
  }
  return context
}
