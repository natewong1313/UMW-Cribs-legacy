import { sql, type InferModel } from "drizzle-orm"
import {
  mysqlTable,
  bigint,
  boolean,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/mysql-core"

export const user = mysqlTable("auth_user", {
  id: varchar("id", { length: 15 }).primaryKey(),
  email: varchar("email", { length: 256 }).notNull(),
  emailVerifiedAt: timestamp("email_verified", { fsp: 2 }),
  createdAt: timestamp("created_at", { fsp: 2 })
    .notNull()
    .default(sql`(now(2))`),
  avatar: text("avatar"),
})
export type User = InferModel<typeof user>

export const session = mysqlTable("auth_session", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 15 }).notNull(),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
})
export type Session = InferModel<typeof session>

export const key = mysqlTable("auth_key", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 15 }).notNull(),
  primaryKey: boolean("primary_key").notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }),
  expires: bigint("expires", { mode: "number" }),
})
export type Key = InferModel<typeof key>
