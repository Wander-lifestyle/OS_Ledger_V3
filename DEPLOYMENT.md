# EDITORIAL OS LEDGER - DEPLOYMENT GUIDE

**Complete orchestration-native Ledger for Editorial OS Level 3-5 autonomous agent coordination.**

## 🚀 Quick Deploy (10 minutes)

### Prerequisites
- ✅ Supabase account and project
- ✅ Vercel account  
- ✅ GitHub account

### Step 1: Set Up Database (3 minutes)

1. **Create Supabase Project**
   ```bash
   # Go to: https://supabase.com/dashboard
   # Click "New Project"
   # Note your project URL and service role key
   ```

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and paste the entire `database/schema.sql` file
   - Click "Run" - this creates all tables and indexes

3. **Verify Setup**
   - Go to Table Editor
   - You should see: `campaigns`, `campaign_events`, `campaign_metrics`, `learned_patterns`, etc.
   - Sample data should be inserted automatically

### Step 2: Deploy to Vercel (5 minutes)

1. **Push to GitHub**
   ```bash
   # Create new repo on GitHub
   git init
   git add .
   git commit -m "Editorial OS Ledger - orchestration-native"
   git remote add origin https://github.com/YOUR-USERNAME/editorial-os-ledger.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Vercel auto-detects Next.js settings

3. **Set Environment Variables**
   ```bash
   # In Vercel dashboard → Settings → Environment Variables
   NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your ledger is live at: `https://your-project.vercel.app`

### Step 3: Test MCP Integration (2 minutes)

1. **Health Check**
   ```bash
   curl https://your-project.vercel.app/api/mcp
   
   # Should return:
   {
     "success": true,
     "service": "editorial-os-ledger",
     "version": "3.0.0",
     "mcp_actions": ["create_campaign", "get_campaign", ...]
   }
   ```

2. **Test Campaign Creation**
   ```bash
   curl -X POST https://your-project.vercel.app/api/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "action": "create_campaign",
       "params": {
         "project_name": "Test Campaign",
         "channels": ["email", "social"]
       }
     }'
   
   # Should return campaign data with ledger_id
   ```

3. **Verify in Supabase**
   - Go to Supabase Table Editor → `campaigns`
   - Your test campaign should appear

## 🔌 Connect to Chat Orchestrator

Your Chat Orchestrator can now call the Ledger:

```javascript
// In your orchestrator code
const LEDGER_URL = 'https://your-ledger.vercel.app';

// Create campaign
const response = await fetch(`${LEDGER_URL}/api/mcp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create_campaign',
    params: {
      project_name: 'Europe eSIM Campaign',
      brief_id: 'BRF-2026-001',
      channels: ['email', 'social'],
      status: 'intake'
    }
  })
});

const result = await response.json();
// result.data contains campaign with ledger_id
```

## 🎯 Available MCP Actions

### Core Campaign Management
- `create_campaign` - Create new campaign
- `get_campaign` - Retrieve campaign details
- `list_campaigns` - List campaigns with filters
- `update_status` - Update campaign status
- `delete_campaign` - Remove campaign

### Agent Coordination (Level 3-5)
- `log_agent_action` - Log agent activity
- `get_campaign_timeline` - Get event timeline
- `update_execution_progress` - Track progress

### Performance Metrics (Level 4-5)
- `store_metrics` - Store performance data
- `get_metrics` - Retrieve metrics
- `get_performance_history` - Historical performance

### Learning Patterns (Level 5)
- `get_learned_patterns` - Get learned patterns
- `store_learned_pattern` - Store new pattern
- `update_pattern_confidence` - Update confidence

### VP Reporting (Level 5)
- `generate_report_data` - Generate VP reports
- `get_weekly_summary` - Weekly summary

### Asset Management
- `attach_asset` - Link assets to campaigns
- `list_assets` - List campaign assets

### External Tool Integration
- `log_external_execution` - Log tool executions
- `sync_external_status` - Sync tool status

## 📊 Database Schema

The Ledger uses 6 core tables:

```sql
campaigns          -- Core campaign state
campaign_events    -- Timeline and debugging
campaign_metrics   -- Performance tracking  
learned_patterns   -- Level 5 intelligence
campaign_assets    -- Asset management
external_executions -- Tool integration
```

All tables are optimized with proper indexes for performance.

## 🔧 Configuration

### Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

**Optional (Level 4-5):**
- `BEEHIIV_API_KEY` - Newsletter integration
- `BUFFER_ACCESS_TOKEN` - Social media integration  
- `NOTION_API_KEY` - Custom client integration
- `SLACK_WEBHOOK_URL` - Notifications

### Security (Production)
- Set `MCP_API_KEY` to secure MCP endpoints
- Configure `ALLOWED_ORIGINS` for CORS
- Use strong `JWT_SECRET` if implementing auth

## 🎮 Development

### Local Development
```bash
git clone your-repo
cd editorial-os-ledger
npm install
cp .env.example .env.local
# Fill in your Supabase credentials
npm run dev
```

### Testing
```bash
npm run test          # Run tests
npm run type-check    # TypeScript validation
npm run lint          # Code linting
```

### Database Management
```bash
# Reset database (WARNING: Deletes all data)
# Run schema.sql in Supabase SQL Editor to recreate
```

## 📈 Monitoring

### Health Checks
- `GET /api/mcp` - Service health
- `GET /health` - Alias for health check

### Logging
- All MCP actions are logged with timing
- Campaign events create audit trail
- Enable `DEBUG=true` for verbose logging

### Performance
- Database queries are indexed
- Response times logged
- Enable monitoring with Sentry/LogTail

## 🔄 Client Customization (Week 2+)

Add custom MCP actions for client-specific needs:

```typescript
// In app/api/mcp/route.ts
EXTENDED_MCP_ACTIONS['sync_notion_tasks'] = async function(params) {
  // Custom Notion integration logic
  return { synced: true };
};
```

## 🆘 Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Check `.env.local` has correct Supabase URL and key
- Restart dev server after adding variables

**"Campaign not found" errors**
- Verify ledger_id exists in campaigns table
- Check database connection

**MCP action not found**
- Verify action name matches exactly
- Check CORE_MCP_ACTIONS or EXTENDED_MCP_ACTIONS

**CORS errors**
- Add your orchestrator domain to `ALLOWED_ORIGINS`
- Check Next.js headers configuration

### Debug Mode
```bash
# Enable detailed logging
DEBUG=true npm run dev

# Check specific MCP action
curl -X POST localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"action": "get_campaign", "params": {"ledger_id": "LED-123"}}'
```

## 🚀 Production Checklist

- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Health check passes
- [ ] MCP actions tested
- [ ] Chat orchestrator connected
- [ ] Monitoring enabled
- [ ] Backups configured (optional)
- [ ] Security headers configured
- [ ] Rate limiting enabled (optional)

## 📞 Support

For Editorial OS support:
- Check logs in Vercel dashboard
- Verify Supabase table data
- Test MCP actions individually
- Check network connectivity between services

---

**🎯 You now have a production-ready, orchestration-native Ledger that supports Editorial OS Level 3-5 autonomous agent coordination!**

**Next:** Connect your Chat Orchestrator and start building autonomous agents.