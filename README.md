# Editorial OS Ledger

**Orchestration-native state machine for Editorial OS Level 3-5 autonomous agent coordination.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/editorial-os-ledger)

## 🎯 What is This?

The Editorial OS Ledger is the **state machine backbone** that enables autonomous AI agents to coordinate campaign execution, track performance, learn patterns, and generate VP reports.

Unlike traditional tools, this Ledger is purpose-built for **AI agent orchestration** using the MCP (Model Context Protocol).

## 🏗️ Architecture

```
Chat User: "Launch Europe eSIM campaign"
     ↓
Chat Orchestrator 
     ↓ (MCP calls)
Editorial OS Ledger ← Coordinates → Autonomous Agents
     ↓                               ↓
Supabase Database              External Tools
                              (Beehiiv, Buffer, etc.)
```

**Three Layers:**
- **Layer 1:** AI Agents (brief-specialist, newsletter-agent, etc.)
- **Layer 2:** MCP Protocol (this Ledger provides the bridge)
- **Layer 3:** External Tools (Beehiiv, Buffer, Notion, etc.)

## 🚀 Quick Start

**1. Deploy in 10 minutes:**
```bash
git clone your-repo
cd editorial-os-ledger
# Follow DEPLOYMENT.md
```

**2. Test MCP integration:**
```bash
curl https://your-ledger.vercel.app/api/mcp
```

**3. Connect to your Chat Orchestrator:**
```javascript
const LEDGER_URL = 'https://your-ledger.vercel.app';
// Start making MCP calls
```

## 🎮 Editorial OS Levels

This Ledger supports the full Editorial OS progression:

### Level 3: Simple Track
- ✅ Campaign creation and status tracking
- ✅ Agent coordination via MCP
- ✅ Basic execution logging

### Level 4: Connected Track  
- ✅ External tool integration (Beehiiv, Buffer)
- ✅ Performance metrics storage
- ✅ Multi-channel orchestration

### Level 5: Autonomous Agent
- ✅ Learning patterns storage and retrieval
- ✅ Performance analysis and insights
- ✅ VP report generation
- ✅ Continuous improvement loops

## 🔌 MCP Actions

**Campaign Management:**
```javascript
await mcp('create_campaign', {project_name: 'Europe eSIM', channels: ['email']})
await mcp('update_status', {ledger_id: 'LED-123', status: 'scheduled'})
await mcp('get_campaign', {ledger_id: 'LED-123'})
```

**Performance Tracking:**
```javascript
await mcp('store_metrics', {ledger_id: 'LED-123', metrics: [{type: 'open_rate', value: 0.23}]})
await mcp('get_performance_history', {metric_type: 'open_rate', limit: 50})
```

**Learning Patterns (Level 5):**
```javascript
await mcp('get_learned_patterns', {agent_name: 'newsletter-agent'})
await mcp('store_learned_pattern', {pattern_rule: 'Question subjects: +23% open rate'})
```

[**See full MCP API reference →**](DEPLOYMENT.md#-available-mcp-actions)

## 📊 Database Schema

**6 Core Tables:**
- `campaigns` - Campaign state and lifecycle
- `campaign_events` - Timeline and audit trail  
- `campaign_metrics` - Performance data
- `learned_patterns` - AI learning and insights
- `campaign_assets` - Asset management
- `external_executions` - Tool integration logs

**Optimized for:**
- ⚡ Fast MCP queries (proper indexing)
- 🔍 Agent coordination (shared state)
- 📈 Performance analysis (metrics aggregation)
- 🧠 Learning patterns (confidence scoring)

## 🎯 Agent Coordination Example

```javascript
// Brief Specialist Agent creates campaign
await ledger.mcp('create_campaign', {
  project_name: 'Europe eSIM Launch',
  brief_id: 'BRF-2026-001',
  channels: ['email', 'social']
})

// Newsletter Agent reads campaign state
const campaign = await ledger.mcp('get_campaign', {ledger_id: 'LED-123'})

// Newsletter Agent updates execution progress  
await ledger.mcp('update_execution_progress', {
  ledger_id: 'LED-123',
  agent: 'newsletter-agent', 
  progress_data: {newsletter_draft_complete: true}
})

// Social Engine reads updated state and coordinates
await ledger.mcp('log_agent_action', {
  ledger_id: 'LED-123',
  action_type: 'social_scheduled',
  agent_name: 'social-engine'
})
```

## 🔧 Configuration

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Optional Integrations:**
```bash
BEEHIIV_API_KEY=your-key          # Newsletter execution
BUFFER_ACCESS_TOKEN=your-token    # Social scheduling
NOTION_API_KEY=your-key           # Custom client integration
```

[**See full configuration guide →**](DEPLOYMENT.md#-configuration)

## 🎛️ Client Customization

**Week 2+ Extension Pattern:**
```typescript
// Add custom MCP action for client needs
EXTENDED_MCP_ACTIONS['sync_notion_tasks'] = async (params) => {
  // Custom Notion integration logic
  const tasks = await fetchNotionTasks(params.database_id);
  return { synced: true, tasks_count: tasks.length };
};
```

**Supports:**
- ✅ Custom agent integrations
- ✅ Client-specific tool connections  
- ✅ Domain-specific workflows
- ✅ No core system changes required

## 📈 Performance & Scale

**Optimized for:**
- 🚀 **Sub-100ms MCP responses** (indexed database queries)
- 📊 **1000+ campaigns** (efficient pagination and filtering)  
- 🧠 **Learning at scale** (pattern confidence scoring)
- 🔄 **Concurrent agents** (race condition handling)

**Monitoring:**
- Response time logging
- MCP action success rates
- Database performance metrics
- Agent coordination health

## 🔐 Security

**Production Features:**
- 🔑 MCP API key authentication
- 🌐 CORS origin restrictions
- 🛡️ Input validation and sanitization
- 📝 Comprehensive audit logging
- 🔒 Row-level security (optional)

## 🆘 Troubleshooting

**Common Issues:**
- **Campaign not found** → Check ledger_id exists
- **MCP action unknown** → Verify action name spelling  
- **Database connection** → Check Supabase credentials
- **CORS errors** → Configure allowed origins

[**See full troubleshooting guide →**](DEPLOYMENT.md#-troubleshooting)

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete setup guide
- **[Database Schema](database/schema.sql)** - Full schema with comments
- **[Environment Config](.env.example)** - All configuration options

## 🏢 Editorial OS Ecosystem

**Part of Editorial OS:**
- 🗣️ **Chat Orchestrator** - Natural language interface
- 🤖 **AI Agents** - Autonomous execution (brief-specialist, newsletter-agent, etc.)
- 🛠️ **Tools Layer** - External integrations (Beehiiv, Buffer, etc.)
- 📊 **This Ledger** - State coordination and learning

## 📞 Support

**Getting Help:**
1. Check [Deployment Guide](DEPLOYMENT.md)
2. Test MCP actions individually  
3. Verify Supabase connection
4. Check Vercel deployment logs

## 🎯 What's Next?

**After deploying the Ledger:**
1. ✅ Connect your Chat Orchestrator
2. 🤖 Deploy autonomous agents (brief-specialist, newsletter-agent)
3. 🔌 Add external tool integrations (Beehiiv, Buffer)
4. 📊 Enable learning loops (Level 5)
5. 📈 Generate VP reports

---

## 🚀 Deploy Now

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/editorial-os-ledger)

**Built for Editorial OS Level 3-5. Ready for autonomous AI teams.**

---

*Editorial OS: The AI-first operating system for content and communications teams.*