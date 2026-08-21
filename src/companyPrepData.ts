export type PrepRoadmap = {
  duration: string;
  weeks: { label: string; focus: string; target: string }[];
  curatedPrep: { title: string; detail: string }[];
};

export type CompanyPrepItem = {
  id: string;
  name: string;
  region: string;
  hiringProcess: string[];
  pyqTopics: string[];
  interviewStyle: string;
  sampleQuestions: string[];
  prepNotes: string[];
  communityInsights: { title: string; detail: string }[];
  roadmap?: PrepRoadmap;
  faangRoadmap?: PrepRoadmap;
};

const faangRoadmaps: Record<string, PrepRoadmap> = {
  Google: {
    duration: '5-week loop',
    weeks: [
      { label: 'Week 1', focus: 'Core patterns', target: '20 timed array, graph, and tree problems; narrate complexity out loud.' },
      { label: 'Week 2', focus: 'Depth & correctness', target: 'Practice edge cases, proofs of correctness, and a clean second solution.' },
      { label: 'Week 3', focus: 'Design fundamentals', target: 'Complete 3 designs with APIs, data model, bottlenecks, and trade-offs.' },
      { label: 'Week 4', focus: 'Googleyness stories', target: 'Write 5 STAR stories on collaboration, ambiguity, and learning from failure.' },
      { label: 'Week 5', focus: 'Full-loop simulation', target: 'Run two coding mocks, one design mock, and one behavioral debrief.' }
    ],
    curatedPrep: [
      { title: 'Coding calibration', detail: 'Prioritise clear thinking, test cases, and explaining why your approach is optimal.' },
      { title: 'System design packet', detail: 'Practice search, storage, and high-throughput services with explicit assumptions.' },
      { title: 'Behavioral bank', detail: 'Prepare stories that show collaboration, resilience, and intellectual humility.' }
    ]
  },
  Meta: {
    duration: '4-week sprint',
    weeks: [
      { label: 'Week 1', focus: 'Speed on fundamentals', target: '25 medium problems across arrays, strings, trees, and graphs.' },
      { label: 'Week 2', focus: 'Interview execution', target: 'Solve in 35-minute blocks: clarify, code, test, then discuss variants.' },
      { label: 'Week 3', focus: 'Product-scale design', target: 'Design feeds, messaging, and notification systems with ranking or fan-out trade-offs.' },
      { label: 'Week 4', focus: 'Impact narrative', target: 'Rehearse 5 stories that show velocity, influence, and measurable user impact.' }
    ],
    curatedPrep: [
      { title: 'Rapid coding set', detail: 'Optimise for pattern recognition without skipping communication or test coverage.' },
      { title: 'Product systems lens', detail: 'Connect architecture choices to growth, engagement, latency, and reliability.' },
      { title: 'Execution stories', detail: 'Show how you moved quickly while keeping partners aligned and quality high.' }
    ]
  },
  Amazon: {
    duration: '5-week loop',
    weeks: [
      { label: 'Week 1', focus: 'Leadership Principles', target: 'Map 2 distinct STAR stories to each likely principle; include metrics.' },
      { label: 'Week 2', focus: 'Coding & OA readiness', target: 'Practice implementation-heavy mediums and explain the customer impact.' },
      { label: 'Week 3', focus: 'Design under constraints', target: 'Design durable services with idempotency, monitoring, cost, and failure recovery.' },
      { label: 'Week 4', focus: 'Bar raiser practice', target: 'Pressure-test ownership stories with follow-up questions and contrary evidence.' },
      { label: 'Week 5', focus: 'Loop rehearsal', target: 'Run a full behavioral, coding, and design sequence with written debriefs.' }
    ],
    curatedPrep: [
      { title: 'LP story matrix', detail: 'Avoid reusing one anecdote everywhere—prepare specific evidence for each principle.' },
      { title: 'Operational design', detail: 'Make alarms, retries, data integrity, and cost trade-offs visible in every design.' },
      { title: 'Bar raiser debrief', detail: 'Practice direct answers about setbacks, judgment calls, and what you would change.' }
    ]
  },
  Apple: {
    duration: '4-week loop',
    weeks: [
      { label: 'Week 1', focus: 'Role-aligned coding', target: 'Drill core patterns while connecting choices to your target platform or domain.' },
      { label: 'Week 2', focus: 'Systems depth', target: 'Review performance, memory, concurrency, APIs, and debugging for your role.' },
      { label: 'Week 3', focus: 'Craft & collaboration', target: 'Prepare examples of quality decisions, cross-functional partnership, and iteration.' },
      { label: 'Week 4', focus: 'Specialist mock loop', target: 'Run role-specific technical screens plus a concise project deep dive.' }
    ],
    curatedPrep: [
      { title: 'Technical deep dive', detail: 'Be ready to defend implementation details, performance choices, and testing strategy.' },
      { title: 'Quality checklist', detail: 'Highlight privacy, accessibility, reliability, and the polish users can feel.' },
      { title: 'Project narrative', detail: 'Choose one project you can explain from architecture through the last hard bug.' }
    ]
  },
  Netflix: {
    duration: '4-week senior loop',
    weeks: [
      { label: 'Week 1', focus: 'High-judgment coding', target: 'Practice clean implementations, testing, and explaining maintainable choices.' },
      { label: 'Week 2', focus: 'Architecture & reliability', target: 'Design streaming-scale services with resilience, observability, and cost awareness.' },
      { label: 'Week 3', focus: 'Scope & autonomy', target: 'Prepare stories about raising standards, making calls, and owning outcomes.' },
      { label: 'Week 4', focus: 'Senior-loop rehearsal', target: 'Run architecture and judgment-heavy mocks with direct, concise feedback.' }
    ],
    curatedPrep: [
      { title: 'Architecture studio', detail: 'State the business goal, then walk through the decisions that protect the experience.' },
      { title: 'Judgment stories', detail: 'Show context, options, risk, and the independent call you made—not just the result.' },
      { title: 'Ownership review', detail: 'Prepare a candid narrative about a hard failure and the durable improvement it created.' }
    ]
  }
};

const companyNames = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe', 'Apple', 'Netflix', 'Uber', 'Airbnb', 'Stripe',
  'Dropbox', 'Datadog', 'Atlassian', 'Salesforce', 'Palantir', 'Snowflake', 'NVIDIA', 'Intel', 'Oracle',
  'SAP', 'Tesla', 'SpaceX', 'OpenAI', 'Anthropic', 'LinkedIn', 'GitHub', 'Twilio', 'Plaid', 'Notion',
  'Figma', 'Canva', 'Robinhood', 'Coinbase', 'Discord', 'Slack', 'Spotify', 'Snap', 'Pinterest', 'Shopify',
  'Asana', 'Monday.com', 'Twitch', 'Qualtrics', 'MongoDB', 'Elastic', 'Confluent', 'HashiCorp', 'New Relic',
  'ServiceNow', 'Workday', 'Okta', 'Auth0', 'Cloudflare', 'Fastly', 'Vercel', 'Netlify', 'Linear', 'Brex',
  'Ramp', 'Airtable', 'Intercom', 'Zapier', 'Webflow', 'Miro', 'Instacart', 'Doordash', 'Robinhood', 'Gusto',
  'Plaid', 'Revolut', 'Wise', 'Checkout.com', 'SumUp', 'Monzo', 'Revolut', 'Cohesity', 'Rubrik', 'DataDog',
  'Snyk', 'Databricks', 'Cohere', 'Hugging Face', 'Scale AI', 'Anduril', 'ClickHouse', 'Temporal', 'Retool',
  'Sentry', 'Cursor', 'Perplexity', 'Tana', 'Akamai', 'UiPath', 'Jasper', 'Luma', 'Fivetran', 'Vanta',
  'Postman', 'Supabase', 'Razorpay', 'Unacademy', 'Gojek', 'Grab', 'Swiggy', 'Zomato', 'CRED', 'Navi',
  'PhonePe', 'Paytm', 'Freshworks', 'Zoho', 'Icertis', 'Pinecone', 'LangChain', 'Mistral', 'Axiom', 'Tenable'
];

const hiringProcessPool = [
  ['Recruiter screen', 'DSA round', 'System design', 'Behavioral'],
  ['Phone screen', 'Hiring manager', 'Design round', 'Leadership'],
  ['Recruiter chat', 'Coding round', 'Product round', 'Behavioral'],
  ['Bar raiser', 'DSA', 'Design', 'Leadership principles'],
  ['Screening', 'Technical interview', 'Cross-functional round', 'Culture fit'],
  ['Intro call', 'Coding challenge', 'Architecture round', 'Manager round']
];

const topicPool = [
  ['Arrays & hashing', 'Two pointers', 'Binary search', 'Graphs'],
  ['Trees & heaps', 'Dynamic programming', 'Backtracking', 'DFS'],
  ['Concurrency', 'Distributed systems', 'Rate limiting', 'Caching'],
  ['API design', 'Databases', 'Scalability', 'Metrics'],
  ['Recursion', 'Greedy', 'Sorting', 'Bit manipulation'],
  ['Queueing', 'System design', 'Trade-offs', 'Observability']
];

const stylePool = [
  'Structured, detail-oriented, and scale-focused.',
  'Practical, ownership-driven, and customer-impact focused.',
  'Product-minded with strong emphasis on execution.',
  'Leadership-heavy, structured, and customer-obsession focused.',
  'Fast, sharp, and focused on judgement and clarity.',
  'Calm, probing, and rooted in practicality.'
];

const sampleQuestionPool = [
  'Two Sum with duplicate values and constraints',
  'Longest substring without repeating characters',
  'Merge intervals at scale',
  'Design a rate limiter for a global product',
  'Explain trade-offs for an eventually consistent cache',
  'Detect cycles in a directed graph and explain recovery',
  'Build a top-k stream processor with memory constraints',
  'How would you design a job scheduler under burst load?',
  'Explain how you would test a new API contract',
  'Describe an incident you owned and what you improved'
];

const prepNotePool = [
  'Practice framing the trade-off before the implementation details.',
  'Use concrete examples from your own shipped work instead of generic theory.',
  'Close each answer by naming the customer or system impact.',
  'Be ready to explain why you chose one approach over a simpler one.'
];

const insightPool = [
  'Blind and Reddit threads often reveal the exact round sequence and surprise themes.',
  'Company-specific Discords are useful for recent process changes and recruiter feedback.',
  'Former candidates often share which mistakes repeated most in the final round.',
  'Peer notes help you spot whether a company values depth, ownership, or product clarity.'
];

function buildCompanyRoadmap(company: Pick<CompanyPrepItem, 'name' | 'hiringProcess' | 'pyqTopics' | 'prepNotes'>): PrepRoadmap {
  const [primaryTopic, secondaryTopic = 'problem solving'] = company.pyqTopics;
  const codingRound = company.hiringProcess.find(round => /DSA|coding|technical|programming|assessment/i.test(round)) || company.hiringProcess[1] || 'technical round';
  const designRound = company.hiringProcess.find(round => /design|architecture|system|machine/i.test(round)) || 'design discussion';

  return {
    duration: '4-week focused plan',
    weeks: [
      { label: 'Week 1', focus: 'Baseline + core patterns', target: `Complete 12 timed ${primaryTopic} and ${secondaryTopic} problems. Keep an error log for every miss and re-solve it without notes after 48 hours.` },
      { label: 'Week 2', focus: `${codingRound} execution`, target: `Run four 45-minute mocks. Practise clarifying inputs, stating complexity before coding, and writing edge-case tests before you finish.` },
      { label: 'Week 3', focus: `${designRound} depth`, target: `Do three role-relevant designs. For each: define scope, APIs, data model, failure modes, observability, and one deliberate trade-off.` },
      { label: 'Week 4', focus: 'Stories + full loop', target: `Prepare five STAR stories from your real work, then simulate the full loop: coding, design, behavioral, and a written debrief.` }
    ],
    curatedPrep: [
      { title: 'Student focus', detail: `Prioritise ${primaryTopic}, then explain how the approach behaves at boundaries—not just the happy path.` },
      { title: 'Interview signal', detail: company.prepNotes[0] || 'Show structured thinking, ownership, and a measurable outcome in each answer.' },
      { title: 'Daily cadence', detail: '90 minutes of DSA, 30 minutes reviewing your error log, and two mock interviews every week.' }
    ]
  };
}

const indiaFirstProfiles: CompanyPrepItem[] = [
  { id: 'flipkart', name: 'Flipkart', region: 'India', hiringProcess: ['Online assessment', 'DSA / LLD', 'Machine coding', 'Hiring manager'], pyqTopics: ['Arrays & maps', 'Graphs', 'LLD', 'Caching'], interviewStyle: 'Practical commerce scale: make the happy path correct, then reason clearly about traffic spikes and failure recovery.', sampleQuestions: ['Design an inventory reservation service (Medium)', 'Merge seller price feeds safely (Medium)', 'Implement an LRU cache (Medium)'], prepNotes: ['Show how your design behaves during sale traffic and partial outages.', 'Use clear API contracts and state transitions in machine-coding rounds.'], communityInsights: [{ title: 'India track', detail: 'Expect a mix of DSA, practical object design, and discussion around marketplace scale.' }] },
  { id: 'razorpay', name: 'Razorpay', region: 'India', hiringProcess: ['Screening', 'DSA', 'Backend / systems', 'Bar raiser'], pyqTopics: ['Hashing', 'Idempotency', 'Queues', 'Payments consistency'], interviewStyle: 'Correctness-first: explain idempotency, reconciliation, observability, and failure handling before optimising throughput.', sampleQuestions: ['Design an idempotent payment capture API (Hard)', 'Deduplicate webhook events (Medium)', 'Rate limit merchant API traffic (Medium)'], prepNotes: ['Name the invariant that prevents duplicate charging.', 'Discuss audit trails and retries as first-class design concerns.'], communityInsights: [{ title: 'India track', detail: 'Payment-domain questions reward careful reasoning about state, retries, and reconciliation.' }] },
  { id: 'phonepe', name: 'PhonePe', region: 'India', hiringProcess: ['Online test', 'DSA', 'System design', 'Manager round'], pyqTopics: ['Concurrency', 'Distributed systems', 'UPI workflows', 'Databases'], interviewStyle: 'Probe the integrity of high-volume money movement and your ability to explain trade-offs under strict reliability needs.', sampleQuestions: ['Design a UPI transaction status tracker (Hard)', 'Build a concurrent wallet ledger (Hard)', 'Find top merchants in a stream (Medium)'], prepNotes: ['Separate the user-visible transaction state from eventual reconciliation.', 'Be explicit about exactly-once versus at-least-once semantics.'], communityInsights: [{ title: 'India track', detail: 'Strong answers use concrete transaction state machines and failure modes.' }] },
  { id: 'swiggy', name: 'Swiggy', region: 'India', hiringProcess: ['Coding round', 'Machine coding', 'System design', 'Culture round'], pyqTopics: ['Graphs', 'Geospatial data', 'Queues', 'Order workflows'], interviewStyle: 'Fast product systems: reason from the customer flow through dispatch, availability, and operational edge cases.', sampleQuestions: ['Assign orders to delivery partners (Hard)', 'Model restaurant availability (Medium)', 'Build a delayed notification queue (Medium)'], prepNotes: ['Start with the order lifecycle and its ownership boundaries.', 'Show what happens when a rider, restaurant, or payment provider is unavailable.'], communityInsights: [{ title: 'India track', detail: 'Questions often combine practical algorithms with real-time operational constraints.' }] },
  { id: 'meesho', name: 'Meesho', region: 'India', hiringProcess: ['Online assessment', 'DSA', 'Machine coding', 'System design'], pyqTopics: ['Arrays', 'Dynamic programming', 'Catalog systems', 'Experimentation'], interviewStyle: 'Lean and product-focused: demonstrate crisp fundamentals, efficient implementation, and an instinct for marketplace constraints.', sampleQuestions: ['Deduplicate catalog listings (Medium)', 'Design a seller onboarding workflow (Medium)', 'Compute promotion eligibility (Medium)'], prepNotes: ['Make validation and data quality visible in your design.', 'Tie implementation choices to a measurable user or seller outcome.'], communityInsights: [{ title: 'India track', detail: 'Machine-coding clarity and edge-case discipline are high-signal here.' }] },
  { id: 'cred', name: 'CRED', region: 'India', hiringProcess: ['DSA', 'Machine coding', 'Architecture', 'Founder / manager round'], pyqTopics: ['Caching', 'APIs', 'Fintech data', 'Product sense'], interviewStyle: 'High-bar product engineering: be concise, have taste in trade-offs, and connect technical work to a polished user experience.', sampleQuestions: ['Design a credit-card bill reminder engine (Medium)', 'Build a cache with expiry and invalidation (Hard)', 'Model reward eligibility (Medium)'], prepNotes: ['Explain what should feel instant to the user and why.', 'Be precise about privacy, data freshness, and fallbacks.'], communityInsights: [{ title: 'India track', detail: 'Good answers balance product judgement with strong implementation fundamentals.' }] },
  { id: 'freshworks', name: 'Freshworks', region: 'India', hiringProcess: ['Online test', 'DSA', 'System design', 'Manager round'], pyqTopics: ['Trees', 'APIs', 'Multitenancy', 'SaaS reliability'], interviewStyle: 'SaaS engineering fundamentals with a focus on scalable, maintainable customer-facing systems.', sampleQuestions: ['Design a multi-tenant ticketing API (Hard)', 'Implement search suggestions (Medium)', 'Detect duplicate support tickets (Medium)'], prepNotes: ['Call out tenant isolation, permissions, and observability.', 'Use maintainable interfaces rather than clever one-off solutions.'], communityInsights: [{ title: 'India track', detail: 'Expect a fair mix of algorithmic depth and enterprise-software design.' }] },
  { id: 'zoho', name: 'Zoho', region: 'India', hiringProcess: ['Programming test', 'Technical rounds', 'Practical design', 'HR round'], pyqTopics: ['Core programming', 'Databases', 'OOP', 'Problem solving'], interviewStyle: 'Fundamentals-forward: write clean code, reason from first principles, and communicate every edge case.', sampleQuestions: ['Implement a mini spreadsheet evaluator (Hard)', 'Build a calendar conflict detector (Medium)', 'Design a durable note store (Medium)'], prepNotes: ['Practice explaining your code while you write it.', 'Avoid assuming library magic—show the data structure and complexity.'], communityInsights: [{ title: 'India track', detail: 'Strong fundamentals and clean, explainable solutions matter more than buzzwords.' }] }
];

const globalCompanyProfiles: CompanyPrepItem[] = companyNames.filter(name => !indiaFirstProfiles.some(company => company.name === name)).map((name, index) => {
  const hiringProcess = hiringProcessPool[index % hiringProcessPool.length];
  const pyqTopics = topicPool[index % topicPool.length];
  const interviewStyle = stylePool[index % stylePool.length];
  const sampleQuestions = Array.from({ length: 6 }, (_, offset) => `${sampleQuestionPool[(index + offset) % sampleQuestionPool.length]} (${['Easy', 'Medium', 'Hard'][offset % 3]})`);
  const prepNotes = [prepNotePool[index % prepNotePool.length], prepNotePool[(index + 1) % prepNotePool.length]];
  const communityInsights = [
    { title: `${name} round reality`, detail: `${name} interviews tend to reward crisp trade-off stories and a calm explanation of failure modes.` },
    { title: 'Community signal', detail: insightPool[index % insightPool.length] }
  ];

  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    region: index % 2 === 0 ? 'US' : 'Global',
    hiringProcess,
    pyqTopics,
    interviewStyle,
    sampleQuestions,
    prepNotes,
    communityInsights,
    faangRoadmap: faangRoadmaps[name]
  };
});

export const companyPrepCatalog: CompanyPrepItem[] = [...indiaFirstProfiles, ...globalCompanyProfiles].map(company => ({
  ...company,
  roadmap: company.faangRoadmap || buildCompanyRoadmap(company)
}));
