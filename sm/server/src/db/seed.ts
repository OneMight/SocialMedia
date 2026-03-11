import { pool } from './index'
import bcrypt from 'bcrypt'

async function seed() {
  console.log('Seeding database...')

  const password = await bcrypt.hash('password123', 10)

  const users = [
    { username: 'nova.creates',    email: 'nova@example.com',   fullName: 'Nova',  avatar: 'https://picsum.photos/150?random=10', bio: 'Chasing light and shadows. ✧ Visual artist' },
    { username: 'midnight_coder',  email: 'elias@example.com',  fullName: 'Elias', avatar: 'https://picsum.photos/150?random=11', bio: 'Turning coffee into architecture. Late night thoughts.' },
    { username: 'wanderlust.kai',  email: 'kai@example.com',    fullName: 'Kai',   avatar: 'https://picsum.photos/150?random=12', bio: 'Earth is art. Documenting the journey.' },
    { username: 'pixel.witch',     email: 'luna@example.com',   fullName: 'Luna',  avatar: 'https://picsum.photos/150?random=13', bio: 'Digital sorcery & design systems. ✨' },
    { username: 'zen.garden',      email: 'kenji@example.com',  fullName: 'Kenji', avatar: 'https://picsum.photos/150?random=14', bio: 'Minimalism. Breath. Focus.' },
    { username: 'cosmic.drift',    email: 'aria@example.com',   fullName: 'Aria',  avatar: 'https://picsum.photos/150?random=15', bio: 'Soundscapes and visual poetry. 🎵' },
  ]

  const insertedIds: string[] = []

  for (const u of users) {
    const res = await pool.query(
      `INSERT INTO users (username, email, full_name, password, avatar_url, bio, status)
       VALUES ($1,$2,$3,$4,$5,$6,'online')
       ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [u.username, u.email, u.fullName, password, u.avatar, u.bio]
    )
    insertedIds.push(res.rows[0].id)
  }

  // Посты
  const postData = [
    { userIdx: 1, type: 'thought', image: null,         caption: 'There is a profound silence that settles over the city at 3 AM. Its the only time the noise of ambition fades.' },
    { userIdx: 0, type: 'photo',   image: 'https://picsum.photos/600?random=101', caption: 'Caught the exact moment the sun dipped below the horizon. 🌅' },
    { userIdx: 3, type: 'thought', image: null,         caption: 'Design isnt just about making things look good. Its about creating a frequency that resonates with the user.' },
    { userIdx: 2, type: 'photo',   image: 'https://picsum.photos/600?random=102', caption: 'Lost in the concrete jungle.' },
    { userIdx: 4, type: 'thought', image: null,         caption: 'Declutter your physical space to declutter your mind. The less you own, the less owns you.' },
    { userIdx: 5, type: 'photo',   image: 'https://picsum.photos/600?random=103', caption: 'New synth setup is finally complete. 🎛️✨' },
    { userIdx: 1, type: 'photo',   image: 'https://picsum.photos/600?random=104', caption: 'My workspace at midnight. Just me, the code, and a cold brew.' },
    { userIdx: 0, type: 'thought', image: null,         caption: 'Sometimes the best creative decision you can make is to step away from the canvas.' },
  ]

  for (const p of postData) {
    await pool.query(
      `INSERT INTO posts (user_id, type, image_url, caption)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [insertedIds[p.userIdx], p.type, p.image, p.caption]
    )
  }

  console.log('✅ Seed done — all users have password: password123')
  await pool.end()
}

seed().catch((e) => { console.error(e); process.exit(1) })