-- Heinrich Co. Operations — Supabase schema
-- Run this in the Supabase SQL editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leads (synced from Google Sheet "Lead Intake")
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  website TEXT,
  source TEXT,
  campaign TEXT,
  stage TEXT DEFAULT 'New'
    CHECK (stage IN ('New','Contacted','Responded','Discovery',
      'Proposal','Negotiation','Closed-Won','Closed-Lost','Nurture')),
  score INTEGER DEFAULT 0,
  sector TEXT,
  region TEXT,
  revenue_range TEXT,
  proposal_value DECIMAL,
  deal_value DECIMAL,
  expected_close DATE,
  last_contact DATE,
  notes TEXT,
  sheet_row INTEGER UNIQUE,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns (synced from Google Sheet)
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  period TEXT,
  report_date DATE,
  invites_sent INTEGER DEFAULT 0,
  connections INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  positive_responses INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  proposals INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  agency TEXT,
  region TEXT,
  sheet_row INTEGER UNIQUE,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices (synced from Google Sheet "Payables")
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  date_received DATE,
  vendor TEXT NOT NULL,
  invoice_number TEXT,
  amount DECIMAL,
  currency TEXT DEFAULT 'EUR',
  due_date DATE,
  days_left INTEGER,
  status TEXT DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Overdue', 'Paid')),
  category TEXT,
  notes TEXT,
  email_subject TEXT,
  sheet_row INTEGER UNIQUE,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Recurring Subscriptions
CREATE TABLE IF NOT EXISTS recurring (
  id SERIAL PRIMARY KEY,
  vendor TEXT NOT NULL,
  amount DECIMAL,
  currency TEXT DEFAULT 'EUR',
  billing_day INTEGER,
  category TEXT,
  status TEXT DEFAULT 'Active',
  notes TEXT
);

-- SEO Keywords (synced from Google Sheet)
CREATE TABLE IF NOT EXISTS seo_keywords (
  id SERIAL PRIMARY KEY,
  keyword TEXT UNIQUE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL DEFAULT 0,
  position DECIMAL DEFAULT 0,
  content_gap BOOLEAN DEFAULT false,
  icp_relevance TEXT,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Content (managed natively in-app)
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content_type TEXT,
  keyword TEXT,
  approval_status TEXT DEFAULT 'Draft',
  platform TEXT,
  publish_date DATE,
  views INTEGER DEFAULT 0,
  engagement DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings (synced from Google Sheet "Website Bookings")
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_date TIMESTAMPTZ,
  booking_time TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  role TEXT,
  sector TEXT,
  revenue_range TEXT,
  source TEXT DEFAULT 'Inbound (Website Booking)',
  status TEXT DEFAULT 'New',
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Social Media Metrics (from mLabs)
CREATE TABLE IF NOT EXISTS social_metrics (
  id SERIAL PRIMARY KEY,
  channel TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  followers INTEGER,
  impressions INTEGER,
  reach INTEGER,
  engagement INTEGER,
  engagement_rate DECIMAL,
  profile_visits INTEGER,
  post_count INTEGER,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- AI Visibility Tracking
CREATE TABLE IF NOT EXISTS ai_visibility (
  id SERIAL PRIMARY KEY,
  check_date DATE DEFAULT CURRENT_DATE,
  prompt TEXT NOT NULL,
  platform TEXT NOT NULL,
  visible BOOLEAN DEFAULT false,
  position INTEGER,
  notes TEXT
);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ai_mentions INTEGER DEFAULT 0,
  share_of_voice DECIMAL DEFAULT 0,
  endorsement DECIMAL DEFAULT 0,
  sentiment DECIMAL DEFAULT 0,
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Automations Status
CREATE TABLE IF NOT EXISTS automations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  state TEXT DEFAULT 'running' CHECK (state IN ('running', 'error', 'paused')),
  last_run TIMESTAMPTZ,
  last_error TEXT,
  schedule TEXT
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  type TEXT,
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Client engagements (post Closed-Won delivery tracking)
CREATE TABLE IF NOT EXISTS client_engagements (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  contact TEXT,
  sector TEXT,
  service TEXT,
  phase TEXT DEFAULT 'Discovery',
  owner TEXT,
  value DECIMAL,
  kt TEXT DEFAULT 'Not started',
  next_milestone TEXT,
  start DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Web Push subscriptions (one row per device)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  endpoint TEXT UNIQUE NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Finance: owner only (plus explicit finance email)
DROP POLICY IF EXISTS "finance_owner_only" ON invoices;
CREATE POLICY "finance_owner_only" ON invoices
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'owner')
    OR auth.uid() IN (SELECT id FROM users WHERE email = 'syed@heinrichco-ai.com')
  );

-- Leads: owner, admin, manager
DROP POLICY IF EXISTS "leads_access" ON leads;
CREATE POLICY "leads_access" ON leads
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('owner', 'admin', 'manager'))
  );

-- Campaigns: everyone can read
DROP POLICY IF EXISTS "campaigns_read" ON campaigns;
CREATE POLICY "campaigns_read" ON campaigns
  FOR SELECT USING (true);

-- Auto-create a profile row the first time someone signs in.
-- New people arrive as 'viewer'; an admin just changes their role afterwards.
-- (This makes onboarding: person signs in once -> you set their role.)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the owner so Camila has full access immediately after she first signs in.
-- (Safe to re-run; adjust the email if hers differs.)
-- After she signs in once, run:  UPDATE users SET role='owner' WHERE email='camila@heinrichco-ai.com';
