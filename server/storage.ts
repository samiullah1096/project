import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import postgres from "postgres";
import bcrypt from "bcrypt";
import { 
  users, toolUsage, adSlots, analytics, adProviders, adCampaigns, 
  adSlotAssignments, adAnalytics, adViews,
  type User, type ToolUsage, type AdSlot, type Analytics,
  type AdProvider, type AdCampaign, type AdSlotAssignment,
  type AdAnalytics, type AdView,
  type InsertUser, type InsertToolUsage, type InsertAdSlot,
  type InsertAnalytics, type InsertAdProvider, type InsertAdCampaign,
  type InsertAdSlotAssignment, type InsertAdAnalytics, type InsertAdView
} from "@shared/schema";

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Tool usage tracking
  createToolUsage(usage: InsertToolUsage): Promise<ToolUsage>;
  getToolUsage(toolName?: string, userId?: string): Promise<ToolUsage[]>;
  getToolStats(): Promise<{ toolName: string; usageCount: number; category: string }[]>;

  // Ad slots management
  getAdSlots(): Promise<AdSlot[]>;
  getAdSlot(id: string): Promise<AdSlot | undefined>;
  createAdSlot(slot: InsertAdSlot): Promise<AdSlot>;
  updateAdSlot(id: string, updates: Partial<AdSlot>): Promise<AdSlot | undefined>;
  deleteAdSlot(id: string): Promise<boolean>;

  // Analytics
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalytics(toolName?: string, category?: string): Promise<Analytics[]>;
  getDailyAnalytics(date: string): Promise<Analytics[]>;

  // Ad management system
  getAdProviders(): Promise<AdProvider[]>;
  getAdProvider(id: string): Promise<AdProvider | undefined>;
  createAdProvider(provider: InsertAdProvider): Promise<AdProvider>;
  updateAdProvider(id: string, updates: Partial<AdProvider>): Promise<AdProvider | undefined>;
  deleteAdProvider(id: string): Promise<boolean>;

  // Ad campaigns
  getAdCampaigns(): Promise<AdCampaign[]>;
  getAdCampaign(id: string): Promise<AdCampaign | undefined>;
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  updateAdCampaign(id: string, updates: Partial<AdCampaign>): Promise<AdCampaign | undefined>;
  deleteAdCampaign(id: string): Promise<boolean>;

  // Ad slot assignments
  getSlotAssignments(): Promise<AdSlotAssignment[]>;
  getAssignmentsBySlot(slotId: string): Promise<AdSlotAssignment[]>;
  createSlotAssignment(assignment: InsertAdSlotAssignment): Promise<AdSlotAssignment>;
  updateSlotAssignment(id: string, updates: Partial<AdSlotAssignment>): Promise<AdSlotAssignment | undefined>;
  deleteSlotAssignment(id: string): Promise<boolean>;

  // Ad analytics and views
  recordAdView(view: InsertAdView): Promise<AdView>;
  getAdAnalytics(filters?: { slotId?: string; campaignId?: string; dateFrom?: string; dateTo?: string }): Promise<AdAnalytics[]>;
  getDailyAdStats(date: string): Promise<AdAnalytics[]>;
  getSlotWithActiveAd(slotId: string): Promise<{ slot: AdSlot; campaign?: AdCampaign } | null>;

  // Analytics
  getAnalyticsData(): Promise<{
    totalUsage: number;
    mostPopular: string;
    popularUsage: number;
    successRate: string;
    toolStats: Array<{
      name: string;
      category: string;
      usageCount: number;
      successRate: number;
      avgProcessingTime: number;
    }>;
  }>;

  // SEO utilities
  generateSitemap(): Promise<string>;
}

export class SupabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for Supabase connection");
    }
    
    const client = postgres(connectionString);
    this.db = drizzle(client);
    
    console.log("Supabase storage initialized successfully!");
  }

  // User management methods
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await this.db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id));
    return result.count > 0;
  }

  // Tool usage tracking methods
  async createToolUsage(usage: InsertToolUsage): Promise<ToolUsage> {
    const [newUsage] = await this.db.insert(toolUsage).values(usage).returning();
    return newUsage;
  }

  async getToolUsage(toolName?: string, userId?: string): Promise<ToolUsage[]> {
    let query = this.db.select().from(toolUsage);
    
    if (toolName && userId) {
      query = query.where(and(eq(toolUsage.toolName, toolName), eq(toolUsage.userId!, userId)));
    } else if (toolName) {
      query = query.where(eq(toolUsage.toolName, toolName));
    } else if (userId) {
      query = query.where(eq(toolUsage.userId!, userId));
    }
    
    return await query.orderBy(desc(toolUsage.timestamp));
  }

  async getToolStats(): Promise<{ toolName: string; usageCount: number; category: string }[]> {
    const stats = await this.db
      .select({
        toolName: toolUsage.toolName,
        category: toolUsage.category,
        usageCount: sql<number>`count(*)::int`
      })
      .from(toolUsage)
      .groupBy(toolUsage.toolName, toolUsage.category)
      .orderBy(desc(sql`count(*)`));
    
    return stats;
  }

  // Ad slots management methods
  async getAdSlots(): Promise<AdSlot[]> {
    return this.db.select().from(adSlots).orderBy(adSlots.createdAt);
  }

  async getAdSlot(id: string): Promise<AdSlot | undefined> {
    const [slot] = await this.db.select().from(adSlots).where(eq(adSlots.id, id));
    return slot;
  }

  async createAdSlot(slot: InsertAdSlot): Promise<AdSlot> {
    const [newSlot] = await this.db.insert(adSlots).values(slot).returning();
    return newSlot;
  }

  async updateAdSlot(id: string, updates: Partial<AdSlot>): Promise<AdSlot | undefined> {
    const [updatedSlot] = await this.db.update(adSlots).set(updates).where(eq(adSlots.id, id)).returning();
    return updatedSlot;
  }

  async deleteAdSlot(id: string): Promise<boolean> {
    const result = await this.db.delete(adSlots).where(eq(adSlots.id, id));
    return result.count > 0;
  }

  // Analytics methods
  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await this.db.insert(analytics).values(analyticsData).returning();
    return newAnalytics;
  }

  async getAnalytics(toolName?: string, category?: string): Promise<Analytics[]> {
    let query = this.db.select().from(analytics);
    
    if (toolName && category) {
      query = query.where(and(eq(analytics.toolName, toolName), eq(analytics.category, category)));
    } else if (toolName) {
      query = query.where(eq(analytics.toolName, toolName));
    } else if (category) {
      query = query.where(eq(analytics.category, category));
    }
    
    return await query.orderBy(desc(analytics.date));
  }

  async getDailyAnalytics(date: string): Promise<Analytics[]> {
    return this.db.select().from(analytics).where(eq(analytics.date, date));
  }

  // Ad management system methods
  async getAdProviders(): Promise<AdProvider[]> {
    return this.db.select().from(adProviders).orderBy(adProviders.createdAt);
  }

  async getAdProvider(id: string): Promise<AdProvider | undefined> {
    const [provider] = await this.db.select().from(adProviders).where(eq(adProviders.id, id));
    return provider;
  }

  async createAdProvider(provider: InsertAdProvider): Promise<AdProvider> {
    const [newProvider] = await this.db.insert(adProviders).values(provider).returning();
    return newProvider;
  }

  async updateAdProvider(id: string, updates: Partial<AdProvider>): Promise<AdProvider | undefined> {
    const [updatedProvider] = await this.db.update(adProviders).set(updates).where(eq(adProviders.id, id)).returning();
    return updatedProvider;
  }

  async deleteAdProvider(id: string): Promise<boolean> {
    const result = await this.db.delete(adProviders).where(eq(adProviders.id, id));
    return result.count > 0;
  }

  // Ad campaigns methods
  async getAdCampaigns(): Promise<AdCampaign[]> {
    return this.db.select().from(adCampaigns).orderBy(adCampaigns.createdAt);
  }

  async getAdCampaign(id: string): Promise<AdCampaign | undefined> {
    const [campaign] = await this.db.select().from(adCampaigns).where(eq(adCampaigns.id, id));
    return campaign;
  }

  async createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
    const [newCampaign] = await this.db.insert(adCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateAdCampaign(id: string, updates: Partial<AdCampaign>): Promise<AdCampaign | undefined> {
    const [updatedCampaign] = await this.db.update(adCampaigns).set(updates).where(eq(adCampaigns.id, id)).returning();
    return updatedCampaign;
  }

  async deleteAdCampaign(id: string): Promise<boolean> {
    const result = await this.db.delete(adCampaigns).where(eq(adCampaigns.id, id));
    return result.count > 0;
  }

  // Ad slot assignments methods
  async getSlotAssignments(): Promise<AdSlotAssignment[]> {
    return this.db.select().from(adSlotAssignments).orderBy(adSlotAssignments.assignedAt);
  }

  async getAssignmentsBySlot(slotId: string): Promise<AdSlotAssignment[]> {
    return this.db.select().from(adSlotAssignments).where(eq(adSlotAssignments.slotId, slotId));
  }

  async createSlotAssignment(assignment: InsertAdSlotAssignment): Promise<AdSlotAssignment> {
    const [newAssignment] = await this.db.insert(adSlotAssignments).values(assignment).returning();
    return newAssignment;
  }

  async updateSlotAssignment(id: string, updates: Partial<AdSlotAssignment>): Promise<AdSlotAssignment | undefined> {
    const [updatedAssignment] = await this.db.update(adSlotAssignments).set(updates).where(eq(adSlotAssignments.id, id)).returning();
    return updatedAssignment;
  }

  async deleteSlotAssignment(id: string): Promise<boolean> {
    const result = await this.db.delete(adSlotAssignments).where(eq(adSlotAssignments.id, id));
    return result.count > 0;
  }

  // Ad analytics and views methods
  async recordAdView(view: InsertAdView): Promise<AdView> {
    const [newView] = await this.db.insert(adViews).values(view).returning();
    return newView;
  }

  async getAdAnalytics(filters?: { slotId?: string; campaignId?: string; dateFrom?: string; dateTo?: string }): Promise<AdAnalytics[]> {
    let query = this.db.select().from(adAnalytics);
    
    if (filters) {
      const conditions = [];
      if (filters.slotId) conditions.push(eq(adAnalytics.slotId, filters.slotId));
      if (filters.campaignId) conditions.push(eq(adAnalytics.campaignId!, filters.campaignId));
      if (filters.dateFrom) conditions.push(gte(adAnalytics.date, filters.dateFrom));
      if (filters.dateTo) conditions.push(lte(adAnalytics.date, filters.dateTo));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(adAnalytics.date));
  }

  async getDailyAdStats(date: string): Promise<AdAnalytics[]> {
    return this.db.select().from(adAnalytics).where(eq(adAnalytics.date, date));
  }

  async getSlotWithActiveAd(slotId: string): Promise<{ slot: AdSlot; campaign?: AdCampaign } | null> {
    const slot = await this.getAdSlot(slotId);
    if (!slot) return null;

    // Find active assignment for this slot
    const [assignment] = await this.db
      .select()
      .from(adSlotAssignments)
      .where(and(eq(adSlotAssignments.slotId, slotId), eq(adSlotAssignments.isActive, true)))
      .orderBy(desc(adSlotAssignments.priority))
      .limit(1);

    if (!assignment) {
      return { slot };
    }

    const campaign = await this.getAdCampaign(assignment.campaignId);
    return { slot, campaign };
  }

  // Analytics summary method
  async getAnalyticsData(): Promise<{
    totalUsage: number;
    mostPopular: string;
    popularUsage: number;
    successRate: string;
    toolStats: Array<{
      name: string;
      category: string;
      usageCount: number;
      successRate: number;
      avgProcessingTime: number;
    }>;
  }> {
    // Get total usage count
    const [totalResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolUsage);
    
    const totalUsage = totalResult?.count || 0;

    // Get tool stats
    const toolStats = await this.db
      .select({
        name: toolUsage.toolName,
        category: toolUsage.category,
        usageCount: sql<number>`count(*)::int`,
        successRate: sql<number>`(count(*) filter (where success = true) * 100.0 / count(*))::int`,
        avgProcessingTime: sql<number>`avg(processing_time)::int`
      })
      .from(toolUsage)
      .groupBy(toolUsage.toolName, toolUsage.category)
      .orderBy(desc(sql`count(*)`));

    // Get most popular tool
    const mostPopular = toolStats[0]?.name || "No data";
    const popularUsage = toolStats[0]?.usageCount || 0;

    // Calculate overall success rate
    const [successResult] = await this.db
      .select({
        successRate: sql<number>`(count(*) filter (where success = true) * 100.0 / count(*))::int`
      })
      .from(toolUsage);
    
    const successRate = `${successResult?.successRate || 0}%`;

    return {
      totalUsage,
      mostPopular,
      popularUsage,
      successRate,
      toolStats: toolStats || []
    };
  }

  // SEO utilities
  async generateSitemap(): Promise<string> {
    const baseUrl = "https://toolsuitepro.com";
    const currentDate = new Date().toISOString().split('T')[0];

    const pages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/pdf-tools", priority: "0.9", changefreq: "weekly" },
      { url: "/image-tools", priority: "0.9", changefreq: "weekly" },
      { url: "/audio-tools", priority: "0.9", changefreq: "weekly" },
      { url: "/text-tools", priority: "0.9", changefreq: "weekly" },
      { url: "/productivity-tools", priority: "0.9", changefreq: "weekly" },
      { url: "/about", priority: "0.7", changefreq: "monthly" },
      { url: "/contact", priority: "0.7", changefreq: "monthly" },
      { url: "/privacy-policy", priority: "0.5", changefreq: "yearly" },
      { url: "/terms-of-service", priority: "0.5", changefreq: "yearly" },
    ];

    const toolPages = [
      "/tools/pdf-to-word",
      "/tools/merge-pdf",
      "/tools/compress-pdf",
      "/tools/image-compressor",
      "/tools/background-remover",
      "/tools/image-resizer",
      "/tools/audio-converter",
      "/tools/audio-compressor",
      "/tools/word-counter",
      "/tools/grammar-checker",
      "/tools/calculator",
      "/tools/qr-generator",
    ];

    toolPages.forEach(tool => {
      pages.push({ url: tool, priority: "0.8", changefreq: "monthly" });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  }
}

export const storage = new SupabaseStorage();