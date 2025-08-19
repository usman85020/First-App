import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userTypeEnum = pgEnum("user_type", ["police", "citizen"]);
export const opportunityCategoryEnum = pgEnum("opportunity_category", [
  "traffic_management",
  "community_events", 
  "awareness_campaigns",
  "emergency_response",
  "safety_initiative"
]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected", "completed"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["earned", "spent"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  userType: userTypeEnum("user_type").notNull().default("citizen"),
  badgeNumber: text("badge_number"),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: opportunityCategoryEnum("category").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in hours
  volunteersNeeded: integer("volunteers_needed").notNull(),
  creditsReward: integer("credits_reward").notNull(),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").references(() => opportunities.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: applicationStatusEnum("status").notNull().default("pending"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  creditsRequired: integer("credits_required").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  relatedId: varchar("related_id"), // opportunity or reward id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const redemptions = pgTable("redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rewardId: varchar("reward_id").references(() => rewards.id).notNull(),
  voucherCode: text("voucher_code").notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  opportunities: many(opportunities),
  applications: many(applications),
  transactions: many(transactions),
  redemptions: many(redemptions),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  creator: one(users, {
    fields: [opportunities.createdById],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [applications.opportunityId],
    references: [opportunities.id],
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const redemptionsRelations = relations(redemptions, ({ one }) => ({
  user: one(users, {
    fields: [redemptions.userId],
    references: [users.id],
  }),
  reward: one(rewards, {
    fields: [redemptions.rewardId],
    references: [rewards.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  credits: true,
  createdAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdById: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  completedAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertRedemptionSchema = createInsertSchema(redemptions).omit({
  id: true,
  redeemedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
