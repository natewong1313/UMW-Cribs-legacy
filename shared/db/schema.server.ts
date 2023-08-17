import { sql, type InferModel } from "drizzle-orm"
import {
  mysqlTable,
  bigint,
  double,
  boolean,
  varchar,
  timestamp,
  text,
  json,
} from "drizzle-orm/mysql-core"

export const user = mysqlTable("auth_user", {
  id: varchar("id", { length: 15 }).primaryKey(),
  providerId: varchar("providerId", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  firstName: varchar("firstName", { length: 256 }).notNull(),
  lastName: varchar("lastName", { length: 256 }).notNull(),
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
  hashedPassword: varchar("hashed_password", { length: 255 }),
})
export type Key = InferModel<typeof key>

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 15 }).notNull(),
  expiresAt: timestamp("expires_at", { fsp: 2 }).notNull(),
})
export type PasswordResetToken = InferModel<typeof passwordResetTokens>

export const listing = mysqlTable("listing", {
  id: varchar("id", { length: 255 }).primaryKey(),
  price: bigint("price", { mode: "number" }).notNull(),
  bedrooms: bigint("bedrooms", { mode: "number" }).notNull(),
  bathrooms: bigint("bathrooms", { mode: "number" }).notNull(),
  sqft: bigint("sqft", { mode: "number" }),
  addressLineOne: varchar("address_line_one", { length: 255 }).notNull(),
  addressLineTwo: varchar("address_line_two", { length: 255 }),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  zip: bigint("zip", { mode: "number" }).notNull(),
  latitude: double("latitude", { precision: 7, scale: 4 }).notNull(),
  longitude: double("longitude", { precision: 7, scale: 4 }).notNull(),
  availabilityDate: timestamp("availability_date", { fsp: 2 }).notNull(),
  lastUpdatedAt: timestamp("last_updated_at", { fsp: 2 }).notNull(),
  listingUrl: varchar("listing_url", { length: 255 }).notNull(),
  listingSource: varchar("listing_source", { length: 255 }).notNull(),
  description: text("description"),
  contactInfoEmail: varchar("contact_info_email", { length: 255 }),
  contactInfoPhone: varchar("contact_info_phone", { length: 255 }),
  imageUrls: json("image_urls"),
  mainImage: varchar("main_image", { length: 255 }),
  isPreferredImageSource: boolean("is_preferred_image_source").notNull(),
  isAvailable: boolean("is_available").notNull(),
})
export type Listing = InferModel<typeof listing>

export const userLikedListings = mysqlTable("user_liked_listings", {
  userId: varchar("user_id", { length: 15 }).notNull(),
  listingId: varchar("listing_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 2 })
    .notNull()
    .default(sql`(now(2))`),
})
