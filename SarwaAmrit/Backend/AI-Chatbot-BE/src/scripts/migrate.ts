import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

import { env } from '../config/env.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '../../migrations')

async function main() {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const { rows } = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file])
      if (rows.length > 0) continue

      const sql = readFileSync(join(migrationsDir, file), 'utf8')
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`Applied ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }

    console.log('Migrations complete')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
