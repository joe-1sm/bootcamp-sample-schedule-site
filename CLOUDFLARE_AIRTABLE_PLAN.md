# Cloudflare Worker + Airtable Integration Plan

## Overview

Replace hardcoded Zoom links and event data in `script.js` with dynamic data fetched from Airtable via a secure Cloudflare Worker proxy.

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────┐
│  Frontend       │────▶│  Cloudflare Worker  │────▶│  Airtable   │
│  (script.js)    │     │  (API Proxy)        │     │  (Database) │
│                 │◀────│  - Hides API Key    │◀────│             │
└─────────────────┘     │  - Transforms Data  │     └─────────────┘
                        └─────────────────────┘
```

**Why This Architecture?**
- Airtable API key stays on the server (Cloudflare Worker), never exposed to browser
- Cloudflare Workers are fast, globally distributed, and have a generous free tier
- Can transform/filter data before sending to frontend
- Can add caching to reduce Airtable API calls

---

## What I Need From You

### 1. Cloudflare Account Access
- [ ] Cloudflare account with Workers enabled (free tier is fine)
- [ ] Your Cloudflare Account ID (found in dashboard URL or Workers overview)

### 2. Airtable Setup
- [ ] Airtable Personal Access Token (create at https://airtable.com/create/tokens)
  - Needs `data.records:read` scope
  - Should have access to your bootcamp base
- [ ] Base ID (found in Airtable API docs or URL: `https://airtable.com/BASE_ID/...`)
- [ ] Table Name (the exact name of the table containing events)

### 3. Airtable Table Structure
Please confirm/share your table structure. I'm assuming something like:

| Field Name    | Type            | Example Value                                    |
|---------------|-----------------|--------------------------------------------------|
| Title         | Single line     | "CP Section Dissection"                          |
| Day           | Single select   | "Monday"                                         |
| Start Time    | Single line     | "10:00"                                          |
| End Time      | Single line     | "11:30"                                          |
| Type          | Single select   | "live" / "homework"                              |
| Zoom Link     | URL             | "https://us02web.zoom.us/j/..."                  |
| Description   | Long text       | "In this session we will..."                     |

**Questions:**
- Is this structure accurate?
- Are there additional fields we should include?
- Should we filter by date/week (e.g., only show current week's events)?

---

## Implementation Steps

### Phase 1: Create the Cloudflare Worker

1. **Install Wrangler CLI** (Cloudflare's tool)
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Create Worker Project**
   ```bash
   mkdir bootcamp-api-worker
   cd bootcamp-api-worker
   wrangler init
   ```

3. **Worker Code** will:
   - Accept requests from your frontend
   - Fetch data from Airtable using the secret API key
   - Transform data to match your frontend's expected format
   - Return JSON response with CORS headers

4. **Set Secrets** (API key stored securely)
   ```bash
   wrangler secret put AIRTABLE_TOKEN
   wrangler secret put AIRTABLE_BASE_ID
   ```

5. **Deploy**
   ```bash
   wrangler deploy
   ```
   This gives you a URL like: `https://bootcamp-api.YOUR_SUBDOMAIN.workers.dev`

### Phase 2: Update Frontend

1. **Modify `script.js`**:
   - Remove hardcoded events array
   - Add `fetch()` call to Cloudflare Worker on page load
   - Populate calendar dynamically from response

2. **Add Loading State**:
   - Show loading indicator while fetching
   - Handle errors gracefully

3. **Add Caching**:
   - Cache response in sessionStorage to avoid re-fetching on navigation
   - Set reasonable cache duration (5-15 minutes)

---

## Worker Code Preview

Here's what the Cloudflare Worker will look like:

```javascript
// src/index.js
export default {
  async fetch(request, env) {
    // CORS headers for your domain
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // We'll restrict this to your domain
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Fetch from Airtable
      const response = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Events`,
        {
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          },
        }
      );

      const data = await response.json();

      // Transform to match frontend format
      const events = data.records.map(record => ({
        title: record.fields.Title,
        day: record.fields.Day,
        start: record.fields['Start Time'],
        end: record.fields['End Time'],
        type: record.fields.Type,
        zoomLink: record.fields['Zoom Link'] || null,
        description: record.fields.Description || '',
      }));

      return new Response(JSON.stringify({ events }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 min cache
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch events' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
```

---

## Security Considerations

1. **API Key Protection**: Airtable token stored as Cloudflare secret, never in code
2. **CORS Restriction**: Limit to your specific domains (mcat.live, 1sourcemedicine.com)
3. **Rate Limiting**: Cloudflare Workers have built-in DDoS protection
4. **Caching**: Reduces Airtable API calls and improves performance

---

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Set up Cloudflare Worker | 30 min |
| 2 | Connect to Airtable | 15 min |
| 3 | Update frontend to fetch from Worker | 45 min |
| 4 | Testing & debugging | 30 min |
| **Total** | | **~2 hours** |

---

## Next Steps

Please provide:
1. ✅ Confirm you have a Cloudflare account
2. ✅ Your Airtable Personal Access Token
3. ✅ Your Airtable Base ID
4. ✅ Your table name and confirm field structure
5. ✅ Any domains to whitelist for CORS (mcat.live, etc.)

Once I have these, I can build and deploy the worker, then update your frontend to use it!

