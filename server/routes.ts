import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertToolUsageSchema, 
  insertAdSlotSchema,
  insertAdProviderSchema,
  insertAdCampaignSchema,
  insertAdSlotAssignmentSchema,
  insertAdViewSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser({ username, email, password });
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });

      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    // In a real app, you would invalidate the session here
    res.json({ message: "Logged out successfully" });
  });

  app.patch("/api/auth/profile", async (req, res) => {
    try {
      // In a real app, you would get user ID from session/JWT
      const updateSchema = z.object({
        username: z.string().optional(),
        email: z.string().email().optional(),
      });

      const updates = updateSchema.parse(req.body);
      
      // For demo purposes, we'll assume user ID is passed in header
      const userId = req.headers['user-id'] as string;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password: _, ...userResponse } = updatedUser;
      
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Analytics routes
  app.post("/api/analytics/tool-usage", async (req, res) => {
    try {
      const usage = insertToolUsageSchema.parse(req.body);
      const savedUsage = await storage.createToolUsage(usage);
      res.json(savedUsage);
    } catch (error) {
      console.error("Tool usage tracking error:", error);
      res.status(400).json({ message: "Invalid usage data" });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      // Check admin authorization (in real app, verify JWT/session)
      const userRole = req.headers['user-role'] as string;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Ad management routes
  app.get("/api/admin/ad-slots", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const adSlots = await storage.getAdSlots();
      res.json(adSlots);
    } catch (error) {
      console.error("Ad slots fetch error:", error);
      res.status(500).json({ message: "Failed to fetch ad slots" });
    }
  });

  app.post("/api/admin/ad-slots", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const adSlot = insertAdSlotSchema.parse(req.body);
      const savedAdSlot = await storage.createAdSlot(adSlot);
      res.json(savedAdSlot);
    } catch (error) {
      console.error("Ad slot creation error:", error);
      res.status(400).json({ message: "Invalid ad slot data" });
    }
  });

  app.patch("/api/admin/ad-slots/:id", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const updates = req.body;
      
      const updatedAdSlot = await storage.updateAdSlot(id, updates);
      if (!updatedAdSlot) {
        return res.status(404).json({ message: "Ad slot not found" });
      }

      res.json(updatedAdSlot);
    } catch (error) {
      console.error("Ad slot update error:", error);
      res.status(400).json({ message: "Invalid ad slot update data" });
    }
  });

  app.delete("/api/admin/ad-slots/:id", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteAdSlot(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Ad slot not found" });
      }

      res.json({ message: "Ad slot deleted successfully" });
    } catch (error) {
      console.error("Ad slot deletion error:", error);
      res.status(500).json({ message: "Failed to delete ad slot" });
    }
  });

  // Public API for getting active ad slots (for frontend)
  app.get("/api/ad-slots/:page", async (req, res) => {
    try {
      const { page } = req.params;
      const activeAdSlots = await storage.getActiveAdSlots(page);
      res.json(activeAdSlots);
    } catch (error) {
      console.error("Active ad slots fetch error:", error);
      res.status(500).json({ message: "Failed to fetch ad slots" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // SEO endpoints
  app.get("/api/seo/sitemap.xml", async (req, res) => {
    try {
      const sitemap = await storage.generateSitemap();
      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).json({ message: "Failed to generate sitemap" });
    }
  });

  app.get("/api/seo/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${req.protocol}://${req.get('host')}/api/seo/sitemap.xml`;
    
    res.set('Content-Type', 'text/plain');
    res.send(robots);
  });

  // ===================
  // AD MANAGEMENT ROUTES
  // ===================

  // Ad Provider Routes
  app.get("/api/admin/ad-providers", async (req, res) => {
    try {
      const providers = await storage.getAdProviders();
      res.json(providers);
    } catch (error) {
      console.error("Get ad providers error:", error);
      res.status(500).json({ message: "Failed to fetch ad providers" });
    }
  });

  app.post("/api/admin/ad-providers", async (req, res) => {
    try {
      const provider = insertAdProviderSchema.parse(req.body);
      const newProvider = await storage.createAdProvider(provider);
      res.json(newProvider);
    } catch (error) {
      console.error("Create ad provider error:", error);
      res.status(400).json({ message: "Invalid ad provider data" });
    }
  });

  app.put("/api/admin/ad-providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedProvider = await storage.updateAdProvider(id, updates);
      
      if (!updatedProvider) {
        return res.status(404).json({ message: "Ad provider not found" });
      }
      
      res.json(updatedProvider);
    } catch (error) {
      console.error("Update ad provider error:", error);
      res.status(400).json({ message: "Failed to update ad provider" });
    }
  });

  app.delete("/api/admin/ad-providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdProvider(id);
      
      if (!success) {
        return res.status(404).json({ message: "Ad provider not found" });
      }
      
      res.json({ message: "Ad provider deleted successfully" });
    } catch (error) {
      console.error("Delete ad provider error:", error);
      res.status(500).json({ message: "Failed to delete ad provider" });
    }
  });

  // Ad Campaign Routes
  app.get("/api/admin/ad-campaigns", async (req, res) => {
    try {
      const { providerId } = req.query;
      let campaigns;
      
      if (providerId) {
        campaigns = await storage.getCampaignsByProvider(providerId as string);
      } else {
        campaigns = await storage.getAdCampaigns();
      }
      
      res.json(campaigns);
    } catch (error) {
      console.error("Get ad campaigns error:", error);
      res.status(500).json({ message: "Failed to fetch ad campaigns" });
    }
  });

  app.post("/api/admin/ad-campaigns", async (req, res) => {
    try {
      const campaign = insertAdCampaignSchema.parse(req.body);
      const newCampaign = await storage.createAdCampaign(campaign);
      res.json(newCampaign);
    } catch (error) {
      console.error("Create ad campaign error:", error);
      res.status(400).json({ message: "Invalid ad campaign data" });
    }
  });

  app.put("/api/admin/ad-campaigns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedCampaign = await storage.updateAdCampaign(id, updates);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Ad campaign not found" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Update ad campaign error:", error);
      res.status(400).json({ message: "Failed to update ad campaign" });
    }
  });

  app.delete("/api/admin/ad-campaigns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdCampaign(id);
      
      if (!success) {
        return res.status(404).json({ message: "Ad campaign not found" });
      }
      
      res.json({ message: "Ad campaign deleted successfully" });
    } catch (error) {
      console.error("Delete ad campaign error:", error);
      res.status(500).json({ message: "Failed to delete ad campaign" });
    }
  });

  // Ad Slot Assignment Routes
  app.get("/api/admin/slot-assignments", async (req, res) => {
    try {
      const { slotId } = req.query;
      let assignments;
      
      if (slotId) {
        assignments = await storage.getAssignmentsBySlot(slotId as string);
      } else {
        assignments = await storage.getSlotAssignments();
      }
      
      res.json(assignments);
    } catch (error) {
      console.error("Get slot assignments error:", error);
      res.status(500).json({ message: "Failed to fetch slot assignments" });
    }
  });

  app.post("/api/admin/slot-assignments", async (req, res) => {
    try {
      const assignment = insertAdSlotAssignmentSchema.parse(req.body);
      const newAssignment = await storage.createSlotAssignment(assignment);
      res.json(newAssignment);
    } catch (error) {
      console.error("Create slot assignment error:", error);
      res.status(400).json({ message: "Invalid slot assignment data" });
    }
  });

  app.put("/api/admin/slot-assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedAssignment = await storage.updateSlotAssignment(id, updates);
      
      if (!updatedAssignment) {
        return res.status(404).json({ message: "Slot assignment not found" });
      }
      
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Update slot assignment error:", error);
      res.status(400).json({ message: "Failed to update slot assignment" });
    }
  });

  app.delete("/api/admin/slot-assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSlotAssignment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Slot assignment not found" });
      }
      
      res.json({ message: "Slot assignment deleted successfully" });
    } catch (error) {
      console.error("Delete slot assignment error:", error);
      res.status(500).json({ message: "Failed to delete slot assignment" });
    }
  });

  // Public Ad Serving Routes
  app.get("/api/ads/slot/:slotId", async (req, res) => {
    try {
      const { slotId } = req.params;
      const slotWithAd = await storage.getSlotWithActiveAd(slotId);
      
      if (!slotWithAd) {
        return res.status(404).json({ message: "Ad slot not found" });
      }
      
      res.json(slotWithAd);
    } catch (error) {
      console.error("Get slot ad error:", error);
      res.status(500).json({ message: "Failed to fetch ad for slot" });
    }
  });

  app.get("/api/ads/page/:page", async (req, res) => {
    try {
      const { page } = req.params;
      const slots = await storage.getActiveAdSlots(page);
      
      // Get campaigns for each slot
      const slotsWithAds = await Promise.all(
        slots.map(async (slot) => {
          const slotWithAd = await storage.getSlotWithActiveAd(slot.id);
          return slotWithAd;
        })
      );
      
      res.json(slotsWithAds.filter(Boolean));
    } catch (error) {
      console.error("Get page ads error:", error);
      res.status(500).json({ message: "Failed to fetch ads for page" });
    }
  });

  // Ad Analytics Routes
  app.post("/api/ads/view", async (req, res) => {
    try {
      const view = insertAdViewSchema.parse(req.body);
      const newView = await storage.recordAdView(view);
      res.json(newView);
    } catch (error) {
      console.error("Record ad view error:", error);
      res.status(400).json({ message: "Invalid ad view data" });
    }
  });

  app.get("/api/admin/ad-analytics", async (req, res) => {
    try {
      const { slotId, campaignId, dateFrom, dateTo } = req.query;
      const filters = {
        slotId: slotId as string,
        campaignId: campaignId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      };
      
      const analytics = await storage.getAdAnalytics(filters);
      res.json(analytics);
    } catch (error) {
      console.error("Get ad analytics error:", error);
      res.status(500).json({ message: "Failed to fetch ad analytics" });
    }
  });

  app.get("/api/admin/ad-analytics/daily/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const dailyStats = await storage.getDailyAdStats(date);
      res.json(dailyStats);
    } catch (error) {
      console.error("Get daily ad stats error:", error);
      res.status(500).json({ message: "Failed to fetch daily ad stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
