import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slot: integer("slot").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: text("created_at").notNull().default(""),
}, (table) => [uniqueIndex("registrations_slot_unique").on(table.slot)]);
