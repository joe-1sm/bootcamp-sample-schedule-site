/**
 * 1SM Bootcamp Calendar API Worker
 * 
 * Proxies requests to Airtable, keeping API keys secure on the server.
 * Filters events based on:
 * - bootcamp_course = 'wbc25'
 * - For async_assignments: only shows if studentId matches idN_student_assignment
 */

// CORS headers - whitelist your domains
const ALLOWED_ORIGINS = [
  'https://joe-1sm.github.io',
  'https://mcat.live',
  'https://www.mcat.live',
  'http://localhost:8000',  // For local development
  'http://localhost:8080',
  'http://localhost:8888',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:8888',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const url = new URL(request.url);
      const studentEmail = url.searchParams.get('studentEmail');

      // Fetch all CC-1 records for wbc25 bootcamp
      const events = await fetchAirtableEvents(env, studentEmail);

      return new Response(JSON.stringify({ events, studentEmail }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60', // 1 minute cache
        },
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch events', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

/**
 * Fetch events from Airtable CC-1 table
 */
async function fetchAirtableEvents(env, studentEmail) {
  const baseId = env.AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_TOKEN;
  
  // Fields to fetch from CC-1
  // Note: Some lookup fields may have different names - verify with Airtable
  const fields = [
    'Name',
    'Start Date / Time',
    'End Date / Time',
    'live_or_assignment',
    'Zoom link',
    'Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))',
    'Assignments & Review',
    'Meeting Video',
    'LIVE',
    'idN_student_assignment',
    'bootcamp_course',
    // Linked record fields for resources (if they exist in CC-1)
    // 'aamc_passages',
    // 'aamc_resource (from aamc_passages)', 
    // 'aamc_questions (from aamc_passages)',
    // '1sm_passages',
    // '1sm_questions (from 1sm_passages)',
    // '1sm_resource (from 1sm_passages)',
  ];

  // Build the Airtable API URL with formula filter
  // Filter: records linked to 'wbc25' in bootcamp_course AND LIVE checkbox is checked
  const filterFormula = `AND(FIND("wbc25", ARRAYJOIN({bootcamp_course})), {LIVE})`;
  
  const params = new URLSearchParams({
    filterByFormula: filterFormula,
    'sort[0][field]': 'Start Date / Time',
    'sort[0][direction]': 'asc',
  });
  
  // Add fields to params
  fields.forEach((field, index) => {
    params.append(`fields[${index}]`, field);
  });

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/CC-1?${params.toString()}`;

  // Fetch all pages (Airtable paginates at 100 records)
  let allRecords = [];
  let offset = null;

  do {
    const fetchUrl = offset ? `${airtableUrl}&offset=${offset}` : airtableUrl;
    
    const response = await fetch(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  // Transform and filter records
  const events = allRecords
    .map(record => transformRecord(record))
    .filter(event => filterEvent(event, studentEmail));

  return events;
}

/**
 * Convert Airtable Markdown to HTML
 * Handles: **bold**, *italic*, and newlines
 */
function markdownToHtml(text) {
  if (!text) return '';
  
  return text
    // Convert **bold** to <strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Convert double newlines to paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Convert single newlines to <br>
    .replace(/\n/g, '<br>')
    // Wrap in paragraph tags if we added any
    .replace(/^(.*)$/, (match) => {
      if (match.includes('</p><p>')) {
        return '<p>' + match + '</p>';
      }
      return match;
    });
}

/**
 * Transform Airtable record to frontend-friendly format
 */
function transformRecord(record) {
  const fields = record.fields;
  
  // Determine event type
  const liveOrAssignment = fields['live_or_assignment'];
  let type = 'live'; // default
  if (Array.isArray(liveOrAssignment)) {
    type = liveOrAssignment[0] === 'async_assignment' ? 'homework' : 'live';
  } else if (typeof liveOrAssignment === 'string') {
    type = liveOrAssignment === 'async_assignment' ? 'homework' : 'live';
  }

  // Get zoom link (prefer direct link, fallback to tutor's personal room)
  const zoomLink = fields['Zoom link'] || 
    (Array.isArray(fields['Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))']) 
      ? fields['Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))'][0] 
      : fields['Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))']);

  // Parse start/end times
  const startDateTime = fields['Start Date / Time'];
  const endDateTime = fields['End Date / Time'];
  
  // Extract day of week and time from datetime
  // Use America/New_York (EST/EDT) timezone for display
  const timezone = 'America/New_York';
  let day = '';
  let start = '';
  let end = '';
  
  if (startDateTime) {
    const startDate = new Date(startDateTime);
    day = startDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });
    start = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone });
  }
  
  if (endDateTime) {
    const endDate = new Date(endDateTime);
    end = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone });
  }

  return {
    id: record.id,
    title: fields['Name'] || 'Untitled Event',
    day,
    start,
    end,
    startDateTime,
    endDateTime,
    type,
    zoomLink: zoomLink || null,
    description: markdownToHtml(fields['Assignments & Review'] || ''),
    videoUrl: fields['Meeting Video'] || null,
    // Student assignment info (for filtering)
    studentAssignmentIds: fields['idN_student_assignment'] || [],
    studentEmails: fields['Student Email (from student_assignment)'] || [],
    // AAMC resources
    aamcPassages: fields['aamc_passages'] || [],
    aamcResources: fields['aamc_resource (from aamc_passages)'] || [],
    aamcQuestions: fields['aamc_questions (from aamc_passages)'] || [],
    // 1SM resources
    oneSmPassages: fields['1sm_passages'] || [],
    oneSmQuestions: fields['1sm_questions (from 1sm_passages)'] || [],
    oneSmResources: fields['1sm_resource (from 1sm_passages)'] || [],
  };
}

/**
 * Filter events based on type and student assignment
 * - Live events: show all
 * - Homework events: only show if assigned to this student (by email)
 */
function filterEvent(event, studentEmail) {
  // Always show live events
  if (event.type === 'live') {
    return true;
  }

  // For homework/async assignments:
  // If no studentEmail provided, don't show any assignments
  if (!studentEmail) {
    return false;
  }

  // Check if this student's email is in the assigned emails
  const assignedEmails = event.studentEmails || [];
  const emailLower = studentEmail.toLowerCase();

  if (Array.isArray(assignedEmails)) {
    return assignedEmails.some(email => 
      email && email.toLowerCase() === emailLower
    );
  }

  return false;
}

