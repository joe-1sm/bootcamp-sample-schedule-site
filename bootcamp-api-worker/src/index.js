/**
 * 1SM Bootcamp Calendar API Worker
 * 
 * Proxies requests to Airtable, keeping API keys secure on the server.
 * 
 * Data sources:
 * - CC-1 table: Live sessions (filtered by bootcamp_course = 'wbc25' and LIVE checkbox)
 * - Assignments table: Homework/assignments (filtered by student email)
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

      // Fetch from both tables in parallel
      const [liveEvents, assignments] = await Promise.all([
        fetchLiveEvents(env),
        fetchAssignments(env, studentEmail),
      ]);

      // Combine and sort by start time
      const events = [...liveEvents, ...assignments].sort((a, b) => {
        if (!a.startDateTime) return 1;
        if (!b.startDateTime) return -1;
        return new Date(a.startDateTime) - new Date(b.startDateTime);
      });

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

// ============================================
// LIVE EVENTS (from CC-1 table)
// ============================================

/**
 * Fetch live events from Airtable CC-1 table
 */
async function fetchLiveEvents(env) {
  const baseId = env.AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_TOKEN;
  
  const fields = [
    'Name',
    'Start Date / Time',
    'End Date / Time',
    'Zoom link',
    'Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))',
    'Assignments & Review',
    'Meeting Video',
    'Video Embed Code',
    'LIVE',
    'bootcamp_course',
  ];

  // Filter: records linked to 'wbc25' in bootcamp_course AND LIVE checkbox is checked
  const filterFormula = `AND(FIND("wbc25", ARRAYJOIN({bootcamp_course})), {LIVE})`;
  
  const params = new URLSearchParams({
    filterByFormula: filterFormula,
    'sort[0][field]': 'Start Date / Time',
    'sort[0][direction]': 'asc',
  });
  
  fields.forEach((field, index) => {
    params.append(`fields[${index}]`, field);
  });

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/CC-1?${params.toString()}`;
  const records = await fetchAllPages(airtableUrl, token);

  return records.map(record => transformLiveEvent(record));
}

/**
 * Transform CC-1 record to live event format
 */
function transformLiveEvent(record) {
  const fields = record.fields;

  // Get zoom link (prefer direct link, fallback to tutor's personal room)
  const zoomLink = fields['Zoom link'] || 
    (Array.isArray(fields['Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))']) 
      ? fields['Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))'][0] 
      : fields['Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))']);

  const startDateTime = fields['Start Date / Time'];
  const endDateTime = fields['End Date / Time'];
  const { day, start, end } = parseDateTimes(startDateTime, endDateTime);

  return {
    id: record.id,
    title: fields['Name'] || 'Untitled Event',
    day,
    start,
    end,
    startDateTime,
    endDateTime,
    type: 'live',
    zoomLink: zoomLink || null,
    description: markdownToHtml(fields['Assignments & Review'] || ''),
    videoUrl: fields['Meeting Video'] || null,
    videoEmbedCode: fields['Video Embed Code'] || null,
    assignmentLink: null,
    studentEmails: [],
  };
}

// ============================================
// ASSIGNMENTS (from Assignments table)
// ============================================

/**
 * Fetch assignments from Airtable Assignments table
 */
async function fetchAssignments(env, studentEmail) {
  // If no student email, don't fetch assignments
  if (!studentEmail) {
    return [];
  }

  const baseId = env.AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_TOKEN;
  
  const fields = [
    'title',
    'start_date_time',
    'end_date_time',
    'student_side_description',
    'get_started_link',
    'student_email_addresses',
    // Resource fields (optional)
    '1sm_resources',
    'aamc_passages',
    'aamc_resource (from aamc_passages)',
    'aamc_questions (from aamc_passages)',
  ];

  // No filter - we'll filter client-side by student email
  const params = new URLSearchParams({
    'sort[0][field]': 'start_date_time',
    'sort[0][direction]': 'asc',
  });
  
  fields.forEach((field, index) => {
    params.append(`fields[${index}]`, field);
  });

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/Assignments?${params.toString()}`;
  const records = await fetchAllPages(airtableUrl, token);

  // Transform and filter by student email
  return records
    .map(record => transformAssignment(record))
    .filter(assignment => filterByStudentEmail(assignment, studentEmail));
}

/**
 * Transform Assignments record to homework event format
 */
function transformAssignment(record) {
  const fields = record.fields;

  const startDateTime = fields['start_date_time'];
  const endDateTime = fields['end_date_time'];
  const { day, start, end } = parseDateTimes(startDateTime, endDateTime);

  return {
    id: record.id,
    title: fields['title'] || 'Untitled Assignment',
    day,
    start,
    end,
    startDateTime,
    endDateTime,
    type: 'homework',
    zoomLink: null,
    description: markdownToHtml(fields['student_side_description'] || ''),
    videoUrl: null,
    videoEmbedCode: null,
    assignmentLink: fields['get_started_link'] || null,
    studentEmails: fields['student_email_addresses'] || [],
    // Resources
    oneSmResources: fields['1sm_resources'] || [],
    aamcPassages: fields['aamc_passages'] || [],
    aamcResources: fields['aamc_resource (from aamc_passages)'] || [],
    aamcQuestions: fields['aamc_questions (from aamc_passages)'] || [],
  };
}

/**
 * Filter assignment by student email
 */
function filterByStudentEmail(assignment, studentEmail) {
  if (!studentEmail) return false;
  
  const assignedEmails = assignment.studentEmails || [];
  const emailLower = studentEmail.toLowerCase();

  if (Array.isArray(assignedEmails)) {
    return assignedEmails.some(email => 
      email && email.toLowerCase() === emailLower
    );
  }

  return false;
}

// ============================================
// SHARED UTILITIES
// ============================================

/**
 * Fetch all pages from Airtable (handles pagination)
 */
async function fetchAllPages(baseUrl, token) {
  let allRecords = [];
  let offset = null;

  do {
    const fetchUrl = offset ? `${baseUrl}&offset=${offset}` : baseUrl;
    
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

  return allRecords;
}

/**
 * Parse start/end datetimes to day, start, end strings
 */
function parseDateTimes(startDateTime, endDateTime) {
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

  return { day, start, end };
}

/**
 * Convert Airtable Markdown to HTML
 */
function markdownToHtml(text) {
  if (!text) return '';
  
  return text
    // Convert **bold** to <strong> (must come before single *)
    .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
    // Convert __bold__ to <strong> (must come before single _)
    .replace(/__(.+?)__/gs, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    // Convert _italic_ to <em> (but not inside words like some_variable)
    .replace(/(?<![a-zA-Z0-9])_([^_]+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>')
    // Convert [link text](url) to <a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Convert bullet lists (- item)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> elements in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Convert double newlines to paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Convert single newlines to <br>
    .replace(/\n/g, '<br>')
    // Wrap in paragraph tags if content has paragraph breaks
    .replace(/^(.*)$/s, (match) => {
      if (match.includes('</p><p>')) {
        return '<p>' + match + '</p>';
      }
      return match;
    });
}
