import { 
  type User, type InsertUser, 
  type ToolUsage, type InsertToolUsage, 
  type AdSlot, type InsertAdSlot,
  type AdProvider, type InsertAdProvider,
  type AdCampaign, type InsertAdCampaign,
  type AdSlotAssignment, type InsertAdSlotAssignment,
  type AdAnalytics, type InsertAdAnalytics,
  type AdView, type InsertAdView,
  type Analytics 
} from "@shared/schema";
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
  private users: Map<string, User>;
  private toolUsages: Map<string, ToolUsage>;
  private adSlots: Map<string, AdSlot>;
  private adProviders: Map<string, AdProvider>;
  private adCampaigns: Map<string, AdCampaign>;
  private adSlotAssignments: Map<string, AdSlotAssignment>;
  private adAnalytics: Map<string, AdAnalytics>;
  private adViews: Map<string, AdView>;

  constructor() {
    this.users = new Map();
    this.toolUsages = new Map();
    this.adSlots = new Map();
    this.adProviders = new Map();
    this.adCampaigns = new Map();
    this.adSlotAssignments = new Map();
    this.adAnalytics = new Map();
    this.adViews = new Map();
    
    // Initialize with admin user
    this.initializeAdminUser();
    
    // Initialize default ad slots and providers
    this.initializeDefaultAdSlots();
    this.initializeDefaultAdProviders();
    this.initializeSampleAdCampaigns();
  }

  private async initializeAdminUser() {
    const adminId = randomUUID();
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminUser: User = {
      id: adminId,
      username: "admin",
      email: "admin@toolsuitepro.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(adminId, adminUser);
  }

  private async initializeDefaultAdSlots() {
    const defaultSlots: InsertAdSlot[] = [
      // Home page slots (6 slots)
      { name: "Home Hero Banner", position: "hero-banner", page: "home", isActive: true },
      { name: "Home Sidebar Top", position: "sidebar-top", page: "home", isActive: true },
      { name: "Home Sidebar Bottom", position: "sidebar-bottom", page: "home", isActive: true },
      { name: "Home Feature Banner", position: "feature-banner", page: "home", isActive: true },
      { name: "Home Footer Top", position: "footer-top", page: "home", isActive: true },
      { name: "Home Footer Bottom", position: "footer-bottom", page: "home", isActive: true },
      
      // PDF Tools page slots (6 slots)
      { name: "PDF Tools Header", position: "header-banner", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Sidebar Top", position: "sidebar-top", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Sidebar Bottom", position: "sidebar-bottom", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Grid Top", position: "grid-top", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Grid Bottom", position: "grid-bottom", page: "pdf-tools", isActive: true },
      { name: "PDF Tools Footer", position: "footer-banner", page: "pdf-tools", isActive: true },
      
      // Image Tools page slots (6 slots)
      { name: "Image Tools Header", position: "header-banner", page: "image-tools", isActive: true },
      { name: "Image Tools Sidebar Top", position: "sidebar-top", page: "image-tools", isActive: true },
      { name: "Image Tools Sidebar Bottom", position: "sidebar-bottom", page: "image-tools", isActive: true },
      { name: "Image Tools Grid Top", position: "grid-top", page: "image-tools", isActive: true },
      { name: "Image Tools Grid Bottom", position: "grid-bottom", page: "image-tools", isActive: true },
      { name: "Image Tools Footer", position: "footer-banner", page: "image-tools", isActive: true },
      
      // Audio Tools page slots (6 slots)
      { name: "Audio Tools Header", position: "header-banner", page: "audio-tools", isActive: true },
      { name: "Audio Tools Sidebar Top", position: "sidebar-top", page: "audio-tools", isActive: true },
      { name: "Audio Tools Sidebar Bottom", position: "sidebar-bottom", page: "audio-tools", isActive: true },
      { name: "Audio Tools Grid Top", position: "grid-top", page: "audio-tools", isActive: true },
      { name: "Audio Tools Grid Bottom", position: "grid-bottom", page: "audio-tools", isActive: true },
      { name: "Audio Tools Footer", position: "footer-banner", page: "audio-tools", isActive: true },
      
      // Text Tools page slots (6 slots)
      { name: "Text Tools Header", position: "header-banner", page: "text-tools", isActive: true },
      { name: "Text Tools Sidebar Top", position: "sidebar-top", page: "text-tools", isActive: true },
      { name: "Text Tools Sidebar Bottom", position: "sidebar-bottom", page: "text-tools", isActive: true },
      { name: "Text Tools Grid Top", position: "grid-top", page: "text-tools", isActive: true },
      { name: "Text Tools Grid Bottom", position: "grid-bottom", page: "text-tools", isActive: true },
      { name: "Text Tools Footer", position: "footer-banner", page: "text-tools", isActive: true },
      
      // Productivity Tools page slots (6 slots)
      { name: "Productivity Tools Header", position: "header-banner", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Sidebar Top", position: "sidebar-top", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Sidebar Bottom", position: "sidebar-bottom", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Grid Top", position: "grid-top", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Grid Bottom", position: "grid-bottom", page: "productivity-tools", isActive: true },
      { name: "Productivity Tools Footer", position: "footer-banner", page: "productivity-tools", isActive: true },
      
      // Individual tool page slots (2-3 slots per tool)
      { name: "Tool Page Top Banner", position: "tool-top", page: "tool-page", isActive: true },
      { name: "Tool Page Sidebar", position: "tool-sidebar", page: "tool-page", isActive: true },
      { name: "Tool Page Bottom Banner", position: "tool-bottom", page: "tool-page", isActive: true },
    ];

    for (const slot of defaultSlots) {
      await this.createAdSlot(slot);
    }
  }

  private async initializeDefaultAdProviders() {
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

    for (const provider of defaultProviders) {
      await this.createAdProvider(provider);
    }
  }

  private async initializeSampleAdCampaigns() {
    // Create some sample campaigns after providers exist
    setTimeout(async () => {
      try {
        const providers = Array.from(this.adProviders.values());
        const customProvider = providers.find(p => p.type === 'custom');
        const adsenseProvider = providers.find(p => p.type === 'adsense');
        
        if (!customProvider) return;

        // Create sample campaigns
        const headerCampaign = await this.createAdCampaign({
          name: "Header Banner Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 90px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; color: white; font-family: Arial, sans-serif; margin: 10px 0;">
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">🚀 Premium Tools</div>
              <div style="font-size: 12px;">Unlock advanced features with Pro</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/pro",
          dimensions: "728x90",
        });

        const featureCampaign = await this.createAdCampaign({
          name: "Feature Banner Campaign",
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

        const footerCampaign = await this.createAdCampaign({
          name: "Footer Banner Campaign",
          providerId: customProvider.id,
          adType: "banner",
          adCode: `<div style="width: 100%; height: 80px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #888; font-family: Arial, sans-serif; margin: 10px 0;">
            <div style="text-align: center;">
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Advertise Here</div>
              <div style="font-size: 12px;">Reach thousands of users daily</div>
            </div>
          </div>`,
          isActive: true,
          clickUrl: "https://toolsuite.com/advertise",
          dimensions: "728x80",
        });

        // Get slots and assign campaigns
        const slots = Array.from(this.adSlots.values());
        const heroBannerSlot = slots.find(s => s.position === 'hero-banner' && s.page === 'home');
        const featureBannerSlot = slots.find(s => s.position === 'feature-banner' && s.page === 'home');
        const footerTopSlot = slots.find(s => s.position === 'footer-top' && s.page === 'home');

        if (heroBannerSlot) {
          await this.createSlotAssignment({
            slotId: heroBannerSlot.id,
            campaignId: headerCampaign.id,
            assignedBy: "system",
            priority: 10,
            isActive: true,
          });
        }

        if (featureBannerSlot) {
          await this.createSlotAssignment({
            slotId: featureBannerSlot.id,
            campaignId: featureCampaign.id,
            assignedBy: "system",
            priority: 9,
            isActive: true,
          });
        }

        if (footerTopSlot) {
          await this.createSlotAssignment({
            slotId: footerTopSlot.id,
            campaignId: footerCampaign.id,
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
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const user: User = {
      id,
      ...insertUser,
      password: hashedPassword,
      role: insertUser.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async authenticateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : undefined;
  }

  // Tool usage tracking methods
  async createToolUsage(usage: InsertToolUsage): Promise<ToolUsage> {
    const id = randomUUID();
    const toolUsage: ToolUsage = {
      id,
      ...usage,
      userId: usage.userId || null,
      sessionId: usage.sessionId || null,
      processingTime: usage.processingTime || null,
      fileSize: usage.fileSize || null,
      timestamp: new Date(),
    };

    this.toolUsages.set(id, toolUsage);
    return toolUsage;
  }

  async getToolUsage(filters?: { 
    toolName?: string; 
    category?: string; 
    dateFrom?: Date; 
    dateTo?: Date; 
  }): Promise<ToolUsage[]> {
    let usages = Array.from(this.toolUsages.values());

    if (filters) {
      if (filters.toolName) {
        usages = usages.filter(usage => usage.toolName === filters.toolName);
      }
      if (filters.category) {
        usages = usages.filter(usage => usage.category === filters.category);
      }
      if (filters.dateFrom) {
        usages = usages.filter(usage => usage.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        usages = usages.filter(usage => usage.timestamp <= filters.dateTo!);
      }
    }

    return usages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Ad slot management methods
  async getAdSlots(): Promise<AdSlot[]> {
    return Array.from(this.adSlots.values());
  }

  async getActiveAdSlots(page: string): Promise<AdSlot[]> {
    return Array.from(this.adSlots.values())
      .filter(slot => slot.page === page && slot.isActive);
  }

  async createAdSlot(adSlot: InsertAdSlot): Promise<AdSlot> {
    const id = randomUUID();
    const newAdSlot: AdSlot = {
      id,
      ...adSlot,
      isActive: adSlot.isActive ?? true,
      adProvider: adSlot.adProvider || null,
      adCode: adSlot.adCode || null,
      settings: adSlot.settings || null,
      createdAt: new Date(),
    };

    this.adSlots.set(id, newAdSlot);
    return newAdSlot;
  }

  async updateAdSlot(id: string, updates: Partial<AdSlot>): Promise<AdSlot | undefined> {
    const adSlot = this.adSlots.get(id);
    if (!adSlot) return undefined;

    const updatedAdSlot: AdSlot = {
      ...adSlot,
      ...updates,
    };

    this.adSlots.set(id, updatedAdSlot);
    return updatedAdSlot;
  }

  async deleteAdSlot(id: string): Promise<boolean> {
    return this.adSlots.delete(id);
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
