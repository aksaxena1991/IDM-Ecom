import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/persistence/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://chatbot:chatbot_dev_password@localhost:5434/chatbot',
  },
})
