# 1SM Bootcamp Calendar API Worker

Cloudflare Worker that proxies requests to Airtable, keeping API keys secure on the server.

## Features

- Fetches bootcamp events from Airtable CC-1 table
- Filters by `bootcamp_course = 'wbc25'`
- User-specific filtering for async assignments (only shows if `studentId` matches)
- CORS protection (only allows requests from whitelisted domains)
- Automatic pagination handling

## Setup

### 1. Install dependencies

```bash
cd bootcamp-api-worker
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

### 3. Set secrets

```bash
npx wrangler secret put AIRTABLE_TOKEN
# When prompted, paste your Airtable Personal Access Token

npx wrangler secret put AIRTABLE_BASE_ID
# When prompted, paste your Airtable Base ID
```

### 4. Deploy

```bash
npm run deploy
```

After deployment, you'll get a URL like:
```
https://bootcamp-calendar-api.<your-subdomain>.workers.dev
```

## Local Development

```bash
npm run dev
```

For local dev, you'll need to create a `.dev.vars` file:

```
AIRTABLE_TOKEN=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_airtable_base_id
```

## API Usage

### Endpoint

```
GET https://bootcamp-calendar-api.<subdomain>.workers.dev/?studentId=12345
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `studentId` | No | The student's idN from Student Roster. Required to see user-specific assignments. |

### Response

```json
{
  "events": [
    {
      "id": "rec123...",
      "title": "CP Section Dissection",
      "day": "Monday",
      "start": "10:00",
      "end": "11:30",
      "type": "live",
      "zoomLink": "https://zoom.us/...",
      "description": "...",
      "videoUrl": null,
      "aamcPassages": [],
      "aamcResources": [],
      "aamcQuestions": [],
      "oneSmPassages": [],
      "oneSmQuestions": [],
      "oneSmResources": []
    }
  ],
  "studentId": "12345"
}
```

## Frontend Integration

Update your embed URL in Softr:

```
https://joe-1sm.github.io/bootcamp-sample-schedule-site/?studentId={LOGGED_IN_USER:idN}
```

The frontend JavaScript reads this and calls the API:

```javascript
const params = new URLSearchParams(window.location.search);
const studentId = params.get('studentId');

const response = await fetch(
  `https://bootcamp-calendar-api.YOUR_SUBDOMAIN.workers.dev/?studentId=${studentId}`
);
const data = await response.json();
```

## Security Notes

- Airtable API token is stored as a Cloudflare secret (not in code)
- CORS restricts which domains can call this API
- studentId in URL is visible but low risk for a course calendar
- For stronger security, implement JWT verification with Softr later

