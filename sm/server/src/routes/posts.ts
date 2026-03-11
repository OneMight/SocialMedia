// server/src/routes/posts.ts
import { Router, Response } from 'express'
import { pool } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/posts — все посты
router.get('/', async (req: AuthRequest, res: Response) => {
  // Пробуем достать userId из токена, но не требуем его
  let userId: string | null = null
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken')
      const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!) as any
      userId = payload.userId
    } catch {}
  }

  const result = await pool.query(`
    SELECT 
      p.*,
      u.username,
      u.avatar_url,
      ${userId ? 'EXISTS(SELECT 1 FROM pulses WHERE user_id = $1 AND post_id = p.id)' : 'false'} AS is_pulsed,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count
    FROM posts p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
  `, userId ? [userId] : [])

  res.json(result.rows.map(formatPost))
})

// POST /api/posts
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { type, caption, imageUrl } = req.body
  
  if (!type || !caption) {
    return res.status(400).json({ error: 'type and caption are required' })
  }

  if (type === 'photo' && !imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required for photo posts' })
  }

  try {
    const result = await pool.query(`
      INSERT INTO posts (user_id, type, caption, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.userId, type, caption, imageUrl || null])

    const post = result.rows[0]
    
    // Получаем информацию о пользователе
    const userResult = await pool.query(
      'SELECT username, avatar_url FROM users WHERE id = $1',
      [req.userId]
    )
    
    res.status(201).json(formatPost({
      ...post,
      username: userResult.rows[0]?.username,
      avatar_url: userResult.rows[0]?.avatar_url
    }))
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// POST /api/posts/:id/pulse
router.post('/:id/pulse', requireAuth, async (req: AuthRequest, res: Response) => {
  const postId = req.params.id
  const userId = req.userId!

  try {
    const exists = await pool.query(
      'SELECT 1 FROM pulses WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    )

    if (exists.rows.length > 0) {
      await pool.query('DELETE FROM pulses WHERE user_id = $1 AND post_id = $2', [userId, postId])
      await pool.query('UPDATE posts SET pulses_count = pulses_count - 1 WHERE id = $1', [postId])
      res.json({ pulsed: false })
    } else {
      await pool.query('INSERT INTO pulses (user_id, post_id) VALUES ($1, $2)', [userId, postId])
      await pool.query('UPDATE posts SET pulses_count = pulses_count + 1 WHERE id = $1', [postId])
      res.json({ pulsed: true })
    }
  } catch (error) {
    console.error('Error toggling pulse:', error)
    res.status(500).json({ error: 'Failed to toggle pulse' })
  }
})

// GET /api/posts/me/pulsed
router.get('/me/pulsed', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT post_id FROM pulses WHERE user_id = $1',
      [req.userId]
    )
    res.json(result.rows.map(r => r.post_id))
  } catch (error) {
    console.error('Error fetching pulsed posts:', error)
    res.status(500).json({ error: 'Failed to fetch pulsed posts' })
  }
})

function formatPost(p: any) {
  return {
    id: p.id,
    userId: p.user_id,
    username: p.username,
    userAvatar: p.avatar_url,
    type: p.type,
    imageUrl: p.image_url,
    caption: p.caption,
    pulsesCount: Number(p.pulses_count),
    isPulsed: p.is_pulsed || false,
    commentsCount: Number(p.comments_count) || 0,
    comments: [],
    createdAt: new Date(p.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  }
}

export default router