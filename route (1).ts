// EDITORIAL OS - ORCHESTRATION-NATIVE LEDGER
// Built for Level 3-5 autonomous agent coordination
// MCP Protocol + Supabase + Extensible Architecture
// File: app/api/mcp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// SUPABASE CONFIGURATION
// =============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================================================
// MCP PROTOCOL TYPES (Editorial OS Standard)
// =============================================================================
interface McpRequest {
  action: string;
  params?: Record<string, any>;
}

interface McpResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface Campaign {
  ledger_id: string;
  project_name: string;
  brief_id?: string;
  status: CampaignStatus;
  owner_name?: string;
  owner_email?: string;
  channels: string[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

interface CampaignMetrics {
  ledger_id: string;
  metric_type: string; // 'email_open_rate', 'social_engagement', etc.
  value: number;
  source: string; // 'beehiiv', 'buffer', 'instagram', etc.
  tracked_at: string;
  campaign_date: string;
}

interface LearnedPattern {
  pattern_id: string;
  agent_name: string; // 'newsletter-agent', 'social-engine', etc.
  pattern_type: string; // 'subject_line', 'posting_time', 'content_format'
  pattern_rule: string; // 'Question subjects: +23% open rate'
  confidence_level: number; // 0.0 to 1.0
  sample_size: number;
  learned_at: string;
  is_active: boolean;
}

type CampaignStatus = 
  | 'intake'        // Brief created, campaign started
  | 'assets_ready'  // Assets found and approved
  | 'content_draft' // Content created but not scheduled
  | 'scheduled'     // Content scheduled in external tools
  | 'executing'     // Campaign is live/sending
  | 'tracking'      // Waiting for performance data
  | 'analyzing'     // Performance analysis in progress
  | 'complete'      // Campaign complete with learnings
  | 'paused'        // Campaign paused by user
  | 'failed';       // Campaign encountered errors

// =============================================================================
// CORE EDITORIAL OS MCP ACTIONS
// =============================================================================
const CORE_MCP_ACTIONS = {
  // Campaign Lifecycle Management
  'create_campaign': handleCreateCampaign,
  'get_campaign': handleGetCampaign,
  'list_campaigns': handleListCampaigns,
  'update_status': handleUpdateStatus,
  'delete_campaign': handleDeleteCampaign,
  
  // Agent Execution Tracking (Level 3-5)
  'log_agent_action': handleLogAgentAction,
  'get_campaign_timeline': handleGetCampaignTimeline,
  'update_execution_progress': handleUpdateExecutionProgress,
  
  // Performance Metrics (Level 4-5)
  'store_metrics': handleStoreMetrics,
  'get_metrics': handleGetMetrics,
  'get_performance_history': handleGetPerformanceHistory,
  
  // Learning Patterns (Level 5)
  'get_learned_patterns': handleGetLearnedPatterns,
  'store_learned_pattern': handleStoreLearnedPattern,
  'update_pattern_confidence': handleUpdatePatternConfidence,
  
  // VP Reporting (Level 5)
  'generate_report_data': handleGenerateReportData,
  'get_weekly_summary': handleWeeklySummary,
  
  // Asset Management Integration
  'attach_asset': handleAttachAsset,
  'list_assets': handleListAssets,
  
  // External Tool Integration
  'log_external_execution': handleLogExternalExecution,
  'sync_external_status': handleSyncExternalStatus
};

// =============================================================================
// EXTENSIBLE CLIENT ACTIONS (Week 2+ Customization)
// =============================================================================
const EXTENDED_MCP_ACTIONS: Record<string, Function> = {
  // Add client-specific actions here
  // 'sync_notion_tasks': handleSyncNotion,
  // 'track_inventory': handleInventoryTracking,
  // 'generate_seasonal_content': handleSeasonalGeneration,
};

// =============================================================================
// MAIN MCP ENDPOINT
// =============================================================================
export async function POST(request: NextRequest): Promise<NextResponse<McpResponse>> {
  const startTime = Date.now();
  
  try {
    const body: McpRequest = await request.json();
    const { action, params = {} } = body;

    console.log(`🎯 Ledger MCP: ${action}`, params);

    // Route to core or extended actions
    const handler = CORE_MCP_ACTIONS[action] || EXTENDED_MCP_ACTIONS[action];
    
    if (!handler) {
      const availableActions = [...Object.keys(CORE_MCP_ACTIONS), ...Object.keys(EXTENDED_MCP_ACTIONS)];
      return NextResponse.json({
        success: false,
        error: `Unknown action: ${action}. Available actions: ${availableActions.join(', ')}`
      }, { status: 400 });
    }

    // Execute the action
    const result = await handler(params);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Ledger MCP: ${action} completed in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Ledger MCP error (${duration}ms):`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'editorial-os-ledger',
    version: '3.0.0',
    architecture: 'orchestration-native',
    mcp_protocol: 'enabled',
    core_actions: Object.keys(CORE_MCP_ACTIONS),
    extended_actions: Object.keys(EXTENDED_MCP_ACTIONS),
    database: 'supabase',
    levels_supported: [3, 4, 5],
    timestamp: new Date().toISOString()
  });
}

// =============================================================================
// CORE MCP ACTION HANDLERS
// =============================================================================

// Campaign Creation (Level 2-3)
async function handleCreateCampaign(params: any): Promise<Campaign> {
  const ledger_id = `LED-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  
  const campaign: Campaign = {
    ledger_id,
    project_name: params.project_name,
    brief_id: params.brief_id || null,
    status: params.status || 'intake',
    owner_name: params.owner_name || null,
    owner_email: params.owner_email || null,
    channels: params.channels || [],
    created_at: now,
    updated_at: now,
    metadata: params.metadata || {}
  };

  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single();

  if (error) throw new Error(`Failed to create campaign: ${error.message}`);

  // Log creation event for timeline
  await logCampaignEvent(ledger_id, 'campaign_created', 'orchestrator', {
    project_name: params.project_name,
    channels: params.channels
  });

  return data;
}

// Campaign Retrieval
async function handleGetCampaign(params: any): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_events(*),
      campaign_metrics(*),
      campaign_assets(*)
    `)
    .eq('ledger_id', params.ledger_id)
    .single();

  if (error) throw new Error(`Campaign not found: ${error.message}`);
  return data;
}

// Campaign Listing
async function handleListCampaigns(params: any): Promise<Campaign[]> {
  let query = supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list campaigns: ${error.message}`);
  return data || [];
}

// Status Updates (Agent Coordination)
async function handleUpdateStatus(params: any): Promise<Campaign> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('campaigns')
    .update({ 
      status: params.status, 
      updated_at: now,
      metadata: params.metadata || undefined
    })
    .eq('ledger_id', params.ledger_id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update status: ${error.message}`);

  // Log status change event
  await logCampaignEvent(params.ledger_id, 'status_changed', params.agent || 'system', {
    from: params.previous_status,
    to: params.status,
    reason: params.reason
  });

  return data;
}

// Campaign Deletion
async function handleDeleteCampaign(params: any): Promise<{ deleted: boolean }> {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('ledger_id', params.ledger_id);

  if (error) throw new Error(`Failed to delete campaign: ${error.message}`);
  return { deleted: true };
}

// Agent Action Logging (Level 3-5 Coordination)
async function handleLogAgentAction(params: any): Promise<{ logged: boolean }> {
  await logCampaignEvent(
    params.ledger_id,
    params.action_type,
    params.agent_name,
    params.action_data
  );
  return { logged: true };
}

// Campaign Timeline
async function handleGetCampaignTimeline(params: any): Promise<any[]> {
  const { data, error } = await supabase
    .from('campaign_events')
    .select('*')
    .eq('ledger_id', params.ledger_id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to get timeline: ${error.message}`);
  return data || [];
}

// Execution Progress Updates
async function handleUpdateExecutionProgress(params: any): Promise<{ updated: boolean }> {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('campaigns')
    .update({ 
      metadata: params.progress_data,
      updated_at: now
    })
    .eq('ledger_id', params.ledger_id);

  if (error) throw new Error(`Failed to update progress: ${error.message}`);

  // Log progress event
  await logCampaignEvent(params.ledger_id, 'progress_update', params.agent, params.progress_data);
  
  return { updated: true };
}

// Performance Metrics Storage (Level 4-5)
async function handleStoreMetrics(params: any): Promise<{ stored: boolean }> {
  const metrics = Array.isArray(params.metrics) ? params.metrics : [params];
  
  const metricsToInsert = metrics.map(metric => ({
    ledger_id: params.ledger_id || metric.ledger_id,
    metric_type: metric.metric_type,
    value: metric.value,
    source: metric.source,
    tracked_at: new Date().toISOString(),
    campaign_date: metric.campaign_date || params.campaign_date,
    metadata: metric.metadata
  }));

  const { error } = await supabase
    .from('campaign_metrics')
    .insert(metricsToInsert);

  if (error) throw new Error(`Failed to store metrics: ${error.message}`);

  // Log metrics stored event
  await logCampaignEvent(params.ledger_id, 'metrics_stored', params.source, {
    metrics_count: metricsToInsert.length,
    metric_types: metricsToInsert.map(m => m.metric_type)
  });

  return { stored: true };
}

// Metrics Retrieval
async function handleGetMetrics(params: any): Promise<CampaignMetrics[]> {
  let query = supabase
    .from('campaign_metrics')
    .select('*')
    .eq('ledger_id', params.ledger_id)
    .order('tracked_at', { ascending: false });

  if (params.metric_type) {
    query = query.eq('metric_type', params.metric_type);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to get metrics: ${error.message}`);
  return data || [];
}

// Performance History (Level 5 Learning)
async function handleGetPerformanceHistory(params: any): Promise<any> {
  const { data, error } = await supabase
    .from('campaign_metrics')
    .select(`
      *,
      campaigns(project_name, channels, status)
    `)
    .eq('metric_type', params.metric_type)
    .order('tracked_at', { ascending: false })
    .limit(params.limit || 50);

  if (error) throw new Error(`Failed to get performance history: ${error.message}`);
  
  // Calculate averages and trends
  const metrics = data || [];
  const average = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length 
    : 0;

  return {
    metrics,
    average,
    sample_size: metrics.length,
    date_range: {
      from: metrics[metrics.length - 1]?.tracked_at,
      to: metrics[0]?.tracked_at
    }
  };
}

// Learned Patterns (Level 5 Intelligence)
async function handleGetLearnedPatterns(params: any): Promise<LearnedPattern[]> {
  let query = supabase
    .from('learned_patterns')
    .select('*')
    .eq('is_active', true)
    .order('confidence_level', { ascending: false });

  if (params.agent_name) {
    query = query.eq('agent_name', params.agent_name);
  }

  if (params.pattern_type) {
    query = query.eq('pattern_type', params.pattern_type);
  }

  if (params.min_confidence) {
    query = query.gte('confidence_level', params.min_confidence);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to get learned patterns: ${error.message}`);
  return data || [];
}

// Store Learned Pattern
async function handleStoreLearnedPattern(params: any): Promise<LearnedPattern> {
  const pattern_id = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  
  const pattern: LearnedPattern = {
    pattern_id,
    agent_name: params.agent_name,
    pattern_type: params.pattern_type,
    pattern_rule: params.pattern_rule,
    confidence_level: params.confidence_level,
    sample_size: params.sample_size,
    learned_at: new Date().toISOString(),
    is_active: true
  };

  const { data, error } = await supabase
    .from('learned_patterns')
    .insert(pattern)
    .select()
    .single();

  if (error) throw new Error(`Failed to store learned pattern: ${error.message}`);
  return data;
}

// Update Pattern Confidence
async function handleUpdatePatternConfidence(params: any): Promise<LearnedPattern> {
  const { data, error } = await supabase
    .from('learned_patterns')
    .update({
      confidence_level: params.confidence_level,
      sample_size: params.sample_size
    })
    .eq('pattern_id', params.pattern_id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update pattern confidence: ${error.message}`);
  return data;
}

// VP Report Data Generation (Level 5)
async function handleGenerateReportData(params: any): Promise<any> {
  const endDate = params.end_date || new Date().toISOString();
  const startDate = params.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get campaigns in date range
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_metrics(*)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Get learned patterns
  const { data: patterns } = await supabase
    .from('learned_patterns')
    .select('*')
    .eq('is_active', true)
    .gte('learned_at', startDate);

  return {
    date_range: { start: startDate, end: endDate },
    campaigns_created: campaigns?.length || 0,
    campaigns_completed: campaigns?.filter(c => c.status === 'complete').length || 0,
    total_metrics: campaigns?.reduce((sum, c) => sum + (c.campaign_metrics?.length || 0), 0) || 0,
    patterns_learned: patterns?.length || 0,
    campaigns,
    learned_patterns: patterns
  };
}

// Weekly Summary
async function handleWeeklySummary(params: any): Promise<any> {
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  return handleGenerateReportData({ start_date: startDate, end_date: endDate });
}

// Asset Management
async function handleAttachAsset(params: any): Promise<{ attached: boolean }> {
  const asset = {
    ledger_id: params.ledger_id,
    asset_id: params.asset_id,
    asset_url: params.asset_url,
    asset_type: params.asset_type,
    channels: params.channels,
    attached_at: new Date().toISOString(),
    attached_by: params.attached_by || 'dam-agent'
  };

  const { error } = await supabase
    .from('campaign_assets')
    .insert(asset);

  if (error) throw new Error(`Failed to attach asset: ${error.message}`);

  await logCampaignEvent(params.ledger_id, 'asset_attached', 'dam-agent', asset);
  
  return { attached: true };
}

// List Assets
async function handleListAssets(params: any): Promise<any[]> {
  const { data, error } = await supabase
    .from('campaign_assets')
    .select('*')
    .eq('ledger_id', params.ledger_id)
    .order('attached_at', { ascending: false });

  if (error) throw new Error(`Failed to list assets: ${error.message}`);
  return data || [];
}

// External Tool Integration
async function handleLogExternalExecution(params: any): Promise<{ logged: boolean }> {
  await logCampaignEvent(
    params.ledger_id,
    'external_execution',
    params.tool_name,
    {
      external_id: params.external_id,
      external_url: params.external_url,
      execution_status: params.status,
      execution_data: params.execution_data
    }
  );
  return { logged: true };
}

// Sync External Status
async function handleSyncExternalStatus(params: any): Promise<{ synced: boolean }> {
  // Update campaign with external tool status
  const { error } = await supabase
    .from('campaigns')
    .update({ 
      metadata: { 
        ...params.current_metadata,
        external_status: params.external_status,
        last_sync: new Date().toISOString()
      }
    })
    .eq('ledger_id', params.ledger_id);

  if (error) throw new Error(`Failed to sync external status: ${error.message}`);

  await logCampaignEvent(params.ledger_id, 'external_sync', params.tool_name, params.external_status);
  
  return { synced: true };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Campaign Event Logging (for timeline and debugging)
async function logCampaignEvent(
  ledger_id: string, 
  event_type: string, 
  actor: string, 
  payload: any
): Promise<void> {
  const event = {
    event_id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    ledger_id,
    event_type,
    actor,
    payload,
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('campaign_events')
    .insert(event);

  if (error) {
    console.error('Failed to log campaign event:', error);
  }
}

// =============================================================================
// CLIENT EXTENSIBILITY EXAMPLE
// =============================================================================

// Example: Custom Notion Integration (Week 2 client customization)
/*
EXTENDED_MCP_ACTIONS['sync_notion_tasks'] = async function handleSyncNotion(params: any) {
  // Custom client logic for Notion integration
  const notionTasks = await fetchNotionTasks(params.database_id);
  
  // Update campaign with Notion data
  await supabase
    .from('campaigns')
    .update({ 
      metadata: { 
        notion_tasks: notionTasks,
        last_notion_sync: new Date().toISOString()
      }
    })
    .eq('ledger_id', params.ledger_id);
  
  return { synced: true, tasks_count: notionTasks.length };
};
*/