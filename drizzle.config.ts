import { defineConfig } from "drizzle-kit";

const isPostgres = process.env.DATABASE_URL?.startsWith('postgresql://') || 
                   process.env.DATABASE_URL?.startsWith('postgres://');

if (!isPostgres) {
  throw new Error('DATABASE_URL must be a PostgreSQL connection string (postgresql:// or postgres://)');
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL || '',
  },
});
