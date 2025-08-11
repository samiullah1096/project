import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const toolUsage = pgTable("tool_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolName: text("tool_name").notNull(),
  category: text("category").notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"), // For anonymous users
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  processingTime: integer("processing_time"), // in milliseconds
  fileSize: integer("file_size"), // in bytes
  success: boolean("success").notNull(),
});

export const adSlots = pgTable("ad_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(), // 'header', 'sidebar', 'footer', 'tool-top', 'tool-bottom'
  page: text("page").notNull(), // 'home', 'pdf-tools', etc.
  isActive: boolean("is_active").notNull().default(true),
  adProvider: text("ad_provider"), // 'google-adsense', 'media-net', etc.
  adCode: text("ad_code"),
  settings: jsonb("settings"), // Additional ad configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD format
  toolName: text("tool_name").notNull(),
  category: text("category").notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  successRate: text("success_rate"), // Percentage as string
  avgProcessingTime: integer("avg_processing_time"), // in milliseconds
});

// Ad Management Tables
export const adProviders = pgTable("ad_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // 'Google AdSense', 'Media.net', etc.
  type: text("type").notNull(), // Provider type: adsense, medianet, amazon, propellerads, etc.
  isActive: boolean("is_active").notNull().default(true),
  credentials: text("credentials"), // Encrypted JSON with API keys, publisher ID, etc.
  settings: jsonb("settings"), // Provider-specific settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adCampaigns = pgTable("ad_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  providerId: varchar("provider_id").references(() => adProviders.id).notNull(),
  adType: text("ad_type").notNull(), // 'banner', 'video', 'native', 'popup'
  adCode: text("ad_code").notNull(), // HTML/JS code for the ad
  dimensions: text("dimensions"), // '300x250', '728x90', etc.
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targetAudience: jsonb("target_audience"), // Targeting settings
  cpmRate: integer("cpm_rate"), // CPM in cents
  clickUrl: text("click_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adSlotAssignments = pgTable("ad_slot_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slotId: varchar("slot_id").references(() => adSlots.id).notNull(),
  campaignId: varchar("campaign_id").references(() => adCampaigns.id).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(1), // Higher number = higher priority
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id).notNull(),
});

export const adAnalytics = pgTable("ad_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slotId: varchar("slot_id").references(() => adSlots.id).notNull(),
  campaignId: varchar("campaign_id").references(() => adCampaigns.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  page: text("page").notNull(), // Page where ad was shown
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  revenue: integer("revenue").notNull().default(0), // Revenue in cents
  uniqueViews: integer("unique_views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adViews = pgTable("ad_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slotId: varchar("slot_id").references(() => adSlots.id).notNull(),
  campaignId: varchar("campaign_id").references(() => adCampaigns.id),
  sessionId: text("session_id").notNull(), // Browser session ID
  ipHash: text("ip_hash").notNull(), // Hashed IP for deduplication
  userAgent: text("user_agent"),
  page: text("page").notNull(),
  viewType: text("view_type").notNull(), // 'impression', 'click'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToolUsageSchema = createInsertSchema(toolUsage).omit({
  id: true,
  timestamp: true,
});

export const insertAdSlotSchema = createInsertSchema(adSlots).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertAdProviderSchema = createInsertSchema(adProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdSlotAssignmentSchema = createInsertSchema(adSlotAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertAdAnalyticsSchema = createInsertSchema(adAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertAdViewSchema = createInsertSchema(adViews).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertToolUsage = z.infer<typeof insertToolUsageSchema>;
export type ToolUsage = typeof toolUsage.$inferSelect;
export type InsertAdSlot = z.infer<typeof insertAdSlotSchema>;
export type AdSlot = typeof adSlots.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type InsertAdProvider = z.infer<typeof insertAdProviderSchema>;
export type AdProvider = typeof adProviders.$inferSelect;
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdSlotAssignment = z.infer<typeof insertAdSlotAssignmentSchema>;
export type AdSlotAssignment = typeof adSlotAssignments.$inferSelect;
export type InsertAdAnalytics = z.infer<typeof insertAdAnalyticsSchema>;
export type AdAnalytics = typeof adAnalytics.$inferSelect;
export type InsertAdView = z.infer<typeof insertAdViewSchema>;
export type AdView = typeof adViews.$inferSelect;
