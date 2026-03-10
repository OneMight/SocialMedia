export interface User {
  id: string
  username: string
  email?: string
  fullName: string
  avatarUrl: string
  bio: string
  followersCount: number
  followingCount: number
  postsCount: number
  status: 'online' | 'away' | 'offline'
}

export interface Comment {
  id: string
  userId: string
  text: string
  createdAt: string
}

export interface Post {
  id: string
  userId: string
  type: 'photo' | 'thought'
  imageUrl?: string // Optional for thought posts
  caption: string
  pulsesCount: number
  comments: Comment[]
  createdAt: string
}
