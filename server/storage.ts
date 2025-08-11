import { 
  type User, type InsertUser, 
  type ToolUsage, type InsertToolUsage, 
  type AdSlot, type InsertAdSlot,
  type AdProvider, type InsertAdProvider,
  type AdCampaign, type InsertAdCampaign,
  type AdSlotAssignment, type InsertAdSlotAssignment,
  type AdAnalytics, type InsertAdAnalytics,
  type AdView, type InsertAdView,
  type Analytics,
  users, toolUsage, adSlots, adProviders, adCampaigns, adSlotAssignments, adAnalytics, adViews
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  authenticateUser(email: string, password: string): Promise<User | undefined>;

  // Tool usage tracking
  createToolUsage(usage: InsertToolUsage): Promise<ToolUsage>;
  getToolUsage(filters?: { toolName?: string; category?: string; dateFrom?: Date; dateTo?: Date }): Promise<ToolUsage[]>;

  // Ad slot management
  getAdSlots(): Promise<AdSlot[]>;
  getActiveAdSlots(page: string): Promise<AdSlot[]>;
  createAdSlot(adSlot: InsertAdSlot): Promise<AdSlot>;
  updateAdSlot(id: string, updates: Partial<AdSlot>): Promise<AdSlot | undefined>;
  deleteAdSlot(id: string): Promise<boolean>;

  // Ad provider management
  getAdProviders(): Promise<AdProvider[]>;
  getActiveAdProviders(): Promise<AdProvider[]>;
  createAdProvider(provider: InsertAdProvider): Promise<AdProvider>;
  updateAdProvider(id: string, updates: Partial<AdProvider>): Promise<AdProvider | undefined>;
  deleteAdProvider(id: string): Promise<boolean>;

  // Ad campaign management
  getAdCampaigns(): Promise<AdCampaign[]>;
  getActiveCampaigns(): Promise<AdCampaign[]>;
  getCampaignsByProvider(providerId: string): Promise<AdCampaign[]>;
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
  getAnalytics(): Promise<{
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

export class MemStorage implements IStorage {
  private users: User[] = [];
  private toolUsages: ToolUsage[] = [];
  private adSlots: AdSlot[] = [];
  private analytics: Analytics[] = [];
  private adProviders: AdProvider[] = [];
  private adCampaigns: AdCampaign[] = [];
  private adSlotAssignments: AdSlotAssignment[] = [];
  private adAnalytics: AdAnalytics[] = [];
  private adViews: AdView[] = [];

  constructor() {
    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default ad slots
    this.initializeDefaultAdSlots();
    
    // Initialize default ad providers
    this.initializeDefaultAdProviders();
    
    // Initialize sample ad campaigns
    this.initializeSampleAdCampaigns();
    
    console.log("Memory storage initialized successfully!");
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeDefaultAdSlots() {
      // Check if slots already exist
      const existingSlots = await this.db.select().from(adSlots).limit(1);
      if (existingSlots.length > 0) return;
      
      const defaultSlots: InsertAdSlot[] = [
      // Home page slots (6 slots)
      { name: "Home Hero Banner", position: "hero-banner", page: "home", isActive: true },
      { name: "Home Sidebar Top", position: "sidebar-top", page: "home", isActive: true },
      { name: "Home Sidebar Bottom", position: "sidebar-bottom", page: "home", isActive: true },
      { name: "Home Feature Banner", position: "feature-banner", page: "home", isActive: true },
      { name: "Home Footer Top", position: "footer-top", page: "home", isActive: true },
      { name: "Home Footer Bottom", position: "footer-bottom", page: "home", isActive: true },
      
      // PDF Tools page slots (6 slots matching frontend positions)
      { name: "PDF Tools Top Banner", position: "pdf-tools-top", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Header Secondary", position: "pdf-tools-header-secondary", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Popular Section", position: "pdf-tools-popular", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Middle Banner", position: "pdf-tools-middle", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Grid Section", position: "pdf-tools-grid", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Bottom Banner", position: "pdf-tools-bottom", page: "pdf-tools", isActive: true },
      
      // Image Tools page slots (6 slots matching frontend positions)
      { name: "Image Tools Top Banner", position: "image-tools-top", page: "image-tools", isActive: true },
      { name: "Image Tools Header Secondary", position: "image-tools-header-secondary", page: "image-tools", isActive: true },
      { name: "Image Tools Popular Section", position: "image-tools-popular", page: "image-tools", isActive: true },
      { name: "Image Tools Middle Banner", position: "image-tools-middle", page: "image-tools", isActive: true },
      { name: "Image Tools Grid Section", position: "image-tools-grid", page: "image-tools", isActive: true },
      { name: "Image Tools Bottom Banner", position: "image-tools-bottom", page: "image-tools", isActive: true },
      
      // Audio Tools page slots (6 slots matching frontend positions)
      { name: "Audio Tools Top Banner", position: "audio-tools-top", page: "audio-tools", isActive: true },
      { name: "Audio Tools Header Secondary", position: "audio-tools-header-secondary", page: "audio-tools", isActive: true },
      { name: "Audio Tools Popular Section", position: "audio-tools-popular", page: "audio-tools", isActive: true },
      { name: "Audio Tools Middle Banner", position: "audio-tools-middle", page: "audio-tools", isActive: true },
      { name: "Audio Tools Grid Section", position: "audio-tools-grid", page: "audio-tools", isActive: true },
      { name: "Audio Tools Bottom Banner", position: "audio-tools-bottom", page: "audio-tools", isActive: true },
      
      // Text Tools page slots (6 slots matching frontend positions)
      { name: "Text Tools Top Banner", position: "text-tools-top", page: "text-tools", isActive: true },
      { name: "Text Tools Header Secondary", position: "text-tools-header-secondary", page: "text-tools", isActive: true },
      { name: "Text Tools Popular Section", position: "text-tools-popular", page: "text-tools", isActive: true },
      { name: "Text Tools Middle Banner", position: "text-tools-middle", page: "text-tools", isActive: true },
      { name: "Text Tools Grid Section", position: "text-tools-grid", page: "text-tools", isActive: true },
      { name: "Text Tools Bottom Banner", position: "text-tools-bottom", page: "text-tools", isActive: true },
      
      // Productivity Tools page slots (6 slots matching frontend positions)
      { name: "Productivity Tools Top Banner", position: "productivity-tools-top", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Header Secondary", position: "productivity-tools-header-secondary", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Popular Section", position: "productivity-tools-popular", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Middle Banner", position: "productivity-tools-middle", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Grid Section", position: "productivity-tools-grid", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Bottom Banner", position: "productivity-tools-bottom", page: "productivity-tools", isActive: true },
      
      // Universal Tool Interface slots (3 slots matching frontend positions)
      { name: "Tool Top Banner", position: "tool-top", page: "universal-tool", isActive: true },
      { name: "Tool Bottom Banner", position: "tool-bottom", page: "universal-tool", isActive: true },
      { name: "Tool Side Banner", position: "tool-side", page: "universal-tool", isActive: true },
    ];

      await this.db.insert(adSlots).values(defaultSlots);
      console.log("Default ad slots created successfully");
    } catch (error) {
      console.error("Error creating default ad slots:", error);
    }
  }

  private async initializeDefaultAdProviders() {
    try {
      // Check if providers already exist
      const existingProviders = await this.db.select().from(adProviders).limit(1);
      if (existingProviders.length > 0) return;
      
      const defaultProviders: InsertAdProvider[] = [
      {
        name: "Google AdSense",
        type: "adsense",
        isActive: true,
        credentials: null, // Will be encrypted when added by admin
        settings: {
          publisherId: null,
          adClientId: null,
          autoAds: false
        }
      },
      {
        name: "Media.net",
        type: "medianet",
        isActive: false,
        credentials: null,
        settings: {
          customerId: null,
          siteId: null
        }
      },
      {
        name: "Custom HTML",
        type: "custom",
        isActive: true,
        credentials: null,
        settings: {
          allowCustomHTML: true,
          allowCustomJS: false
        }
      }
    ];

      await this.db.insert(adProviders).values(defaultProviders);
      console.log("Default ad providers created successfully");
    } catch (error) {
      console.error("Error creating default ad providers:", error);
    }
  }

  private async initializeSampleAdCampaigns() {
    // Create some sample campaigns after providers exist
    setTimeout(async () => {
      try {
        // Check if campaigns already exist
        const existingCampaigns = await this.db.select().from(adCampaigns).limit(1);
        if (existingCampaigns.length > 0) return;
        
        const providers = await this.db.select().from(adProviders);
        const customProvider = providers.find(p => p.type === 'custom');
        const adsenseProvider = providers.find(p => p.type === 'adsense');
        
        if (!customProvider) return;

        // Create comprehensive sample campaigns for all ad slot types
        const topBannerCampaign = await this.db.insert(adCampaigns).values({
          name: "Top Banner Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 90px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; color: white; font-family: Arial, sans-serif; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">🚀 Premium Tools</div>
              <div style="font-size: 12px;">Unlock advanced features with Pro</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/pro",
          dimensions: "728x90",
        }).returning();

        const headerSecondaryCampaign = await this.db.insert(adCampaigns).values({
          name: "Header Secondary Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 70px; background: linear-gradient(45deg, #4CAF50, #45a049); display: flex; align-items: center; justify-content: center; border-radius: 6px; color: white; font-family: Arial, sans-serif; margin: 8px 0;">
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 3px;">💡 Pro Tip</div>
              <div style="font-size: 11px;">Save time with batch processing</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/batch-processing",
          dimensions: "600x70",
        }).returning();

        const popularSectionCampaign = await this.createAdCampaign({
          name: "Popular Section Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 80px; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #333; font-family: Arial, sans-serif; margin: 8px 0;">
            <div style="text-align: center;">
              <div style="font-size: 17px; font-weight: bold; margin-bottom: 4px;">⭐ Most Popular Tools</div>
              <div style="font-size: 11px;">Join millions of users worldwide</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/popular",
          dimensions: "700x80",
        });

        const middleBannerCampaign = await this.createAdCampaign({
          name: "Middle Banner Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 100px; background: linear-gradient(45deg, #ff6b6b, #ffa726, #66bb6a, #42a5f5); background-size: 400% 400%; animation: gradientShift 8s ease infinite; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-family: Arial, sans-serif; margin: 10px 0;">
            <style>
              @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            </style>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 6px;">✨ ToolSuite Premium</div>
              <div style="font-size: 14px;">Unlimited downloads • Priority support • Advanced features</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/premium",
          dimensions: "800x100",
        });

        const gridSectionCampaign = await this.createAdCampaign({
          name: "Grid Section Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 85px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 10px; color: white; font-family: Arial, sans-serif; margin: 10px 0; border: 2px solid rgba(255,255,255,0.1);">
            <div style="text-align: center;">
              <div style="font-size: 17px; font-weight: bold; margin-bottom: 4px;">🛠️ All Tools Available</div>
              <div style="font-size: 12px;">Professional-grade online tools</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/all-tools",
          dimensions: "750x85",
        });

        const bottomBannerCampaign = await this.createAdCampaign({
          name: "Bottom Banner Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 80px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #888; font-family: Arial, sans-serif; margin: 10px 0;">
            <div style="text-align: center;">
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">📈 Advertise Here</div>
              <div style="font-size: 12px;">Reach thousands of users daily</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/advertise",
          dimensions: "728x80",
        });

        const toolTopCampaign = await this.createAdCampaign({
          name: "Tool Top Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 75px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; color: white; font-family: Arial, sans-serif; margin: 8px 0;">
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 3px;">⚡ Quick & Secure</div>
              <div style="font-size: 11px;">Your files are processed safely</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/security",
          dimensions: "650x75",
        });

        const toolBottomCampaign = await this.createAdCampaign({
          name: "Tool Bottom Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 85px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; color: white; font-family: Arial, sans-serif; margin: 10px 0;">
            <div style="text-align: center;">
              <div style="font-size: 17px; font-weight: bold; margin-bottom: 4px;">💼 Need More Tools?</div>
              <div style="font-size: 12px;">Explore our complete suite</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/explore",
          dimensions: "700x85",
        });

        const toolSideCampaign = await this.createAdCampaign({
          name: "Tool Side Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 60px; background: linear-gradient(45deg, #FA8072, #FFA07A); display: flex; align-items: center; justify-content: center; border-radius: 6px; color: white; font-family: Arial, sans-serif; margin: 6px 0;">
            <div style="text-align: center;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">📱 Mobile App</div>
              <div style="font-size: 10px;">Use tools on the go</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/mobile",
          dimensions: "500x60",
        });

        // Get all slots and create comprehensive assignments
        const slots = Array.from(this.adSlots.values());
        
        // Assign campaigns to all top banner slots (all category pages)
        const topBannerSlots = slots.filter(s => s.position.includes('-top'));
        for (const slot of topBannerSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: topBannerCampaign.id,
            assignedBy: "system",
            priority: 10,
            isActive: true,
          });
        }
        
        // Assign campaigns to header secondary slots
        const headerSecondarySlots = slots.filter(s => s.position.includes('-header-secondary'));
        for (const slot of headerSecondarySlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: headerSecondaryCampaign.id,
            assignedBy: "system",
            priority: 9,
            isActive: true,
          });
        }
        
        // Assign campaigns to popular section slots
        const popularSectionSlots = slots.filter(s => s.position.includes('-popular'));
        for (const slot of popularSectionSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: popularSectionCampaign.id,
            assignedBy: "system",
            priority: 8,
            isActive: true,
          });
        }
        
        // Assign campaigns to middle banner slots
        const middleBannerSlots = slots.filter(s => s.position.includes('-middle'));
        for (const slot of middleBannerSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: middleBannerCampaign.id,
            assignedBy: "system",
            priority: 7,
            isActive: true,
          });
        }
        
        // Assign campaigns to grid section slots
        const gridSectionSlots = slots.filter(s => s.position.includes('-grid'));
        for (const slot of gridSectionSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: gridSectionCampaign.id,
            assignedBy: "system",
            priority: 6,
            isActive: true,
          });
        }
        
        // Assign campaigns to bottom banner slots
        const bottomBannerSlots = slots.filter(s => s.position.includes('-bottom'));
        for (const slot of bottomBannerSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: bottomBannerCampaign.id,
            assignedBy: "system",
            priority: 5,
            isActive: true,
          });
        }
        
        // Assign campaigns to tool-specific slots
        const toolTopSlots = slots.filter(s => s.position === 'tool-top');
        for (const slot of toolTopSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: toolTopCampaign.id,
            assignedBy: "system",
            priority: 8,
            isActive: true,
          });
        }
        
        const toolBottomSlots = slots.filter(s => s.position === 'tool-bottom');
        for (const slot of toolBottomSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: toolBottomCampaign.id,
            assignedBy: "system",
            priority: 7,
            isActive: true,
          });
        }
        
        const toolSideSlots = slots.filter(s => s.position === 'tool-side');
        for (const slot of toolSideSlots) {
          await this.createSlotAssignment({
            slotId: slot.id,
            campaignId: toolSideCampaign.id,
            assignedBy: "system",
            priority: 6,
            isActive: true,
          });
        }
        
        // Assign campaigns to home page slots
        const heroBannerSlot = slots.find(s => s.position === 'hero-banner' && s.page === 'home');
        const featureBannerSlot = slots.find(s => s.position === 'feature-banner' && s.page === 'home');
        const footerTopSlot = slots.find(s => s.position === 'footer-top' && s.page === 'home');

        if (heroBannerSlot) {
          await this.createSlotAssignment({
            slotId: heroBannerSlot.id,
            campaignId: topBannerCampaign.id,
            assignedBy: "system",
            priority: 10,
            isActive: true,
          });
        }

        if (featureBannerSlot) {
          await this.createSlotAssignment({
            slotId: featureBannerSlot.id,
            campaignId: middleBannerCampaign.id,
            assignedBy: "system",
            priority: 9,
            isActive: true,
          });
        }

        if (footerTopSlot) {
          await this.createSlotAssignment({
            slotId: footerTopSlot.id,
            campaignId: bottomBannerCampaign.id,
            assignedBy: "system",
            priority: 8,
            isActive: true,
          });
        }

        console.log("Sample ad campaigns and assignments created successfully!");
      } catch (error) {
        console.error("Error creating sample ad campaigns:", error);
      }
    }, 1000); // Delay to ensure providers are created first
  }

  // User management methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const result = await this.db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      role: insertUser.role || "user"
    }).returning();
    
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async authenticateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : undefined;
  }

  // Tool usage tracking methods
  async createToolUsage(usage: InsertToolUsage): Promise<ToolUsage> {
    const result = await this.db.insert(toolUsage).values(usage).returning();
    return result[0];
  }

  async getToolUsage(filters?: { 
    toolName?: string; 
    category?: string; 
    dateFrom?: Date; 
    dateTo?: Date; 
  }): Promise<ToolUsage[]> {
    let query = this.db.select().from(toolUsage);
    
    // Apply filters would require more complex where conditions
    // For now, return all and filter in memory for compatibility
    const allUsages = await query;
    
    let filtered = allUsages;
    if (filters) {
      if (filters.toolName) {
        filtered = filtered.filter(u => u.toolName === filters.toolName);
      }
      if (filters.category) {
        filtered = filtered.filter(u => u.category === filters.category);
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(u => u.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(u => u.timestamp <= filters.dateTo!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Ad slot management methods
  async getAdSlots(): Promise<AdSlot[]> {
    return await this.db.select().from(adSlots);
  }

  async getActiveAdSlots(page: string): Promise<AdSlot[]> {
    return await this.db.select().from(adSlots)
      .where(and(eq(adSlots.page, page), eq(adSlots.isActive, true)));
  }

  async createAdSlot(adSlot: InsertAdSlot): Promise<AdSlot> {
    const result = await this.db.insert(adSlots).values(adSlot).returning();
    return result[0];
  }

  async updateAdSlot(id: string, updates: Partial<AdSlot>): Promise<AdSlot | undefined> {
    const result = await this.db.update(adSlots)
      .set(updates)
      .where(eq(adSlots.id, id))
      .returning();
    
    return result[0];
  }

  async deleteAdSlot(id: string): Promise<boolean> {
    const result = await this.db.delete(adSlots).where(eq(adSlots.id, id));
    return result.rowCount > 0;
  }

  // Ad provider methods
  async getAdProviders(): Promise<AdProvider[]> {
    return Array.from(this.adProviders.values());
  }

  async getActiveAdProviders(): Promise<AdProvider[]> {
    return Array.from(this.adProviders.values()).filter(provider => provider.isActive);
  }

  async createAdProvider(provider: InsertAdProvider): Promise<AdProvider> {
    const id = randomUUID();
    const newProvider: AdProvider = {
      id,
      ...provider,
      isActive: provider.isActive ?? true,
      credentials: provider.credentials || null,
      settings: provider.settings || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.adProviders.set(id, newProvider);
    return newProvider;
  }

  async updateAdProvider(id: string, updates: Partial<AdProvider>): Promise<AdProvider | undefined> {
    const provider = this.adProviders.get(id);
    if (!provider) return undefined;

    const updatedProvider: AdProvider = {
      ...provider,
      ...updates,
      updatedAt: new Date(),
    };

    this.adProviders.set(id, updatedProvider);
    return updatedProvider;
  }

  async deleteAdProvider(id: string): Promise<boolean> {
    return this.adProviders.delete(id);
  }

  // Ad campaign methods
  async getAdCampaigns(): Promise<AdCampaign[]> {
    return Array.from(this.adCampaigns.values());
  }

  async getActiveCampaigns(): Promise<AdCampaign[]> {
    const now = new Date();
    return Array.from(this.adCampaigns.values()).filter(campaign => 
      campaign.isActive && 
      (!campaign.startDate || campaign.startDate <= now) &&
      (!campaign.endDate || campaign.endDate >= now)
    );
  }

  async getCampaignsByProvider(providerId: string): Promise<AdCampaign[]> {
    return Array.from(this.adCampaigns.values()).filter(campaign => campaign.providerId === providerId);
  }

  async createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
    const id = randomUUID();
    const newCampaign: AdCampaign = {
      id,
      ...campaign,
      isActive: campaign.isActive ?? true,
      startDate: campaign.startDate || null,
      endDate: campaign.endDate || null,
      targetAudience: campaign.targetAudience || null,
      cpmRate: campaign.cpmRate || null,
      clickUrl: campaign.clickUrl || null,
      dimensions: campaign.dimensions || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.adCampaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateAdCampaign(id: string, updates: Partial<AdCampaign>): Promise<AdCampaign | undefined> {
    const campaign = this.adCampaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign: AdCampaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date(),
    };

    this.adCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteAdCampaign(id: string): Promise<boolean> {
    return this.adCampaigns.delete(id);
  }

  // Ad slot assignment methods
  async getSlotAssignments(): Promise<AdSlotAssignment[]> {
    return Array.from(this.adSlotAssignments.values());
  }

  async getAssignmentsBySlot(slotId: string): Promise<AdSlotAssignment[]> {
    return Array.from(this.adSlotAssignments.values())
      .filter(assignment => assignment.slotId === slotId && assignment.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  async createSlotAssignment(assignment: InsertAdSlotAssignment): Promise<AdSlotAssignment> {
    const id = randomUUID();
    const newAssignment: AdSlotAssignment = {
      id,
      ...assignment,
      isActive: assignment.isActive ?? true,
      priority: assignment.priority || 1,
      assignedAt: new Date(),
    };

    this.adSlotAssignments.set(id, newAssignment);
    return newAssignment;
  }

  async updateSlotAssignment(id: string, updates: Partial<AdSlotAssignment>): Promise<AdSlotAssignment | undefined> {
    const assignment = this.adSlotAssignments.get(id);
    if (!assignment) return undefined;

    const updatedAssignment: AdSlotAssignment = {
      ...assignment,
      ...updates,
    };

    this.adSlotAssignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteSlotAssignment(id: string): Promise<boolean> {
    return this.adSlotAssignments.delete(id);
  }

  // Ad analytics and views
  async recordAdView(view: InsertAdView): Promise<AdView> {
    const id = randomUUID();
    const newView: AdView = {
      id,
      ...view,
      campaignId: view.campaignId || null,
      userAgent: view.userAgent || null,
      timestamp: new Date(),
    };

    this.adViews.set(id, newView);

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0];
    await this.updateDailyAdAnalytics(view.slotId, view.campaignId || null, today, view.viewType, view.page);

    return newView;
  }

  private async updateDailyAdAnalytics(slotId: string, campaignId: string | null, date: string, viewType: string, page: string) {
    const analyticsKey = `${slotId}-${campaignId || 'null'}-${date}`;
    let analytics = Array.from(this.adAnalytics.values()).find(a => 
      a.slotId === slotId && a.campaignId === campaignId && a.date === date
    );

    if (!analytics) {
      const id = randomUUID();
      analytics = {
        id,
        slotId,
        campaignId,
        date,
        page,
        impressions: 0,
        clicks: 0,
        revenue: 0,
        uniqueViews: 0,
        createdAt: new Date(),
      };
      this.adAnalytics.set(id, analytics);
    }

    if (viewType === 'impression') {
      analytics.impressions++;
      analytics.uniqueViews++;
    } else if (viewType === 'click') {
      analytics.clicks++;
    }

    this.adAnalytics.set(analytics.id, analytics);
  }

  async getAdAnalytics(filters?: { slotId?: string; campaignId?: string; dateFrom?: string; dateTo?: string }): Promise<AdAnalytics[]> {
    let analytics = Array.from(this.adAnalytics.values());

    if (filters) {
      if (filters.slotId) {
        analytics = analytics.filter(a => a.slotId === filters.slotId);
      }
      if (filters.campaignId) {
        analytics = analytics.filter(a => a.campaignId === filters.campaignId);
      }
      if (filters.dateFrom) {
        analytics = analytics.filter(a => a.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        analytics = analytics.filter(a => a.date <= filters.dateTo!);
      }
    }

    return analytics.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getDailyAdStats(date: string): Promise<AdAnalytics[]> {
    return Array.from(this.adAnalytics.values()).filter(a => a.date === date);
  }

  async getSlotWithActiveAd(slotId: string): Promise<{ slot: AdSlot; campaign?: AdCampaign } | null> {
    // First try to find by ID
    let slot = this.adSlots.get(slotId);
    
    // If not found by ID, try to find by position-page combination
    if (!slot) {
      const slots = Array.from(this.adSlots.values());
      slot = slots.find(slotData => 
        slotData.position === slotId || 
        (slotData.position === slotId.split('-')[0] && slotData.page === slotId.split('-')[1])
      );
    }
    
    if (!slot || !slot.isActive) {
      console.log(`Slot not found or inactive: ${slotId}. Available slots:`, 
        Array.from(this.adSlots.values()).map(s => ({ id: s.id, position: s.position, page: s.page })));
      return null;
    }

    const assignments = await this.getAssignmentsBySlot(slot.id);
    if (assignments.length === 0) return { slot };

    const topAssignment = assignments[0];
    const campaign = this.adCampaigns.get(topAssignment.campaignId);
    
    if (campaign && campaign.isActive) {
      const now = new Date();
      const isActiveCampaign = (!campaign.startDate || campaign.startDate <= now) && 
                               (!campaign.endDate || campaign.endDate >= now);
      
      if (isActiveCampaign) {
        return { slot, campaign };
      }
    }

    return { slot };
  }

  // Analytics methods
  async getAnalytics(): Promise<{
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
    const usages = Array.from(this.toolUsages.values());
    
    if (usages.length === 0) {
      return {
        totalUsage: 0,
        mostPopular: "No data",
        popularUsage: 0,
        successRate: "0%",
        toolStats: []
      };
    }

    // Calculate total usage
    const totalUsage = usages.length;

    // Calculate success rate
    const successfulUsages = usages.filter(usage => usage.success).length;
    const successRate = totalUsage > 0 ? ((successfulUsages / totalUsage) * 100).toFixed(1) + "%" : "0%";

    // Calculate tool statistics
    const toolStatsMap = new Map<string, {
      name: string;
      category: string;
      usageCount: number;
      successCount: number;
      totalProcessingTime: number;
    }>();

    usages.forEach(usage => {
      const key = usage.toolName;
      const existing = toolStatsMap.get(key) || {
        name: usage.toolName,
        category: usage.category,
        usageCount: 0,
        successCount: 0,
        totalProcessingTime: 0
      };

      existing.usageCount++;
      if (usage.success) existing.successCount++;
      if (usage.processingTime) existing.totalProcessingTime += usage.processingTime;

      toolStatsMap.set(key, existing);
    });

    const toolStats = Array.from(toolStatsMap.values())
      .map(stat => ({
        name: stat.name,
        category: stat.category,
        usageCount: stat.usageCount,
        successRate: stat.usageCount > 0 ? Math.round((stat.successCount / stat.usageCount) * 100) : 0,
        avgProcessingTime: stat.usageCount > 0 ? Math.round(stat.totalProcessingTime / stat.usageCount) : 0
      }))
      .sort((a, b) => b.usageCount - a.usageCount);

    // Find most popular tool
    const mostPopularTool = toolStats[0];
    const mostPopular = mostPopularTool ? mostPopularTool.name : "No data";
    const popularUsage = mostPopularTool ? mostPopularTool.usageCount : 0;

    return {
      totalUsage,
      mostPopular,
      popularUsage,
      successRate,
      toolStats
    };
  }

  // SEO utilities
  async generateSitemap(): Promise<string> {
    const baseUrl = "https://toolsuitepro.com";
    const currentDate = new Date().toISOString().split('T')[0];
    
    const pages = [
      { url: "", priority: "1.0", changefreq: "weekly" },
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

export const storage = new MemStorage();
