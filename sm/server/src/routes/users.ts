import { Router, Response } from 'express'
import { pool } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()


router.get('/me/orbiting', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'SELECT following_id FROM orbits WHERE follower_id = $1', [req.userId]
  )
  res.json(result.rows.map((r: any) => r.following_id))
})

// GET /api/users — все пользователи с счётчиками
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(`
    SELECT
      u.id, u.username, u.email, u.full_name, u.avatar_url, u.bio, u.status,
      (SELECT COUNT(*) FROM orbits WHERE following_id = u.id) AS followers_count,
      (SELECT COUNT(*) FROM orbits WHERE follower_id  = u.id) AS following_count,
      (SELECT COUNT(*) FROM posts   WHERE user_id     = u.id) AS posts_count
    FROM users u
    ORDER BY u.created_at ASC
  `)
  res.json(result.rows.map(formatUser))
})

// GET /api/users/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(`
    SELECT
      u.id, u.username, u.email, u.full_name, u.avatar_url, u.bio, u.status,
      (SELECT COUNT(*) FROM orbits WHERE following_id = u.id) AS followers_count,
      (SELECT COUNT(*) FROM orbits WHERE follower_id  = u.id) AS following_count,
      (SELECT COUNT(*) FROM posts   WHERE user_id     = u.id) AS posts_count
    FROM users u WHERE u.id = $1
  `, [req.userId])

  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' })
  res.json(formatUser(result.rows[0]))
})

// GET /api/users/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(`
    SELECT
      u.id, u.username, u.email, u.full_name, u.avatar_url, u.bio, u.status,
      (SELECT COUNT(*) FROM orbits WHERE following_id = u.id) AS followers_count,
      (SELECT COUNT(*) FROM orbits WHERE follower_id  = u.id) AS following_count,
      (SELECT COUNT(*) FROM posts   WHERE user_id     = u.id) AS posts_count
    FROM users u WHERE u.id = $1
  `, [req.params.id])

  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' })
  res.json(formatUser(result.rows[0]))
})
router.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { fullName, bio, avatarUrl } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           bio = COALESCE($2, bio), 
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING *`,
      [fullName, bio, avatarUrl, req.userId]
    );

    res.json(formatUser(result.rows[0]));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


function formatUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.full_name,
    avatarUrl: u.avatar_url,
    bio: u.bio,
    status: u.status,
    followersCount: Number(u.followers_count),
    followingCount: Number(u.following_count),
    postsCount: Number(u.posts_count),
  }
}

export default router