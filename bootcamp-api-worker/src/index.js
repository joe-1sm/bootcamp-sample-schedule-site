/**
 * 1SM Bootcamp Calendar API Worker
 * 
 * Proxies requests to Airtable, keeping API keys secure on the server.
 * 
 * Data sources:
 * - CC-1 table: Live sessions (filtered by bootcamp_course = 'wbc25' and LIVE checkbox)
 * - Assignments table: Homework/assignments (filtered by student email)
 * - potential_Assignments table: Assignment bank for self-service
 * - Student Roster table: Student lookup by email
 * 
 * Endpoints:
 * - GET /                     - Calendar events (live + assigned homework)
 * - GET /potential-assignments - Assignment bank with filtering
 * - GET /student-lookup       - Look up student record ID by email
 * - POST /assignments         - Create new assignment for student
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: GET / - Calendar events
      if (request.method === 'GET' && (path === '/' || path === '')) {
        return await handleGetEvents(request, env, corsHeaders);
      }

      // Route: GET /potential-assignments - Assignment bank
      if (request.method === 'GET' && path === '/potential-assignments') {
        return await handleGetPotentialAssignments(request, env, corsHeaders);
      }

      // Route: GET /student-lookup - Look up student by email
      if (request.method === 'GET' && path === '/student-lookup') {
        return await handleStudentLookup(request, env, corsHeaders);
      }

      // Route: POST /assignments - Create new assignment
      if (request.method === 'POST' && path === '/assignments') {
        return await handleCreateAssignment(request, env, corsHeaders);
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// ============================================
// ROUTE HANDLERS
// ============================================

/**
 * GET / - Fetch calendar events (live sessions + assigned homework)
 */
async function handleGetEvents(request, env, corsHeaders) {
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
      'Cache-Control': 'public, max-age=60',
    },
  });
}

/**
 * GET /potential-assignments - Fetch assignment bank with optional filters
 * Query params:
 *   - studentEmail: exclude already-assigned items
 *   - assignmentType: filter by assignment_type field
 *   - subjects: filter by subjects field (comma-separated)
 *   - questionSource: filter by question_source field
 */
async function handleGetPotentialAssignments(request, env, corsHeaders) {
  const url = new URL(request.url);
  const studentEmail = url.searchParams.get('studentEmail');
  const assignmentType = url.searchParams.get('assignmentType');
  const subjects = url.searchParams.get('subjects');
  const questionSource = url.searchParams.get('questionSource');

  const filters = {
    assignmentType,
    subjects: subjects ? subjects.split(',').map(s => s.trim()) : null,
    questionSource,
  };

  const potentialAssignments = await fetchPotentialAssignments(env, filters, studentEmail);

  return new Response(JSON.stringify({ 
    assignments: potentialAssignments,
    filters,
    studentEmail,
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
}

/**
 * GET /student-lookup - Look up student record ID by email
 * Query params:
 *   - email: student email address
 */
async function handleStudentLookup(request, env, corsHeaders) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email parameter required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const student = await lookupStudentByEmail(env, email);

  if (!student) {
    return new Response(JSON.stringify({ error: 'Student not found', email }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ student }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * POST /assignments - Create a new assignment for a student
 * Body:
 *   - title: string (required)
 *   - studentRecordId: string (required) - Airtable record ID from Student Roster
 *   - startDateTime: ISO string (required)
 *   - endDateTime: ISO string (required)
 *   - sourcePotentialAssignmentId: string (optional) - link to potential_Assignments
 *   - description: string (optional)
 *   - getStartedLink: string (optional)
 *   - estimatedTime: number (optional) - duration in seconds
 *   - assignmentType: string (optional)
 *   - subjects: array (optional)
 *   - questionSource: string (optional)
 *   - attachments: array (optional) - array of {url, filename}
 */
async function handleCreateAssignment(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate required fields
  const { title, studentRecordId, startDateTime, endDateTime } = body;
  if (!title || !studentRecordId || !startDateTime || !endDateTime) {
    return new Response(JSON.stringify({ 
      error: 'Missing required fields',
      required: ['title', 'studentRecordId', 'startDateTime', 'endDateTime'],
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const newAssignment = await createAssignment(env, body);

  return new Response(JSON.stringify({ 
    success: true,
    assignment: newAssignment,
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

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

// ============================================
// POTENTIAL ASSIGNMENTS (Assignment Bank)
// ============================================

/**
 * Fetch potential assignments from potential_Assignments table
 * With optional filtering and exclusion of already-assigned items
 */
async function fetchPotentialAssignments(env, filters, studentEmail) {
  const baseId = env.AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_TOKEN;
  
  const fields = [
    'title',
    'assignment_type',
    'subjects',
    'question_source',
    'estimated_time',
    'get_started_link',
    'student_side_description',
    'Attachments',
    // Linked source tables
    'aamc_passages',
    'uworld_test',
    '1sm_resources',
    // UWorld details (lookups from uworld_test link)
    'uworld_test_id_lookup',
    'qid_string_lookup',
  ];

  // Build filter formula
  const filterParts = [];
  
  if (filters.assignmentType && filters.assignmentType !== 'all') {
    filterParts.push(`{assignment_type} = "${filters.assignmentType}"`);
  }
  
  if (filters.questionSource && filters.questionSource !== 'all') {
    if (filters.questionSource === 'none') {
      // "No MCAT-style questions" - exclude mcat-style
      filterParts.push(`{assignment_type} != "mcat-style"`);
    } else {
      filterParts.push(`{question_source} = "${filters.questionSource}"`);
    }
  }
  
  // Subjects filter (multiple select - check if any selected subject is in the field)
  if (filters.subjects && filters.subjects.length > 0) {
    const subjectFilters = filters.subjects.map(subject => 
      `FIND("${subject}", ARRAYJOIN({subjects}))`
    );
    filterParts.push(`OR(${subjectFilters.join(', ')})`);
  }

  const params = new URLSearchParams({
    'sort[0][field]': 'title',
    'sort[0][direction]': 'asc',
  });

  if (filterParts.length > 0) {
    params.set('filterByFormula', `AND(${filterParts.join(', ')})`);
  }
  
  fields.forEach((field, index) => {
    params.append(`fields[${index}]`, field);
  });

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/potential_Assignments?${params.toString()}`;
  const records = await fetchAllPages(airtableUrl, token);

  // Transform records
  let potentialAssignments = records.map(record => transformPotentialAssignment(record));

  // If student email provided, exclude already-assigned items
  if (studentEmail) {
    const assignedIds = await getAssignedPotentialIds(env, studentEmail);
    potentialAssignments = potentialAssignments.filter(
      assignment => !assignedIds.includes(assignment.sourcePotentialId)
    );
  }

  return potentialAssignments;
}

/**
 * Transform potential_Assignments record
 */
function transformPotentialAssignment(record) {
  const fields = record.fields;

  // Convert duration (seconds) to human-readable format
  let estimatedTimeDisplay = '';
  const durationSeconds = fields['estimated_time'];
  if (durationSeconds) {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    if (hours > 0 && minutes > 0) {
      estimatedTimeDisplay = `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      estimatedTimeDisplay = `${hours}h`;
    } else {
      estimatedTimeDisplay = `${minutes}m`;
    }
  }

  return {
    id: record.id,
    title: fields['title'] || 'Untitled',
    assignmentType: fields['assignment_type'] || null,
    subjects: fields['subjects'] || [],
    questionSource: fields['question_source'] || null,
    estimatedTime: durationSeconds || null,
    estimatedTimeDisplay,
    getStartedLink: fields['get_started_link'] || null,
    description: markdownToHtml(fields['student_side_description'] || ''),
    descriptionRaw: fields['student_side_description'] || '',
    attachments: fields['Attachments'] || [],
    // Source links
    aamcPassageIds: fields['aamc_passages'] || [],
    uworldTestIds: fields['uworld_test'] || [],
    oneSmResourceIds: fields['1sm_resources'] || [],
    // UWorld details
    uworldTestId: fields['uworld_test_id_lookup'] ? fields['uworld_test_id_lookup'][0] : null,
    uworldQidString: fields['qid_string_lookup'] ? fields['qid_string_lookup'][0] : null,
    // For tracking
    sourcePotentialId: record.id,
  };
}

/**
 * Get IDs of potential assignments already assigned to a student
 */
async function getAssignedPotentialIds(env, studentEmail) {
  const baseId = env.AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_TOKEN;

  // Fetch assignments for this student that have a source_potential_assignment link
  const fields = ['source_potential_assignment', 'student_email_addresses'];
  
  const params = new URLSearchParams({
    filterByFormula: `NOT({source_potential_assignment} = BLANK())`,
  });
  
  fields.forEach((field, index) => {
    params.append(`fields[${index}]`, field);
  });

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/Assignments?${params.toString()}`;
  const records = await fetchAllPages(airtableUrl, token);

  // Filter by student email and extract source IDs
  const emailLower = studentEmail.toLowerCase();
  const assignedIds = [];

  for (const record of records) {
    const emails = record.fields['student_email_addresses'] || [];
    const isAssignedToStudent = emails.some(e => e && e.toLowerCase() === emailLower);
    
    if (isAssignedToStudent) {
      const sourceIds = record.fields['source_potential_assignment'] || [];
      assignedIds.push(...sourceIds);
    }
  }

  return assignedIds;
}

// ============================================
// STUDENT LOOKUP
// ============================================

/**
 * Look up student record by email from Student Roster table
 */
async function lookupStudentByEmail(env, email) {
  const baseId = env.AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_TOKEN;

  const fields = ['Student Name', 'Student Email'];
  
  const params = new URLSearchParams({
    filterByFormula: `LOWER({Student Email}) = "${email.toLowerCase()}"`,
    maxRecords: '1',
  });
  
  fields.forEach((field, index) => {
    params.append(`fields[${index}]`, field);
  });

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/Student%20Roster?${params.toString()}`;
  
  const response = await fetch(airtableUrl, {
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
  
  if (data.records.length === 0) {
    return null;
  }

  const record = data.records[0];
  return {
    id: record.id,
    name: record.fields['Student Name'] || '',
    email: record.fields['Student Email'] || '',
  };
}

// ============================================
// CREATE ASSIGNMENT
// ============================================

/**
 * Create a new assignment in the Assignments table
 */
async function createAssignment(env, data) {
  const baseId = env.AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_TOKEN;

  // Build the record fields
  const fields = {
    'title': data.title,
    'student': [data.studentRecordId], // Linked record to Student Roster
    'start_date_time': data.startDateTime,
    'end_date_time': data.endDateTime,
  };

  // Optional fields
  if (data.sourcePotentialAssignmentId) {
    fields['source_potential_assignment'] = [data.sourcePotentialAssignmentId];
  }
  if (data.description) {
    fields['student_side_description'] = data.description;
  }
  if (data.getStartedLink) {
    fields['get_started_link'] = data.getStartedLink;
  }
  if (data.estimatedTime) {
    fields['estimated_time'] = data.estimatedTime;
  }
  if (data.assignmentType) {
    fields['assignment_type'] = data.assignmentType;
  }
  if (data.subjects && data.subjects.length > 0) {
    fields['subjects'] = data.subjects;
  }
  if (data.questionSource) {
    fields['question_source'] = data.questionSource;
  }
  if (data.attachments && data.attachments.length > 0) {
    fields['Attachments'] = data.attachments;
  }

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/Assignments`;
  
  const response = await fetch(airtableUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  return {
    id: result.id,
    title: result.fields['title'],
    startDateTime: result.fields['start_date_time'],
    endDateTime: result.fields['end_date_time'],
  };
}
