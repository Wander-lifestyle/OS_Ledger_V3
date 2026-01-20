-- EDITORIAL OS LEDGER - SUPABASE SCHEMA
-- Supports Level 3-5 autonomous agent coordination
-- Execute this in your Supabase SQL Editor

-- =============================================================================
-- CAMPAIGNS TABLE (Core Campaign State)
-- =============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
    ledger_id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    brief_id TEXT,
    status TEXT NOT NULL CHECK (status IN (
        'intake',
        'assets_ready', 
        'content_draft',
        'scheduled',
        'executing',
        'tracking',
        'analyzing',
        'complete',
        'paused',
        'failed'
    )),
    owner_name TEXT,
    owner_email TEXT,
    channels JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- CAMPAIGN EVENTS TABLE (Timeline & Debugging)
-- =============================================================================
CREATE TABLE IF NOT EXISTS campaign_events (
    event_id TEXT PRIMARY KEY,
    ledger_id TEXT NOT NULL REFERENCES campaigns(ledger_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL, -- 'brief-specialist', 'newsletter-agent', 'orchestrator', etc.
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CAMPAIGN METRICS TABLE (Performance Tracking Level 4-5)
-- =============================================================================
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id BIGSERIAL PRIMARY KEY,
    ledger_id TEXT NOT NULL REFERENCES campaigns(ledger_id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'email_open_rate', 'social_engagement', 'click_through_rate'
    value NUMERIC NOT NULL,
    source TEXT NOT NULL, -- 'beehiiv', 'buffer', 'instagram', 'linkedin'
    tracked_at TIMESTAMPTZ DEFAULT NOW(),
    campaign_date DATE, -- When the campaign actually ran
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- LEARNED PATTERNS TABLE (Level 5 Intelligence)
-- =============================================================================
CREATE TABLE IF NOT EXISTS learned_patterns (
    pattern_id TEXT PRIMARY KEY,
    agent_name TEXT NOT NULL, -- 'newsletter-agent', 'social-engine', etc.
    pattern_type TEXT NOT NULL, -- 'subject_line', 'posting_time', 'content_format'
    pattern_rule TEXT NOT NULL, -- 'Question subjects: +23% open rate (12 samples, high confidence)'
    confidence_level NUMERIC NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
    sample_size INTEGER NOT NULL,
    learned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- CAMPAIGN ASSETS TABLE (DAM Integration)
-- =============================================================================
CREATE TABLE IF NOT EXISTS campaign_assets (
    id BIGSERIAL PRIMARY KEY,
    ledger_id TEXT NOT NULL REFERENCES campaigns(ledger_id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL, -- From DAM system
    asset_url TEXT,
    asset_type TEXT, -- 'image', 'video', 'document'
    channels JSONB DEFAULT '[]'::jsonb, -- Which channels this asset is for
    attached_at TIMESTAMPTZ DEFAULT NOW(),
    attached_by TEXT NOT NULL, -- 'dam-agent', 'user', etc.
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- EXTERNAL EXECUTIONS TABLE (External Tool Integration)
-- =============================================================================
CREATE TABLE IF NOT EXISTS external_executions (
    id BIGSERIAL PRIMARY KEY,
    ledger_id TEXT NOT NULL REFERENCES campaigns(ledger_id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL, -- 'beehiiv', 'buffer', 'slack', 'notion'
    external_id TEXT, -- ID in the external system
    external_url TEXT, -- Direct link to external content
    execution_type TEXT NOT NULL, -- 'newsletter_scheduled', 'social_posted', 'task_created'
    status TEXT NOT NULL, -- 'scheduled', 'sent', 'failed', 'draft'
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    agent_name TEXT NOT NULL, -- Which agent performed the execution
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Campaign queries
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner_email);

-- Timeline queries  
CREATE INDEX IF NOT EXISTS idx_campaign_events_ledger_id ON campaign_events(ledger_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_created_at ON campaign_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_events_type ON campaign_events(event_type);

-- Metrics queries
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_ledger_id ON campaign_metrics(ledger_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_type ON campaign_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_tracked_at ON campaign_metrics(tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_source ON campaign_metrics(source);

-- Learning patterns queries
CREATE INDEX IF NOT EXISTS idx_learned_patterns_agent ON learned_patterns(agent_name);
CREATE INDEX IF NOT EXISTS idx_learned_patterns_type ON learned_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_learned_patterns_active ON learned_patterns(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_learned_patterns_confidence ON learned_patterns(confidence_level DESC);

-- Assets queries
CREATE INDEX IF NOT EXISTS idx_campaign_assets_ledger_id ON campaign_assets(ledger_id);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_type ON campaign_assets(asset_type);

-- External executions queries
CREATE INDEX IF NOT EXISTS idx_external_executions_ledger_id ON external_executions(ledger_id);
CREATE INDEX IF NOT EXISTS idx_external_executions_tool ON external_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_external_executions_status ON external_executions(status);

-- =============================================================================
-- ROW LEVEL SECURITY (Optional - Enable if needed)
-- =============================================================================

-- Enable RLS (uncomment if you want user-level security)
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE learned_patterns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE external_executions ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for campaigns (uncomment and modify as needed)
-- CREATE POLICY "Users can access their own campaigns" ON campaigns
--   FOR ALL USING (owner_email = auth.email());

-- =============================================================================
-- SAMPLE DATA (Optional - For Testing)
-- =============================================================================

-- Insert sample campaign for testing
INSERT INTO campaigns (ledger_id, project_name, brief_id, status, owner_name, owner_email, channels, metadata)
VALUES (
    'LED-sample-123456',
    'Sample Europe eSIM Campaign', 
    'BRF-sample-001',
    'intake',
    'Test User',
    'test@editorialos.com',
    '["email", "social"]'::jsonb,
    '{"test": true, "created_via": "schema_setup"}'::jsonb
) ON CONFLICT (ledger_id) DO NOTHING;

-- Insert sample learned pattern
INSERT INTO learned_patterns (pattern_id, agent_name, pattern_type, pattern_rule, confidence_level, sample_size, metadata)
VALUES (
    'PAT-sample-001',
    'newsletter-agent',
    'subject_line',
    'Question subjects increase open rates by 23% (12 samples, high confidence)',
    0.85,
    12,
    '{"test": true, "baseline_open_rate": 0.18, "improved_open_rate": 0.22}'::jsonb
) ON CONFLICT (pattern_id) DO NOTHING;

-- =============================================================================
-- FUNCTIONS FOR COMMON QUERIES (Optional - Performance Helpers)
-- =============================================================================

-- Function to get campaign with full timeline
CREATE OR REPLACE FUNCTION get_campaign_with_timeline(campaign_ledger_id TEXT)
RETURNS TABLE (
    campaign_data JSONB,
    timeline JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(c.*) as campaign_data,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'event_id', e.event_id,
                    'event_type', e.event_type,
                    'actor', e.actor,
                    'payload', e.payload,
                    'created_at', e.created_at
                ) ORDER BY e.created_at
            ) FILTER (WHERE e.event_id IS NOT NULL),
            '[]'::jsonb
        ) as timeline
    FROM campaigns c
    LEFT JOIN campaign_events e ON c.ledger_id = e.ledger_id
    WHERE c.ledger_id = campaign_ledger_id
    GROUP BY c.ledger_id, c.project_name, c.brief_id, c.status, c.owner_name, c.owner_email, c.channels, c.created_at, c.updated_at, c.metadata;
END;
$$;

-- Function to get performance summary
CREATE OR REPLACE FUNCTION get_performance_summary(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_campaigns INTEGER,
    completed_campaigns INTEGER,
    avg_metrics JSONB,
    learned_patterns_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_campaigns,
        COUNT(CASE WHEN status = 'complete' THEN 1 END)::INTEGER as completed_campaigns,
        COALESCE(
            jsonb_object_agg(
                m.metric_type, 
                jsonb_build_object('avg', ROUND(AVG(m.value), 4), 'count', COUNT(m.value))
            ),
            '{}'::jsonb
        ) as avg_metrics,
        (SELECT COUNT(*)::INTEGER FROM learned_patterns WHERE is_active = TRUE) as learned_patterns_count
    FROM campaigns c
    LEFT JOIN campaign_metrics m ON c.ledger_id = m.ledger_id
    WHERE c.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY ();
END;
$$;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Editorial OS Ledger Schema Setup Complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - campaigns (campaign state & lifecycle)';
    RAISE NOTICE '  - campaign_events (timeline & debugging)';
    RAISE NOTICE '  - campaign_metrics (performance tracking)'; 
    RAISE NOTICE '  - learned_patterns (Level 5 intelligence)';
    RAISE NOTICE '  - campaign_assets (DAM integration)';
    RAISE NOTICE '  - external_executions (tool integration)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Set up your SUPABASE environment variables';
    RAISE NOTICE '  2. Deploy the Editorial OS Ledger API';
    RAISE NOTICE '  3. Test with MCP protocol calls';
    RAISE NOTICE '';
    RAISE NOTICE 'Sample data inserted for testing.';
    RAISE NOTICE 'Schema supports Editorial OS Levels 3-5!';
END $$;