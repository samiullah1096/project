-- ToolSuite Pro - Supabase Database Schema
-- This schema supports the comprehensive ad management system and tool usage tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tool usage tracking table
CREATE TABLE IF NOT EXISTS public.tool_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  success BOOLEAN DEFAULT true,
  processing_time INTEGER, -- in milliseconds
  file_size BIGINT, -- in bytes
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_name ON public.tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_usage_category ON public.tool_usage(category);
CREATE INDEX IF NOT EXISTS idx_tool_usage_timestamp ON public.tool_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON public.tool_usage(user_id);

-- Enable RLS for tool_usage
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for tool_usage
CREATE POLICY "Tool usage is viewable by everyone." ON public.tool_usage
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert tool usage." ON public.tool_usage
  FOR INSERT WITH CHECK (true);

-- Ad providers table
CREATE TABLE IF NOT EXISTS public.ad_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'adsterra', 'adsense', 'medianet', etc.
  credentials TEXT NOT NULL, -- JSON string with credentials
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create unique index on provider name
CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_providers_name ON public.ad_providers(name);

-- Enable RLS for ad_providers
ALTER TABLE public.ad_providers ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_providers (admin only)
CREATE POLICY "Ad providers viewable by admins." ON public.ad_providers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Ad providers manageable by admins." ON public.ad_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ad campaigns table
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_id UUID REFERENCES public.ad_providers(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL, -- 'banner', 'popup', 'native', etc.
  ad_code TEXT NOT NULL, -- JSON string with HTML/JS/CSS
  dimensions TEXT NOT NULL, -- '728x90', '300x250', etc.
  cpm_rate NUMERIC(10,4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for ad_campaigns
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_provider_id ON public.ad_campaigns(provider_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_is_active ON public.ad_campaigns(is_active);

-- Enable RLS for ad_campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_campaigns
CREATE POLICY "Ad campaigns viewable by admins." ON public.ad_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Ad campaigns manageable by admins." ON public.ad_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ad slots table
CREATE TABLE IF NOT EXISTS public.ad_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- 'header', 'sidebar', 'footer', etc.
  page TEXT NOT NULL, -- 'home', 'pdf-tools', 'all', etc.
  dimensions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for ad_slots
CREATE INDEX IF NOT EXISTS idx_ad_slots_page ON public.ad_slots(page);
CREATE INDEX IF NOT EXISTS idx_ad_slots_position ON public.ad_slots(position);
CREATE INDEX IF NOT EXISTS idx_ad_slots_is_active ON public.ad_slots(is_active);

-- Enable RLS for ad_slots
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_slots
CREATE POLICY "Ad slots viewable by everyone." ON public.ad_slots
  FOR SELECT USING (true);

CREATE POLICY "Ad slots manageable by admins." ON public.ad_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ad slot assignments table (many-to-many between slots and campaigns)
CREATE TABLE IF NOT EXISTS public.ad_slot_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_id UUID REFERENCES public.ad_slots(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for ad_slot_assignments
CREATE INDEX IF NOT EXISTS idx_ad_slot_assignments_slot_id ON public.ad_slot_assignments(slot_id);
CREATE INDEX IF NOT EXISTS idx_ad_slot_assignments_campaign_id ON public.ad_slot_assignments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_slot_assignments_priority ON public.ad_slot_assignments(priority);

-- Create unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_slot_campaign ON public.ad_slot_assignments(slot_id, campaign_id);

-- Enable RLS for ad_slot_assignments
ALTER TABLE public.ad_slot_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_slot_assignments
CREATE POLICY "Ad slot assignments viewable by everyone." ON public.ad_slot_assignments
  FOR SELECT USING (true);

CREATE POLICY "Ad slot assignments manageable by admins." ON public.ad_slot_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ad views tracking table
CREATE TABLE IF NOT EXISTS public.ad_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_id UUID REFERENCES public.ad_slots(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for ad_views
CREATE INDEX IF NOT EXISTS idx_ad_views_slot_id ON public.ad_views(slot_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_campaign_id ON public.ad_views(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_timestamp ON public.ad_views(timestamp);

-- Enable RLS for ad_views
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_views
CREATE POLICY "Ad views insertable by everyone." ON public.ad_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Ad views viewable by admins." ON public.ad_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ad analytics table (aggregated daily stats)
CREATE TABLE IF NOT EXISTS public.ad_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_id UUID REFERENCES public.ad_slots(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  revenue NUMERIC(12,4) DEFAULT 0,
  cpm NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for ad_analytics
CREATE INDEX IF NOT EXISTS idx_ad_analytics_date ON public.ad_analytics(date);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_slot_id ON public.ad_analytics(slot_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_campaign_id ON public.ad_analytics(campaign_id);

-- Create unique constraint for daily stats
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_stats ON public.ad_analytics(slot_id, campaign_id, date);

-- Enable RLS for ad_analytics
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_analytics
CREATE POLICY "Ad analytics viewable by admins." ON public.ad_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default ad slots
INSERT INTO public.ad_slots (id, name, position, page, dimensions, is_active) VALUES
  ('hero-banner', 'Hero Banner', 'header', 'home', '728x90', true),
  ('sidebar-top', 'Sidebar Top', 'sidebar', 'all', '300x250', true),
  ('content-middle', 'Content Middle', 'content', 'all', '728x90', true),
  ('footer-top', 'Footer Top', 'footer', 'all', '728x90', true),
  ('feature-banner', 'Feature Banner', 'feature', 'home', '468x60', true),
  ('bottom-banner', 'Bottom Banner', 'bottom', 'all', '728x90', true)
ON CONFLICT (id) DO NOTHING;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_providers_updated_at BEFORE UPDATE ON public.ad_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_slots_updated_at BEFORE UPDATE ON public.ad_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_slot_assignments_updated_at BEFORE UPDATE ON public.ad_slot_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();