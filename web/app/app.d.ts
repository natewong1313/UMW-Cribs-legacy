import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import type { Authenticator } from "@/lib/auth.server"

/// <reference types="lucia-auth" />
declare namespace Lucia {
  type Auth = import("@/lib/auth.server").Authenticator
  type UserAttributes = {
    email: string
    emailVerifiedAt?: string | null
    createdAt?: string
    avatar?: string | null
  }
}

export type TypesafeEnv = {
  __STATIC_CONTENT: Fetcher
  IS_DEV: boolean
  DATABASE_URL: string
}

declare module "@remix-run/cloudflare" {
  export interface AppLoadContext {
    env: TypesafeEnv
    db: PlanetScaleDatabase<Record<string, never>>
    auth: Authenticator
    is_dev: boolean
  }
}
