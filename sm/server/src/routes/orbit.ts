import { Router, Response } from 'express'
import { pool } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/orbit/:userId — подписаться/отписаться
router.post('/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  const followingId = req.params.userId
  const followerId = req.userId!

  if (followerId === followingId) {
    return res.status(400).json({ error: 'Cannot orbit yourself' })
  }

  const exists = await pool.query(
    'SELECT 1 FROM orbits WHERE follower_id=$1 AND following_id=$2',
    [followerId, followingId]
  )

  if (exists.rows.length > 0) {
    await pool.query(
      'DELETE FROM orbits WHERE follower_id=$1 AND following_id=$2',
      [followerId, followingId]
    )
    res.json({ orbiting: false })
  } else {
    await pool.query(
      'INSERT INTO orbits (follower_id, following_id) VALUES ($1, $2)',
      [followerId, followingId]
    )
    res.json({ orbiting: true })
  }
})

export default router