import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

export const adsRouter = Router();

// Get ad slot with active campaign
adsRouter.get('/slot/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    const slotWithAd = await storage.getSlotWithActiveAd(slotId);
    
    if (!slotWithAd) {
      return res.json({ slot: null, campaign: null });
    }
    
    res.json(slotWithAd);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    res.status(500).json({ error: 'Failed to fetch ad slot' });
  }
});

// Get all ad slots
adsRouter.get('/slots', async (req, res) => {
  try {
    const slots = await storage.getAdSlots();
    res.json(slots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// Create ad slot
adsRouter.post('/slots', async (req, res) => {
  try {
    const slotData = req.body;
    const slot = await storage.createAdSlot(slotData);
    res.status(201).json(slot);
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// Update ad slot
adsRouter.patch('/slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const slot = await storage.updateAdSlot(id, updates);
    
    if (!slot) {
      return res.status(404).json({ error: 'Ad slot not found' });
    }
    
    res.json(slot);
  } catch (error) {
    console.error('Error updating ad slot:', error);
    res.status(500).json({ error: 'Failed to update ad slot' });
  }
});

// Delete ad slot
adsRouter.delete('/slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteAdSlot(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Ad slot not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    res.status(500).json({ error: 'Failed to delete ad slot' });
  }
});

// Get ad providers
adsRouter.get('/providers', async (req, res) => {
  try {
    const providers = await storage.getAdProviders();
    res.json(providers);
  } catch (error) {
    console.error('Error fetching ad providers:', error);
    res.status(500).json({ error: 'Failed to fetch ad providers' });
  }
});

// Create ad provider
adsRouter.post('/providers', async (req, res) => {
  try {
    const providerData = req.body;
    const provider = await storage.createAdProvider(providerData);
    res.status(201).json(provider);
  } catch (error) {
    console.error('Error creating ad provider:', error);
    res.status(500).json({ error: 'Failed to create ad provider' });
  }
});

// Get ad campaigns
adsRouter.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await storage.getAdCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching ad campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch ad campaigns' });
  }
});

// Create ad campaign
adsRouter.post('/campaigns', async (req, res) => {
  try {
    const campaignData = req.body;
    const campaign = await storage.createAdCampaign(campaignData);
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating ad campaign:', error);
    res.status(500).json({ error: 'Failed to create ad campaign' });
  }
});

// Assign campaign to slot
adsRouter.post('/assign', async (req, res) => {
  try {
    const assignmentData = req.body;
    const assignment = await storage.assignCampaignToSlot(assignmentData);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning campaign to slot:', error);
    res.status(500).json({ error: 'Failed to assign campaign to slot' });
  }
});

// Track ad view
adsRouter.post('/track/view', async (req, res) => {
  try {
    const viewData = {
      ...req.body,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };
    
    const view = await storage.recordAdView(viewData);
    res.status(201).json(view);
  } catch (error) {
    console.error('Error tracking ad view:', error);
    res.status(500).json({ error: 'Failed to track ad view' });
  }
});

// Get ad analytics
adsRouter.get('/analytics', async (req, res) => {
  try {
    const { slotId, campaignId, dateFrom, dateTo } = req.query;
    const analytics = await storage.getAdAnalytics({
      slotId: slotId as string,
      campaignId: campaignId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching ad analytics:', error);
    res.status(500).json({ error: 'Failed to fetch ad analytics' });
  }
});

// Get daily ad stats
adsRouter.get('/analytics/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const stats = await storage.getDailyAdStats(date);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching daily ad stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily ad stats' });
  }
});