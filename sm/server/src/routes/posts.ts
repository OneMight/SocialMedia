import { Router, Response } from 'express'
import { pool } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/posts — все посты (лента)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(`
    SELECT
      p.*,
      EXISTS(SELECT 1 FROM pulses WHERE user_id=$1 AND post_id=p.id) AS is_pulsed,
      (SELECT COUNT(*) FROM comments WHERE post_id=p.id) AS comments_count
    FROM posts p
    ORDER BY p.created_at DESC
  `, [req.userId])
  res.json(result.rows.map(formatPost))
})

// POST /api/posts
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { type, caption, imageUrl } = req.body
  if (!type || !caption) {
    return res.status(400).json({ error: 'type and caption are required' })
  }

  const result = await pool.query(`
    INSERT INTO posts (user_id, type, caption, image_url)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [req.userId, type, caption, imageUrl || null])

  res.status(201).json(formatPost(result.rows[0]))
})

// POST /api/posts/:id/pulse — лайк/анлайк
router.post('/:id/pulse', requireAuth, async (req: AuthRequest, res: Response) => {
  const postId = req.params.id
  const userId = req.userId!

  const exists = await pool.query(
    'SELECT 1 FROM pulses WHERE user_id=$1 AND post_id=$2', [userId, postId]
  )

  if (exists.rows.length > 0) {
    // Убираем пульс
    await pool.query('DELETE FROM pulses WHERE user_id=$1 AND post_id=$2', [userId, postId])
    await pool.query('UPDATE posts SET pulses_count = pulses_count - 1 WHERE id=$1', [postId])
    res.json({ pulsed: false })
  } else {
    // Добавляем пульс
    await pool.query('INSERT INTO pulses (user_id, post_id) VALUES ($1, $2)', [userId, postId])
    await pool.query('UPDATE posts SET pulses_count = pulses_count + 1 WHERE id=$1', [postId])
    res.json({ pulsed: true })
  }
})

// GET /api/posts/me/pulsed — какие посты я лайкнул
router.get('/me/pulsed', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'SELECT post_id FROM pulses WHERE user_id=$1', [req.userId]
  )
  res.json(result.rows.map((r: any) => r.post_id))
})

function formatPost(p: any) {
  return {
    id: p.id,
    userId: p.user_id,
    type: p.type,
    imageUrl: p.image_url,
    caption: p.caption,
    pulsesCount: Number(p.pulses_count),
    isPulsed: p.is_pulsed || false,
    comments: [],
    createdAt: new Date(p.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    }),
  }
}

export default router