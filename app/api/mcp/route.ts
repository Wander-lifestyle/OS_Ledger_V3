// @ts-nocheck
// EDITORIAL OS - ORCHESTRATION-NATIVE LEDGER
// Built for Level 3-5 autonomous agent coordination
// MCP Protocol + Supabase + Extensible Architecture
// File: app/api/mcp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// SUPABASE CONFIGURATION
// =============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================================================
// CORS HELPERS
// =============================================================================
const DEFAULT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const allowList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  const origin = request.headers.get('origin') || '';

  if (allowList.length === 0) {
    return DEFAULT_CORS_HEADERS;
  }

  if (origin && allowList.includes(origin)) {
    return { ...DEFAULT_CORS_HEADERS, 'Access-Control-Allow-Origin': origin };
  }

  return { ...DEFAULT_CORS_HEADERS, 'Access-Control-Allow-Origin': 'null' };
}

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

const VALID_STATUSES = new Set([
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
]);

const STATUS_ALIASES: Record<string, CampaignStatus> = {
  draft: 'content_draft',
  ready: 'assets_ready',
  assets: 'assets_ready',
  live: 'executing',
  analysis: 'analyzing',
  completed: 'complete'
};

function isPlainObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function pickParam(params: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
}

function normalizeChannels(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map(channel => String(channel).trim())
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map(channel => channel.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeStatus(value: any, defaultValue?: CampaignStatus): CampaignStatus | undefined {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const raw = String(value).trim().toLowerCase();
  const alias = STATUS_ALIASES[raw];
  if (alias) return alias;
  if (VALID_STATUSES.has(raw)) return raw as CampaignStatus;

  console.warn(`Unknown campaign status "${value}", defaulting to ${defaultValue ?? 'undefined'}`);
  return defaultValue;
}

function normalizeLedgerId(params: Record<string, any>): string | undefined {
  return pickParam(params, ['ledger_id', 'ledgerId', 'campaign_id', 'campaignId', 'id']);
}

function normalizeMetadata(params: Record<string, any>) {
  const metadata = pickParam(params, ['metadata', 'meta']);
  return isPlainObject(metadata) ? metadata : {};
}

function requireParam<T>(value: T | undefined | null, label: string, action: string): T {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required "${label}" for ${action}.`);
  }
  return value;
}

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
    const action = typeof body?.action === 'string' ? body.action.trim() : '';
    const params = isPlainObject(body?.params) ? body.params : {};

    console.log(`🎯 Ledger MCP: ${action}`, params);

    // Route to core or extended actions
    const handler = (CORE_MCP_ACTIONS as any)[action] || (EXTENDED_MCP_ACTIONS as any)[action];
    
    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required "action" in MCP request.'
      }, { status: 400, headers: getCorsHeaders(request) });
    }

    if (!handler) {
      const availableActions = [...Object.keys(CORE_MCP_ACTIONS), ...Object.keys(EXTENDED_MCP_ACTIONS)];
      return NextResponse.json({
        success: false,
        error: `Unknown action: ${action}. Available actions: ${availableActions.join(', ')}`
      }, { status: 400, headers: getCorsHeaders(request) });
    }

    // Execute the action
    const result = await handler(params);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Ledger MCP: ${action} completed in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      data: result
    }, { headers: getCorsHeaders(request) });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Ledger MCP error (${duration}ms):`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================
export async function GET(request: NextRequest) {
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
  }, { headers: getCorsHeaders(request) });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}

// =============================================================================
// CORE MCP ACTION HANDLERS
// =============================================================================

// Campaign Creation (Level 2-3)
async function handleCreateCampaign(params: any): Promise<Campaign> {
  const safeParams = isPlainObject(params) ? params : {};
  const projectName = pickParam(safeParams, [
    'project_name',
    'projectName',
    'campaign_name',
    'campaignName',
    'name',
    'title'
  ]);
  const briefId = pickParam(safeParams, ['brief_id', 'briefId']);
  const statusInput = pickParam(safeParams, ['status', 'campaign_status', 'campaignStatus']);
  const ownerName = pickParam(safeParams, ['owner_name', 'ownerName']);
  const ownerEmail = pickParam(safeParams, ['owner_email', 'ownerEmail']);
  const channelsInput = pickParam(safeParams, ['channels', 'channel', 'channel_list', 'channelList']);
  const metadata = normalizeMetadata(safeParams);

  const projectNameValue = requireParam(projectName, 'project_name', 'create_campaign');

  const ledger_id = `LED-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  
  const campaign: Campaign = {
    ledger_id,
    project_name: projectNameValue,
    brief_id: briefId || null,
    status: normalizeStatus(statusInput, 'intake') || 'intake',
    owner_name: ownerName || null,
    owner_email: ownerEmail || null,
    channels: normalizeChannels(channelsInput),
    created_at: now,
    updated_at: now,
    metadata
  };

  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single();

  if (error) throw new Error(`Failed to create campaign: ${error.message}`);

  // Log creation event for timeline
  await logCampaignEvent(ledger_id, 'campaign_created', 'orchestrator', {
    project_name: campaign.project_name,
    channels: campaign.channels
  });

  return data;
}

// Campaign Retrieval
async function handleGetCampaign(params: any): Promise<Campaign> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'get_campaign');

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_events(*),
      campaign_metrics(*),
      campaign_assets(*)
    `)
    .eq('ledger_id', ledgerId)
    .single();

  if (error) throw new Error(`Campaign not found: ${error.message}`);
  return data;
}

// Campaign Listing
async function handleListCampaigns(params: any): Promise<Campaign[]> {
  const safeParams = isPlainObject(params) ? params : {};
  let query = supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  const statusInput = pickParam(safeParams, ['status', 'campaign_status', 'campaignStatus']);
  const status = normalizeStatus(statusInput);
  if (status) {
    query = query.eq('status', status);
  }

  const limitInput = pickParam(safeParams, ['limit', 'page_size', 'pageSize']);
  const limitValue = Number(limitInput);
  if (Number.isFinite(limitValue) && limitValue > 0) {
    query = query.limit(limitValue);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list campaigns: ${error.message}`);
  return data || [];
}

// Status Updates (Agent Coordination)
async function handleUpdateStatus(params: any): Promise<Campaign> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'update_status');
  const statusInput = pickParam(safeParams, [
    'status',
    'next_status',
    'nextStatus',
    'new_status',
    'newStatus',
    'campaign_status',
    'campaignStatus'
  ]);
  const status = requireParam(normalizeStatus(statusInput), 'status', 'update_status');
  const previousStatus = pickParam(safeParams, ['previous_status', 'previousStatus']);
  const agent = pickParam(safeParams, ['agent', 'agent_name', 'agentName', 'actor']) || 'system';
  const reason = pickParam(safeParams, ['reason', 'status_reason', 'statusReason']);
  const metadata = normalizeMetadata(safeParams);
  const metadataUpdate = Object.keys(metadata).length > 0 ? metadata : undefined;
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('campaigns')
    .update({ 
      status, 
      updated_at: now,
      metadata: metadataUpdate
    })
    .eq('ledger_id', ledgerId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update status: ${error.message}`);

  // Log status change event
  await logCampaignEvent(ledgerId, 'status_changed', agent, {
    from: previousStatus,
    to: status,
    reason
  });

  return data;
}

// Campaign Deletion
async function handleDeleteCampaign(params: any): Promise<{ deleted: boolean }> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'delete_campaign');
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('ledger_id', ledgerId);

  if (error) throw new Error(`Failed to delete campaign: ${error.message}`);
  return { deleted: true };
}

// Agent Action Logging (Level 3-5 Coordination)
async function handleLogAgentAction(params: any): Promise<{ logged: boolean }> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'log_agent_action');
  const actionType = requireParam(
    pickParam(safeParams, ['action_type', 'actionType', 'event_type', 'eventType']),
    'action_type',
    'log_agent_action'
  );
  const agentName = requireParam(
    pickParam(safeParams, ['agent_name', 'agentName', 'agent', 'actor']),
    'agent_name',
    'log_agent_action'
  );
  const actionData = pickParam(safeParams, ['action_data', 'actionData', 'payload']) || {};

  await logCampaignEvent(
    ledgerId,
    actionType,
    agentName,
    actionData
  );
  return { logged: true };
}

// Campaign Timeline
async function handleGetCampaignTimeline(params: any): Promise<any[]> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'get_campaign_timeline');
  const { data, error } = await supabase
    .from('campaign_events')
    .select('*')
    .eq('ledger_id', ledgerId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to get timeline: ${error.message}`);
  return data || [];
}

// Execution Progress Updates
async function handleUpdateExecutionProgress(params: any): Promise<{ updated: boolean }> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'update_execution_progress');
  const progressDataRaw = pickParam(safeParams, ['progress_data', 'progressData', 'metadata']);
  const progressData = isPlainObject(progressDataRaw)
    ? progressDataRaw
    : progressDataRaw
      ? { value: progressDataRaw }
      : {};
  const agent = pickParam(safeParams, ['agent', 'agent_name', 'agentName', 'actor']) || 'system';
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('campaigns')
    .update({ 
      metadata: progressData,
      updated_at: now
    })
    .eq('ledger_id', ledgerId);

  if (error) throw new Error(`Failed to update progress: ${error.message}`);

  // Log progress event
  await logCampaignEvent(ledgerId, 'progress_update', agent, progressData);
  
  return { updated: true };
}

// Performance Metrics Storage (Level 4-5)
async function handleStoreMetrics(params: any): Promise<{ stored: boolean }> {
  const safeParams = isPlainObject(params) ? params : {};
  const metricsInput = Array.isArray(safeParams.metrics)
    ? safeParams.metrics
    : safeParams.metrics
      ? [safeParams.metrics]
      : [safeParams];
  const fallbackLedgerId = normalizeLedgerId(safeParams);
  const fallbackSource = pickParam(safeParams, ['source', 'metric_source', 'metricSource']);
  const fallbackCampaignDate = pickParam(safeParams, ['campaign_date', 'campaignDate']);

  const metricsToInsert = metricsInput.map(metric => {
    const metricParams = isPlainObject(metric) ? metric : {};
    const ledgerId = requireParam(
      normalizeLedgerId(metricParams) || fallbackLedgerId,
      'ledger_id',
      'store_metrics'
    );
    const metricType = requireParam(
      pickParam(metricParams, ['metric_type', 'metricType', 'type']) ||
        pickParam(safeParams, ['metric_type', 'metricType', 'type']),
      'metric_type',
      'store_metrics'
    );
    const rawValue = pickParam(metricParams, ['value', 'metric_value', 'metricValue']);
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      throw new Error('value must be a number for store_metrics.');
    }
    const source = requireParam(
      pickParam(metricParams, ['source', 'metric_source', 'metricSource']) || fallbackSource,
      'source',
      'store_metrics'
    );
    const campaignDate =
      pickParam(metricParams, ['campaign_date', 'campaignDate']) || fallbackCampaignDate;
    const metadata = normalizeMetadata(metricParams);

    return {
      ledger_id: ledgerId,
      metric_type: metricType,
      value,
      source,
      tracked_at: new Date().toISOString(),
      campaign_date: campaignDate,
      metadata
    };
  });

  const { error } = await supabase
    .from('campaign_metrics')
    .insert(metricsToInsert);

  if (error) throw new Error(`Failed to store metrics: ${error.message}`);

  // Log metrics stored event
  const primaryLedgerId = fallbackLedgerId || metricsToInsert[0]?.ledger_id;
  if (primaryLedgerId) {
    await logCampaignEvent(primaryLedgerId, 'metrics_stored', metricsToInsert[0]?.source || 'metrics', {
      metrics_count: metricsToInsert.length,
      metric_types: metricsToInsert.map(m => m.metric_type)
    });
  }

  return { stored: true };
}

// Metrics Retrieval
async function handleGetMetrics(params: any): Promise<CampaignMetrics[]> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'get_metrics');
  let query = supabase
    .from('campaign_metrics')
    .select('*')
    .eq('ledger_id', ledgerId)
    .order('tracked_at', { ascending: false });

  const metricType = pickParam(safeParams, ['metric_type', 'metricType', 'type']);
  if (metricType) {
    query = query.eq('metric_type', metricType);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to get metrics: ${error.message}`);
  return data || [];
}

// Performance History (Level 5 Learning)
async function handleGetPerformanceHistory(params: any): Promise<any> {
  const safeParams = isPlainObject(params) ? params : {};
  const metricType = requireParam(
    pickParam(safeParams, ['metric_type', 'metricType', 'type']),
    'metric_type',
    'get_performance_history'
  );
  const limitInput = pickParam(safeParams, ['limit', 'page_size', 'pageSize']);
  const limitValue = Number(limitInput);
  const { data, error } = await supabase
    .from('campaign_metrics')
    .select(`
      *,
      campaigns(project_name, channels, status)
    `)
    .eq('metric_type', metricType)
    .order('tracked_at', { ascending: false })
    .limit(Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 50);

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
  const safeParams = isPlainObject(params) ? params : {};
  let query = supabase
    .from('learned_patterns')
    .select('*')
    .eq('is_active', true)
    .order('confidence_level', { ascending: false });

  const agentName = pickParam(safeParams, ['agent_name', 'agentName', 'agent']);
  if (agentName) {
    query = query.eq('agent_name', agentName);
  }

  const patternType = pickParam(safeParams, ['pattern_type', 'patternType', 'type']);
  if (patternType) {
    query = query.eq('pattern_type', patternType);
  }

  const minConfidenceInput = pickParam(safeParams, ['min_confidence', 'minConfidence']);
  const minConfidenceValue = Number(minConfidenceInput);
  if (Number.isFinite(minConfidenceValue)) {
    query = query.gte('confidence_level', minConfidenceValue);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to get learned patterns: ${error.message}`);
  return data || [];
}

// Store Learned Pattern
async function handleStoreLearnedPattern(params: any): Promise<LearnedPattern> {
  const safeParams = isPlainObject(params) ? params : {};
  const agentName = requireParam(
    pickParam(safeParams, ['agent_name', 'agentName', 'agent']),
    'agent_name',
    'store_learned_pattern'
  );
  const patternType = requireParam(
    pickParam(safeParams, ['pattern_type', 'patternType', 'type']),
    'pattern_type',
    'store_learned_pattern'
  );
  const patternRule = requireParam(
    pickParam(safeParams, ['pattern_rule', 'patternRule', 'rule']),
    'pattern_rule',
    'store_learned_pattern'
  );
  const confidenceInput = pickParam(safeParams, [
    'confidence_level',
    'confidenceLevel',
    'confidence'
  ]);
  const confidenceValue = Number(confidenceInput);
  if (!Number.isFinite(confidenceValue) || confidenceValue < 0 || confidenceValue > 1) {
    throw new Error('confidence_level must be a number between 0 and 1.');
  }
  const sampleInput = pickParam(safeParams, ['sample_size', 'sampleSize', 'samples']);
  const sampleSizeValue = Number(sampleInput);
  if (!Number.isFinite(sampleSizeValue) || sampleSizeValue <= 0) {
    throw new Error('sample_size must be a positive number.');
  }

  const pattern_id = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  
  const pattern: LearnedPattern = {
    pattern_id,
    agent_name: agentName,
    pattern_type: patternType,
    pattern_rule: patternRule,
    confidence_level: confidenceValue,
    sample_size: sampleSizeValue,
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
  const safeParams = isPlainObject(params) ? params : {};
  const patternId = requireParam(
    pickParam(safeParams, ['pattern_id', 'patternId', 'id']),
    'pattern_id',
    'update_pattern_confidence'
  );
  const confidenceInput = pickParam(safeParams, [
    'confidence_level',
    'confidenceLevel',
    'confidence'
  ]);
  const confidenceValue = Number(confidenceInput);
  if (!Number.isFinite(confidenceValue) || confidenceValue < 0 || confidenceValue > 1) {
    throw new Error('confidence_level must be a number between 0 and 1.');
  }
  const sampleInput = pickParam(safeParams, ['sample_size', 'sampleSize', 'samples']);
  const sampleSizeValue = Number(sampleInput);
  if (!Number.isFinite(sampleSizeValue) || sampleSizeValue <= 0) {
    throw new Error('sample_size must be a positive number.');
  }

  const { data, error } = await supabase
    .from('learned_patterns')
    .update({
      confidence_level: confidenceValue,
      sample_size: sampleSizeValue
    })
    .eq('pattern_id', patternId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update pattern confidence: ${error.message}`);
  return data;
}

// VP Report Data Generation (Level 5)
async function handleGenerateReportData(params: any): Promise<any> {
  const safeParams = isPlainObject(params) ? params : {};
  const endDate =
    pickParam(safeParams, ['end_date', 'endDate']) || new Date().toISOString();
  const startDate =
    pickParam(safeParams, ['start_date', 'startDate']) ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'attach_asset');
  const assetId = requireParam(
    pickParam(safeParams, ['asset_id', 'assetId', 'id']),
    'asset_id',
    'attach_asset'
  );
  const assetUrl = pickParam(safeParams, ['asset_url', 'assetUrl', 'url']);
  const assetType = pickParam(safeParams, ['asset_type', 'assetType', 'type']);
  const channels = normalizeChannels(
    pickParam(safeParams, ['channels', 'channel', 'channel_list', 'channelList'])
  );
  const attachedBy =
    pickParam(safeParams, ['attached_by', 'attachedBy', 'agent', 'agent_name']) || 'dam-agent';
  const metadata = normalizeMetadata(safeParams);

  const asset = {
    ledger_id: ledgerId,
    asset_id: assetId,
    asset_url: assetUrl,
    asset_type: assetType,
    channels,
    attached_at: new Date().toISOString(),
    attached_by: attachedBy,
    metadata
  };

  const { error } = await supabase
    .from('campaign_assets')
    .insert(asset);

  if (error) throw new Error(`Failed to attach asset: ${error.message}`);

  await logCampaignEvent(ledgerId, 'asset_attached', attachedBy, asset);
  
  return { attached: true };
}

// List Assets
async function handleListAssets(params: any): Promise<any[]> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'list_assets');
  const { data, error } = await supabase
    .from('campaign_assets')
    .select('*')
    .eq('ledger_id', ledgerId)
    .order('attached_at', { ascending: false });

  if (error) throw new Error(`Failed to list assets: ${error.message}`);
  return data || [];
}

// External Tool Integration
async function handleLogExternalExecution(params: any): Promise<{ logged: boolean }> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'log_external_execution');
  const toolName = pickParam(safeParams, ['tool_name', 'toolName', 'tool']) || 'external-tool';
  const externalId = pickParam(safeParams, ['external_id', 'externalId']);
  const externalUrl = pickParam(safeParams, ['external_url', 'externalUrl', 'url']);
  const executionStatus = pickParam(safeParams, ['status', 'execution_status', 'executionStatus']);
  const executionData = pickParam(safeParams, ['execution_data', 'executionData', 'payload']);

  await logCampaignEvent(
    ledgerId,
    'external_execution',
    toolName,
    {
      external_id: externalId,
      external_url: externalUrl,
      execution_status: executionStatus,
      execution_data: executionData
    }
  );
  return { logged: true };
}

// Sync External Status
async function handleSyncExternalStatus(params: any): Promise<{ synced: boolean }> {
  const safeParams = isPlainObject(params) ? params : {};
  const ledgerId = requireParam(normalizeLedgerId(safeParams), 'ledger_id', 'sync_external_status');
  const currentMetadataRaw = pickParam(safeParams, ['current_metadata', 'currentMetadata', 'metadata']);
  const currentMetadata = isPlainObject(currentMetadataRaw) ? currentMetadataRaw : {};
  const externalStatus = requireParam(
    pickParam(safeParams, ['external_status', 'externalStatus', 'status']),
    'external_status',
    'sync_external_status'
  );
  const toolName = pickParam(safeParams, ['tool_name', 'toolName', 'tool']) || 'external-tool';

  // Update campaign with external tool status
  const { error } = await supabase
    .from('campaigns')
    .update({ 
      metadata: { 
        ...currentMetadata,
        external_status: externalStatus,
        last_sync: new Date().toISOString()
      }
    })
    .eq('ledger_id', ledgerId);

  if (error) throw new Error(`Failed to sync external status: ${error.message}`);

  await logCampaignEvent(ledgerId, 'external_sync', toolName, externalStatus);
  
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
