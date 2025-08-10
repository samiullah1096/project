import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function forceMigration() {
  try {
    // Create all required tables for ad management system
    
    // Create ad_providers table
    await sql`
      CREATE TABLE IF NOT EXISTS ad_providers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        credentials TEXT,
        settings JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create ad_campaigns table  
    await sql`
      CREATE TABLE IF NOT EXISTS ad_campaigns (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        provider_id VARCHAR NOT NULL,
        ad_type TEXT NOT NULL,
        ad_code TEXT NOT NULL,
        dimensions TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        target_audience JSONB,
        cpm_rate INTEGER,
        click_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create ad_slot_assignments table
    await sql`
      CREATE TABLE IF NOT EXISTS ad_slot_assignments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        slot_id VARCHAR NOT NULL,
        campaign_id VARCHAR NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        priority INTEGER NOT NULL DEFAULT 1,
        assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
        assigned_by VARCHAR NOT NULL
      )
    `;
    
    // Create ad_views table
    await sql`
      CREATE TABLE IF NOT EXISTS ad_views (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        slot_id VARCHAR NOT NULL,
        campaign_id VARCHAR,
        session_id TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        user_agent TEXT,
        page TEXT NOT NULL,
        view_type TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create ad_analytics table
    await sql`
      CREATE TABLE IF NOT EXISTS ad_analytics (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        slot_id VARCHAR NOT NULL,
        campaign_id VARCHAR,
        date TEXT NOT NULL,
        page TEXT NOT NULL,
        impressions INTEGER NOT NULL DEFAULT 0,
        clicks INTEGER NOT NULL DEFAULT 0,
        revenue INTEGER NOT NULL DEFAULT 0,
        unique_views INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('Complete ad management database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

forceMigration();