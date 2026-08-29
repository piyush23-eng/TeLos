export const demoSessions = [
  { date: 'Jul 03', star: 62, accuracy: 68, fillers: 9.2, pace: 142 },
  { date: 'Jul 08', star: 66, accuracy: 71, fillers: 7.4, pace: 151 },
  { date: 'Jul 14', star: 73, accuracy: 76, fillers: 5.6, pace: 146 },
  { date: 'Jul 19', star: 77, accuracy: 79, fillers: 4.1, pace: 154 },
  { date: 'Jul 26', star: 84, accuracy: 82, fillers: 3.2, pace: 149 }
];

export const personas = [
  {
    id: 'alex-senior-interviewer',
    name: 'Alex (Senior Technical Interviewer)',
    focus: ['systems design', 'backend architecture', 'trade-offs & failure modes', 'live video-call pacing'],
    difficulty: 'intermediate / senior',
    style: 'casual yet sharp, natural video-call flow, probing follow-ups, realistic production pressure',
    rubric: ['clarify constraints & metrics', 'analyze failure modes under load', 'justify architectural trade-offs']
  },
  {
    id: 'google-swe-panel',
    name: 'Google SWE Panel',
    focus: ['systems design', 'trade-offs', 'operational excellence'],
    difficulty: 'adaptive',
    style: 'calm, probing, and detail-oriented',
    rubric: ['clarify constraints', 'discuss scale', 'measure trade-offs']
  },
  {
    id: 'microsoft-sde-panel',
    name: 'Microsoft SDE Panel',
    focus: ['customer impact', 'ownership', 'reliability'],
    difficulty: 'adaptive',
    style: 'practical, structured, and collaborative',
    rubric: ['show decision-making', 'talk about failure modes', 'connect to customer impact']
  },
  {
    id: 'adobe-product-engineer-panel',
    name: 'Adobe Product Engineer Panel',
    focus: ['product thinking', 'design', 'execution'],
    difficulty: 'adaptive',
    style: 'product-minded and thoughtful',
    rubric: ['define the user problem', 'explain the solution', 'describe metrics']
  }
];

export const companies = [
  {
    id: 'google',
    name: 'Google',
    hiringProcess: ['Phone screen', 'Hiring manager round', 'System design', 'Behavioral / leadership'],
    pyqTopics: ['Arrays and hashing', 'Graphs and trees', 'Dynamic programming', 'System design', 'Scalable backend trade-offs'],
    interviewStyle: 'Structured, detail-oriented, and emphasis on clarity and scale.'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    hiringProcess: ['Recruiter screen', 'Technical interview', 'Design/architecture round', 'Behavioral round'],
    pyqTopics: ['Trees and heaps', 'Graphs', 'Binary search', 'Concurrency basics', 'Reliability and debugging'],
    interviewStyle: 'Practical, ownership-driven, and focused on customer impact.'
  },
  {
    id: 'adobe',
    name: 'Adobe',
    hiringProcess: ['DSA round', 'Product sense round', 'System design', 'Leadership and culture'],
    pyqTopics: ['Two pointers', 'Hashing', 'Recursion', 'Designing APIs', 'Product and metrics thinking'],
    interviewStyle: 'Product-minded with strong emphasis on user value and execution.'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    hiringProcess: ['Bar raiser', 'Leadership principles', 'DSA', 'Design'],
    pyqTopics: ['Hash maps', 'Trees', 'Priority queues', 'Distributed systems', 'Operational trade-offs'],
    interviewStyle: 'Leadership-heavy, structured, and customer obsession focused.'
  },
  {
    id: 'meta',
    name: 'Meta',
    hiringProcess: ['Recruiter chat', 'Coding loop', 'System design', 'Behavioral'],
    pyqTopics: ['Graphs', 'DP', 'Concurrency', 'Scalable services', 'Product and metrics'],
    interviewStyle: 'Fast, sharp, and focused on judgment and clarity.'
  }
];

const baseProblems = [
  {
    id: 'google-rate-limit',
    company: 'Google',
    title: 'Google-style Rate Limiter',
    difficulty: 'Medium',
    category: 'Systems / Distributed',
    language: 'js',
    description: 'Design a token bucket that limits bursts while staying fair across tenants. Edge cases: empty buckets, reset windows, and multiregion drift.',
    hint: 'Track a burst allowance and a refill timestamp.',
    whyItMatters: 'Google often probes whether you can explain correctness under bursty traffic.'
  },
  {
    id: 'amazon-merge-intervals',
    company: 'Amazon',
    title: 'Amazon-style Merge Intervals',
    difficulty: 'Medium',
    category: 'Arrays / Sorting',
    language: 'python',
    description: 'Merge overlapping intervals and preserve the maximum coverage. Edge cases: duplicates, partially overlapping ranges, and unsorted data.',
    hint: 'Sort by start, then merge while the next start is <= current end.',
    whyItMatters: 'Amazon likes candidates who can handle messy real-world data without over-engineering.'
  },
  {
    id: 'meta-graph-cycle',
    company: 'Meta',
    title: 'Meta-style Cycle Detection',
    difficulty: 'Hard',
    category: 'Graph / DFS',
    language: 'cpp',
    description: 'Detect whether a directed graph contains a cycle and return the offending node. Edge cases: self-loops, disconnected nodes, and repeated edges.',
    hint: 'Use DFS colors: white, gray, black.',
    whyItMatters: 'Meta rounds often test whether you can explain the graph invariant clearly.'
  },
  {
    id: 'microsoft-tree-lock',
    company: 'Microsoft',
    title: 'Microsoft-style Tree Locking',
    difficulty: 'Hard',
    category: 'Tree / Concurrency',
    language: 'js',
    description: 'Model lock acquisition for a tree where ancestor and descendant locks cannot both exist. Edge cases: reentrant locks and upgrades.',
    hint: 'Keep a parent pointer and validate the conflict set before acquiring.',
    whyItMatters: 'Microsoft tends to reward structured reasoning around concurrency and state transitions.'
  },
  {
    id: 'adobe-subarray-sum',
    company: 'Adobe',
    title: 'Adobe-style Subarray Sum',
    difficulty: 'Easy',
    category: 'Arrays / Prefix',
    language: 'python',
    description: 'Find the maximum subarray sum in a single pass. Edge cases: all negatives and a single element.',
    hint: 'Track the current best ending sum and the global best.',
    whyItMatters: 'Adobe values concise solutions and a clear explanation of edge cases.'
  },
  {
    id: 'netflix-lru-cache',
    company: 'Netflix',
    title: 'Netflix-style LRU Cache',
    difficulty: 'Medium',
    category: 'Data Structures / HashMap',
    language: 'cpp',
    description: 'Implement an LRU cache with O(1) get and put. Edge cases: eviction order and repeated key updates.',
    hint: 'Use a doubly linked list plus a hash map.',
    whyItMatters: 'Netflix-style problems often test comfort with APIs that need to be both fast and predictable.'
  },
  {
    id: 'razorpay-idempotent-payments',
    company: 'Razorpay',
    title: 'Razorpay-style Idempotent Payments',
    difficulty: 'Hard',
    category: 'Backend / Consistency',
    language: 'js',
    description: 'Process payment requests using an idempotency key so retries never create duplicate captures. Consider duplicate requests, a slow downstream gateway, and an interrupted response.',
    hint: 'Persist the key and terminal result before returning; model in-flight work explicitly.',
    whyItMatters: 'Fintech interviews reward candidates who make correctness and reconciliation explicit.'
  },
  {
    id: 'flipkart-inventory-reservation',
    company: 'Flipkart',
    title: 'Flipkart-style Inventory Reservation',
    difficulty: 'Hard',
    category: 'Concurrency / Design',
    language: 'java',
    description: 'Reserve limited inventory for carts without overselling when many customers check out at once. Account for expiry, release, and concurrent reservation attempts.',
    hint: 'Define a single source of truth for available stock and make every reservation state transition atomic.',
    whyItMatters: 'Marketplace systems test whether you can protect an invariant under sale-scale traffic.'
  },
  {
    id: 'swiggy-dispatch-window',
    company: 'Swiggy',
    title: 'Swiggy-style Delivery Dispatch',
    difficulty: 'Medium',
    category: 'Heaps / Scheduling',
    language: 'python',
    description: 'Assign orders to available delivery partners by earliest completion time while handling partner availability changes and order cancellation.',
    hint: 'A priority queue can represent the next available partner, but decide how stale updates are invalidated.',
    whyItMatters: 'This mirrors the scheduling and state-management reasoning used in real-time delivery systems.'
  },
  {
    id: 'phonepe-transaction-reconcile',
    company: 'PhonePe',
    title: 'PhonePe-style Transaction Reconciliation',
    difficulty: 'Medium',
    category: 'Hashing / Data Integrity',
    language: 'cpp',
    description: 'Reconcile a day of transaction events from two systems and identify missing, duplicated, or mismatched records.',
    hint: 'Index the immutable transaction identifier first, then preserve enough state to classify every mismatch.',
    whyItMatters: 'Payments platforms value careful data integrity reasoning just as much as algorithmic speed.'
  },
  {
    id: 'zoho-spreadsheet-dependency',
    company: 'Zoho',
    title: 'Zoho-style Spreadsheet Dependencies',
    difficulty: 'Hard',
    category: 'Graphs / Topological Sort',
    language: 'js',
    description: 'Evaluate spreadsheet cells with dependencies and surface a useful error when a cycle is introduced.',
    hint: 'Represent formulas as a dependency graph and keep a visiting state during DFS.',
    whyItMatters: 'It exercises core data-structure knowledge while requiring precise edge-case communication.'
  }
];

const additionalProblems = [
  { id: 'google-number-islands', company: 'Google', title: 'Number of Connected Islands', difficulty: 'Medium', category: 'Graphs / BFS', language: 'js', description: 'Count connected land regions in a grid, where land cells sharing an edge belong to the same island.', hint: 'Mark a cell as visited as soon as it enters the queue.', whyItMatters: 'Tests clean graph traversal, boundary checks, and a crisp complexity explanation.' },
  { id: 'google-kth-stream', company: 'Google', title: 'Kth Largest Element in a Stream', difficulty: 'Medium', category: 'Heaps / Streams', language: 'python', description: 'Process a stream of integers and return the kth largest value after every insertion.', hint: 'A min-heap of size k only retains the candidates that can still be the answer.', whyItMatters: 'A useful signal for streaming data structures and maintaining an invariant.' },
  { id: 'amazon-top-k-orders', company: 'Amazon', title: 'Top K Frequent Orders', difficulty: 'Medium', category: 'Hashing / Heaps', language: 'java', description: 'Return the k most frequent product identifiers with deterministic tie-breaking.', hint: 'Count first, then maintain only the best candidates in a heap.', whyItMatters: 'Pairs common data-structure work with explicit treatment of ambiguous product requirements.' },
  { id: 'amazon-rot-window', company: 'Amazon', title: 'Minimum Fulfilment Window', difficulty: 'Hard', category: 'Sliding Window', language: 'python', description: 'Find the shortest contiguous time window that contains every required warehouse event type.', hint: 'Expand until valid, then shrink while every required type is still represented.', whyItMatters: 'Exercises invariant-driven code and how you reason about large event streams.' },
  { id: 'meta-clone-graph', company: 'Meta', title: 'Clone a Social Graph', difficulty: 'Medium', category: 'Graphs / Hashing', language: 'cpp', description: 'Create a deep copy of an undirected graph whose nodes may contain cycles.', hint: 'Map every original node to its clone before recursively connecting neighbours.', whyItMatters: 'Strong candidates explain identity, cycles, and traversal state before coding.' },
  { id: 'meta-product-except-self', company: 'Meta', title: 'Product of Array Except Self', difficulty: 'Medium', category: 'Arrays / Prefix', language: 'js', description: 'Return an array where each position contains the product of all other values without using division.', hint: 'Build prefix products on the forward pass and combine suffix products on the return pass.', whyItMatters: 'A compact way to test space trade-offs and communication under time pressure.' },
  { id: 'microsoft-course-schedule', company: 'Microsoft', title: 'Course Dependency Planner', difficulty: 'Medium', category: 'Graphs / Topological Sort', language: 'js', description: 'Determine whether every course can be completed given prerequisite pairs, and surface a cycle when it cannot.', hint: 'Track indegrees or DFS visiting states; explain the invariant behind your choice.', whyItMatters: 'Tests structured decomposition, error handling, and dependency reasoning.' },
  { id: 'microsoft-merge-k-lists', company: 'Microsoft', title: 'Merge K Sorted Event Feeds', difficulty: 'Hard', category: 'Linked Lists / Heaps', language: 'cpp', description: 'Merge k sorted linked lists into one sorted list while preserving all records.', hint: 'The heap should contain only the current head from each list.', whyItMatters: 'Shows whether you can choose a scalable structure and justify O(n log k).' },
  { id: 'adobe-word-break', company: 'Adobe', title: 'Document Tokenisation', difficulty: 'Medium', category: 'Dynamic Programming', language: 'python', description: 'Decide whether a string can be segmented into dictionary words, then return one valid segmentation.', hint: 'Let dp[i] mean the prefix ending before i can be segmented; retain a predecessor to reconstruct.', whyItMatters: 'Combines product-friendly output requirements with a clear DP state.' },
  { id: 'netflix-sliding-max', company: 'Netflix', title: 'Peak Concurrent Viewers', difficulty: 'Hard', category: 'Deque / Sliding Window', language: 'python', description: 'Return the maximum viewer count in every rolling window of size k from a time series.', hint: 'Maintain a decreasing deque of indices and discard positions that leave the window.', whyItMatters: 'Rewards a disciplined API-level explanation of a high-performance primitive.' },
  { id: 'flipkart-search-suggest', company: 'Flipkart', title: 'Catalog Search Suggestions', difficulty: 'Medium', category: 'Sorting / Binary Search', language: 'java', description: 'For each typed prefix, return up to three lexicographically smallest matching catalog terms.', hint: 'Sort once, then narrow the matching range as the prefix grows.', whyItMatters: 'Mirrors a marketplace feature while checking efficient search and boundary handling.' },
  { id: 'razorpay-webhook-dedupe', company: 'Razorpay', title: 'Webhook Deduplication', difficulty: 'Medium', category: 'Hashing / Queues', language: 'js', description: 'Accept webhook events that may arrive late or more than once and emit each event exactly once within a retention window.', hint: 'Separate dedupe state from delivery state and decide when an id can safely expire.', whyItMatters: 'Demonstrates practical correctness thinking for an unreliable integration boundary.' },
  { id: 'phonepe-balance-ledger', company: 'PhonePe', title: 'Wallet Balance Ledger', difficulty: 'Hard', category: 'Hashing / Transactions', language: 'java', description: 'Apply a sequence of transfers and reject any operation that would create a negative balance or duplicate transaction.', hint: 'Validate transaction identity and both balances before committing either account update.', whyItMatters: 'A direct check of invariants, atomicity, and careful edge-case reasoning.' }
];

type DrillDetails = {
  prompt: string;
  input: string;
  output: string;
  constraints: string[];
  examples: { input: string; output: string; explanation: string }[];
  expectedComplexity: string;
};

function createDrillDetails(problem: { title: string; description: string; category: string; difficulty: string }): DrillDetails {
  const isGraph = /Graph|Topological|BFS|DFS/.test(problem.category);
  const isHeap = /Heap|Scheduling|Stream/.test(problem.category);
  const isSystem = /System|Backend|Consistency|Concurrency|Transaction|Data Integrity/.test(problem.category);
  const input = isGraph ? 'A graph or grid represented by nodes, edges, or a 2D array.' : isSystem ? 'A sequence of requests or events in arrival order.' : isHeap ? 'An array or stream of values and the required ranking/window size.' : 'An array or structured input matching the function signature.';
  const output = isGraph ? 'The requested traversal result, count, ordering, or cycle signal.' : isSystem ? 'The accepted result plus a clear result for every rejected or duplicate request.' : 'The value or collection requested by the problem statement.';
  const example = isGraph
    ? { input: 'grid = [[1,1,0],[0,1,0],[1,0,1]]', output: '3', explanation: 'Cells connected horizontally or vertically form one component; there are three components total.' }
    : isSystem
      ? { input: 'events = ["a1", "a1", "b2"]', output: '["accepted:a1", "duplicate:a1", "accepted:b2"]', explanation: 'The same immutable request id must not produce the effect twice.' }
      : isHeap
        ? { input: 'values = [4,5,8,2], k = 3', output: '4', explanation: 'The third largest value among the observed values is 4.' }
        : { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'The values at indices 0 and 1 add up to the target.' };

  return {
    prompt: `${problem.description} Write a production-quality solution for the stated function. First clarify invalid or empty input behaviour, then return the requested result without mutating input unless you explicitly document that choice.`,
    input,
    output,
    constraints: [problem.difficulty === 'Hard' ? 'Design for input sizes up to 100,000 records or nodes.' : 'Design for input sizes up to 10,000 records or nodes.', 'State time and space complexity before coding.', 'Cover empty input, duplicate values or identifiers, and the smallest valid input.'],
    examples: [example],
    expectedComplexity: isGraph ? 'O(V + E) time; O(V) auxiliary space.' : isHeap ? 'O(n log k) time with O(k) auxiliary space where applicable.' : isSystem ? 'O(n) processing time with O(n) state for the supplied retention window.' : 'Aim for O(n) or O(n log n) time; justify any extra space.'
  };
}

export const problems = [...baseProblems, ...additionalProblems].map(problem => ({
  ...problem,
  details: createDrillDetails(problem)
}));
