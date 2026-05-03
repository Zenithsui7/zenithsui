import { pgTable, serial, text, boolean, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appsTable = pgTable("apps", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull().default("🌐"),
  color: text("color").notNull().default("#f97316"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  position: integer("position").notNull().default(0),
  launchCount: integer("launch_count").notNull().default(0),
  lastLaunchedAt: timestamp("last_launched_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAppSchema = createInsertSchema(appsTable).omit({ id: true, userId: true, launchCount: true, lastLaunchedAt: true, createdAt: true, updatedAt: true });
export const updateAppSchema = insertAppSchema.partial();

export type InsertApp = z.infer<typeof insertAppSchema>;
export type UpdateApp = z.infer<typeof updateAppSchema>;
export type App = typeof appsTable.$inferSelect;
