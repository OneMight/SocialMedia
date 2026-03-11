import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db/index'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET!

// УДАЛИТЕ эту строку - она вызывает ошибку
// router.options('*', (req, res) => { ... })

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, fullName, password, avatarUrl = '', bio = '' } = req.body

  // Валидация
  if (!username || !email || !fullName || !password) {
    return res.status(400).json({ field: 'general', message: 'All fields are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ field: 'email', message: 'Enter a valid email address' })
  }
  if (username.length < 3) {
    return res.status(400).json({ field: 'username', message: 'Username must be at least 3 characters' })
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return res.status(400).json({ field: 'username', message: 'Username can only contain letters, numbers, _ and .' })
  }
  if (password.length < 6) {
    return res.status(400).json({ field: 'password', message: 'Password must be at least 6 characters' })
  }

  try {
    // Проверка уникальности
    const existing = await pool.query(
      'SELECT id, username, email FROM users WHERE username = $1 OR email = $2',
      [username, email]
    )
    if (existing.rows.length > 0) {
      const taken = existing.rows[0]
      if (taken.username === username) {
        return res.status(409).json({ field: 'username', message: 'This username is already taken' })
      }
      return res.status(409).json({ field: 'email', message: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (username, email, full_name, password, avatar_url, bio, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'online')
       RETURNING id, username, email, full_name, avatar_url, bio, status, created_at`,
      [username, email, fullName, hashedPassword, avatarUrl, bio]
    )

    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        status: user.status,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ field: 'general', message: 'Server error. Try again later.' })
  }
})

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ field: 'general', message: 'All fields are required' })
  }

  try {
    const result = await pool.query(
      `SELECT
         u.id, u.username, u.email, u.full_name, u.password,
         u.avatar_url, u.bio, u.status,
         COUNT(DISTINCT o1.follower_id) AS followers_count,
         COUNT(DISTINCT o2.following_id) AS following_count,
         COUNT(DISTINCT p.id) AS posts_count
       FROM users u
       LEFT JOIN orbits o1 ON o1.following_id = u.id
       LEFT JOIN orbits o2 ON o2.follower_id  = u.id
       LEFT JOIN posts  p  ON p.user_id = u.id
       WHERE u.username = $1 OR u.email = $1
       GROUP BY u.id`,
      [usernameOrEmail]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ field: 'username', message: 'No account found with that username or email' })
    }

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ field: 'password', message: 'Incorrect password' })
    }

    // Обновляем статус на online
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['online', user.id])

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        status: 'online',
        followersCount: parseInt(user.followers_count) || 0,
        followingCount: parseInt(user.following_count) || 0,
        postsCount: parseInt(user.posts_count) || 0,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ field: 'general', message: 'Server error. Try again later.' })
  }
})

// ─── ME (проверка токена) ─────────────────────────────────────────────────────
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

    const result = await pool.query(
      `SELECT
         u.id, u.username, u.email, u.full_name,
         u.avatar_url, u.bio, u.status,
         COUNT(DISTINCT o1.follower_id) AS followers_count,
         COUNT(DISTINCT o2.following_id) AS following_count,
         COUNT(DISTINCT p.id) AS posts_count
       FROM users u
       LEFT JOIN orbits o1 ON o1.following_id = u.id
       LEFT JOIN orbits o2 ON o2.follower_id  = u.id
       LEFT JOIN posts  p  ON p.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [payload.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = result.rows[0]
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      status: user.status,
      followersCount: parseInt(user.followers_count) || 0,
      followingCount: parseInt(user.following_count) || 0,
      postsCount: parseInt(user.posts_count) || 0,
    })
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
})

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
router.post('/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['offline', payload.userId])
    } catch { /* токен просрочен — ничего страшного */ }
  }
  return res.json({ message: 'Logged out' })
})

export default router