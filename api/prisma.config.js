import { defineConfig } from "prisma/config";
import 'dotenv/config'


export default defineConfig({
  schema: "src/database/schema.prisma",
  migrations: {
    path: "src/database/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.PRISMA_DATABASE_URL,
  },
});
