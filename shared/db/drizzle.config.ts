import * as dotenv from "dotenv"
import type { Config } from "drizzle-kit"

dotenv.config({
  path: ".dev.vars",
})

const config: Config = {
  schema: "./schema.server.ts",
  driver: "mysql2",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  },
}

export default config
