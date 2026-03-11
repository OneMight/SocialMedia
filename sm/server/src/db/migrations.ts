import { pool } from './index'

async function migrate() {
  console.log('Running migrations...')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username    VARCHAR(50) UNIQUE NOT NULL,
      email       VARCHAR(255) UNIQUE NOT NULL,
      full_name   VARCHAR(100) NOT NULL,
      password    VARCHAR(255) NOT NULL,
      avatar_url  TEXT DEFAULT '',
      bio         TEXT DEFAULT '',
      status      VARCHAR(10) DEFAULT 'offline'
                  CHECK (status IN ('online','away','offline')),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS posts (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type         VARCHAR(10) NOT NULL CHECK (type IN ('photo','thought')),
      image_url    TEXT,
      caption      TEXT NOT NULL DEFAULT '',
      pulses_count INT DEFAULT 0,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orbits (
      follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (follower_id, following_id)
    );

    CREATE TABLE IF NOT EXISTS pulses (
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, post_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  console.log('✅ Migrations done')
  await pool.end()
}

migrate().catch((e) => { console.error(e); process.exit(1) })