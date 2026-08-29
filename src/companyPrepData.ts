export type PrepRoadmapWeek = {
  label: string;
  focus: string;
  target: string;
  topics?: string[];
  deliverable?: string;
};

export type PrepRoadmap = {
  duration: string;
  weeks: PrepRoadmapWeek[];
  curatedPrep: { title: string; detail: string }[];
};

export type CompanyPrepItem = {
  id: string;
  name: string;
  category?: 'faang' | 'high-growth' | 'ai' | 'fintech' | 'enterprise';
  region: string;
  hiringProcess: string[];
  pyqTopics: string[];
  interviewStyle: string;
  sampleQuestions: string[];
  prepNotes: string[];
  communityInsights: { title: string; detail: string }[];
  roadmap: PrepRoadmap;
  faangRoadmap?: PrepRoadmap;
  systemDesignArchetypes?: string[];
  culturalValues?: string[];
};

const curatedProfiles: CompanyPrepItem[] = [
  {
    id: 'google',
    name: 'Google',
    category: 'faang',
    region: 'Global / US / India',
    hiringProcess: [
      'Round 01: Online Assessment (2 algorithmic challenges, 90 mins)',
      'Round 02: Technical Phone Screen (45 mins DSA with Google engineer)',
      'Round 03: Onsite 1 — Advanced Data Structures & Tree/Graph Theory (45 mins)',
      'Round 04: Onsite 2 — Dynamic Programming & Math/Optimization (45 mins)',
      'Round 05: Onsite 3 — Distributed System Design / Large Scale Architecture (45 mins)',
      'Round 06: Googleyness & Leadership Calibration (STAR behavioural)'
    ],
    pyqTopics: [
      'Topological Sort & DAGs',
      'Binary Tree LCA & Subtree Isomorphism',
      'Dynamic Programming with Bitmasking',
      'Dijkstra & Shortest Path with State',
      'Distributed Cache Invalidation',
      'Consistent Hashing & Partitioning'
    ],
    interviewStyle:
      'Highly structured, hypothesis-driven, and rigorous. Google interviewers evaluate first-principles algorithmic derivation, formal time/space complexity proofs, proactive boundary-condition testing, and Googleyness (intellectual humility & collaboration).',
    sampleQuestions: [
      'Alien Dictionary: Build topological ordering from sorted lexicon (Hard)',
      'Word Ladder II: Find all shortest transformation sequences via BFS+DFS (Hard)',
      'Design Distributed Web Crawler: URL frontier, deduplication & polite fetchers (Hard)',
      'Median of Two Sorted Arrays: Binary search across partition cuts in O(log(min(N,M))) (Hard)',
      'Logger Rate Limiter: Sliding window token bucket with low memory drift (Medium)',
      'Range Sum Query 2D: Mutable Segment Tree / Binary Indexed Tree (Hard)'
    ],
    prepNotes: [
      'Never write code immediately. Spend the first 4-5 minutes asking clarifying questions on scale, input domains, and nullability.',
      'Explicitly write out worst-case Time and Auxiliary Space complexities in Big-O notation before writing the first function line.',
      'Dry-run your solution line-by-line with a tricky edge case (empty array, single node, duplicate values) without the interviewer asking.'
    ],
    systemDesignArchetypes: [
      'Design Google Drive / File Sync with Chunk Deduplication',
      'Design Distributed Search Typeahead with Trie & Caching',
      'Design Global Rate Limiter across multiple datacenter regions'
    ],
    culturalValues: [
      'Googleyness: Thriving in ambiguity and intellectual humility',
      'Bias for Scalable First-Principles Solutions',
      'Radical Respect for Teammates & Candidate Empathy'
    ],
    communityInsights: [
      {
        title: 'Google Hiring Committee Reality',
        detail: 'The interviewer does not make the final hire call. They submit structured transcripts to an independent Hiring Committee. Clean code and explicit communication transcripts are paramount.'
      },
      {
        title: 'Campus & New Grad Weightage',
        detail: 'For college students and new grads, DP, Graphs, and Tree traversals constitute 80% of questions. System design is replaced with an extra DSA/LLD problem solving round.'
      }
    ],
    roadmap: {
      duration: '6-week master loop',
      weeks: [
        {
          label: 'Week 1',
          focus: 'Arrays, Two Pointers & Monotonic Structures',
          target: 'Solve 25 timed problems. Master Monotonic Queue, Sliding Window boundaries, and In-place Transformations.',
          topics: ['Sliding Window Maximum', 'Trapping Rain Water', 'Next Greater Element', 'Subarray Sum Equals K'],
          deliverable: 'Complete 4 timed 35-minute mock sessions with zero runtime bugs.'
        },
        {
          label: 'Week 2',
          focus: 'Graph Theory, Trees & Topological Sort',
          target: 'Master BFS/DFS with state, Union-Find with path compression, LCA in Binary Trees, and Cycle Detection in Directed Graphs.',
          topics: ['Alien Dictionary', 'Course Schedule I/II', 'Lowest Common Ancestor', 'Network Delay Time (Dijkstra)'],
          deliverable: 'Solve 20 graph/tree problems while narrating every invariant out loud.'
        },
        {
          label: 'Week 3',
          focus: 'Dynamic Programming & State Machines',
          target: 'Deconstruct complex DP recurrences: 1D, 2D grid, interval DP, and state machine transitions.',
          topics: ['Longest Increasing Subsequence (O(N log N))', 'Edit Distance', 'Regular Expression Matching', 'Burst Balloons'],
          deliverable: 'Derive state transition equations on whiteboard before coding implementation.'
        },
        {
          label: 'Week 4',
          focus: 'Low-Level Design & Concurrency',
          target: 'Build production-ready in-memory components using SOLID principles, thread-safety, and clean abstractions.',
          topics: ['LRU/LFU Cache', 'Thread-Safe Blocking Queue', 'Design In-Memory File System', 'Pub-Sub Message Bus'],
          deliverable: 'Implement 3 end-to-end OOP systems with comprehensive unit test coverage.'
        },
        {
          label: 'Week 5',
          focus: 'Distributed Systems & Google-Scale Design',
          target: 'Design scalable backends handling 100M+ QPS. Deep dive into Consistent Hashing, Replication, and Cache Invalidation.',
          topics: ['Design Google Search Autocomplete', 'Design Google Drive Sync', 'Distributed Rate Limiter'],
          deliverable: 'Draft complete architecture diagrams with concrete QPS, storage math, and failure modes.'
        },
        {
          label: 'Week 6',
          focus: 'Googleyness & Full Loop Mock Simulation',
          target: 'Calibrate 6 high-impact STAR stories and simulate 3 full-length 45-minute technical loops with peer interviewers.',
          topics: ['Handling Project Ambiguity', 'Navigating Team Disagreements', 'Recovering from Production Outages'],
          deliverable: 'Record 3 video debriefs measuring WPM cadence and filler word decay.'
        }
      ],
      curatedPrep: [
        {
          title: 'Algorithmic Proofs & Invariants',
          detail: 'State why greedy works or why your DP covers all subproblems before writing code.'
        },
        {
          title: 'Google-Scale System Design',
          detail: 'Always calculate bandwidth, storage per second, and memory limits before picking technologies.'
        },
        {
          title: 'Googleyness Story Bank',
          detail: 'Prepare stories showing intellectual honesty, welcoming feedback, and collaborating through ambiguity.'
        }
      ]
    }
  },
  {
    id: 'meta',
    name: 'Meta',
    category: 'faang',
    region: 'Global / US / UK',
    hiringProcess: [
      'Round 01: Initial Technical Screen (2 Mediums in 45 mins)',
      'Round 02: Onsite Coding Loop 1 (2 DSA problems in 45 mins — High Speed Focus)',
      'Round 03: Onsite Coding Loop 2 (2 DSA problems in 45 mins — Trees/Graphs)',
      'Round 04: Systems Design / Product Architecture (Design FB Feed, Messenger, Instagram Stories)',
      'Round 05: Behavioral & Cultural Alignment (Move Fast & Focus on Impact)'
    ],
    pyqTopics: [
      'Binary Tree Vertical Order Traversal',
      'Subarray Sum Equals K',
      'Nested List Weight Sum',
      'K Closest Points to Origin',
      'Feed Ranking & Fan-out on Write',
      'Distributed Counter & Sharded Caching'
    ],
    interviewStyle:
      'Fast-paced, implementation-focused, and execution-heavy. Meta interviewers expect candidates to solve TWO distinct Medium/Hard problems in a single 45-minute block. Zero syntax stumbling, rapid edge-case coverage, and working code within 15 minutes per question.',
    sampleQuestions: [
      'Binary Tree Vertical Order Traversal (Medium)',
      'Minimum Remove to Make Valid Parentheses (Medium)',
      'Merge k Sorted Lists via Min-Heap (Hard)',
      'Valid Palindrome II (with 1 character deletion) (Easy)',
      'Design Facebook News Feed with Fan-out optimizations (Hard)',
      'Design Proximity Service / Yelp Location Search (Hard)'
    ],
    prepNotes: [
      'Speed is everything: Allocate max 18 minutes per question. Clarify for 2 mins, write code for 10 mins, dry-run for 3 mins.',
      'Prioritize clean Python or C++ syntax without boilerplate to maximize speed.',
      'In Systems Design, focus heavily on Product Architecture: API endpoints, data models, and caching fan-out.'
    ],
    systemDesignArchetypes: [
      'Design Facebook News Feed (Push vs Pull fan-out)',
      'Design Instagram Stories (Ephemeral 24h storage & CDN caching)',
      'Design WhatsApp / FB Messenger (WebSocket connection gateway)'
    ],
    culturalValues: [
      'Move Fast: Prioritizing velocity and shipping iteratively',
      'Focus on Impact: Working on what moves the needle most',
      'Live in the Future: Building long-term scalable platforms'
    ],
    communityInsights: [
      {
        title: 'Meta Speed Bar',
        detail: 'Solving only 1 problem out of 2 in a round is almost always a soft rejection. Practice completing 2 mediums back-to-back under 40 minutes.'
      },
      {
        title: 'Top 100 Meta Tagged PYQs',
        detail: 'Meta repeats from its top 75-100 tagged question bank more frequently than other FAANG companies. Master the curated set thoroughly.'
      }
    ],
    roadmap: {
      duration: '5-week sprint loop',
      weeks: [
        {
          label: 'Week 1',
          focus: 'Speed & Top Meta Patterns',
          target: 'Solve 30 top-tagged Meta mediums under 18 minutes each. Zero hesitation on Two Pointers and Hash Maps.',
          topics: ['Subarray Sum Equals K', '3Sum', 'Valid Parentheses Variants', 'Group Anagrams'],
          deliverable: 'Complete 5 timed speed drills hitting 15 min per solution.'
        },
        {
          label: 'Week 2',
          focus: 'Trees, Recursion & Graph Traversals',
          target: 'Drill Binary Tree BFS/DFS, Level Order, LCA, and Matrix Graph traversals.',
          topics: ['Binary Tree Vertical Order', 'Lowest Common Ancestor III', 'Accounts Merge', 'Word Break'],
          deliverable: 'Zero syntax errors across 20 tree/graph questions.'
        },
        {
          label: 'Week 3',
          focus: 'Heaps, Binary Search & String Manipulation',
          target: 'Master Quickselect for Top-K, Binary Search on Answer space, and Sliding Windows.',
          topics: ['Kth Largest Element in Array', 'Find Peak Element', 'Basic Calculator II', 'Minimum Window Substring'],
          deliverable: 'Complete 3 pairs of 45-minute 2-problem mock sets.'
        },
        {
          label: 'Week 4',
          focus: 'Product Architecture & Feed Systems',
          target: 'Design News Feed, Instagram Stories, and Live Commenting systems with high fan-out.',
          topics: ['Fan-out on Write vs Read', 'Redis Sorted Sets for Feeds', 'CDN Edge Invalidation'],
          deliverable: 'Present full 45-minute live architecture whiteboard without hesitation.'
        },
        {
          label: 'Week 5',
          focus: 'Impact Behavioral & Full Simulation',
          target: 'Calibrate STAR stories showcasing direct engineering impact, moving fast, and unblocking teammates.',
          topics: ['High Velocity Project Delivery', 'Navigating Technical Trade-offs Under Deadlines', 'Peer Leadership'],
          deliverable: 'Run full 4-round onsite mock loop.'
        }
      ],
      curatedPrep: [
        {
          title: 'High-Velocity Coding Rhythm',
          detail: 'Practice writing standard functions with muscle memory so you can focus 100% on problem logic.'
        },
        {
          title: 'Product-Scale Architecture',
          detail: 'Connect database schemas directly to client UI latency and battery/network constraints.'
        },
        {
          title: 'Measurable Impact Narrative',
          detail: 'Quantify everything in behavioral rounds: latency reduction %, QPS sustained, or engineering hours saved.'
        }
      ]
    }
  },
  {
    id: 'amazon',
    name: 'Amazon',
    category: 'faang',
    region: 'Global / US / India / EU',
    hiringProcess: [
      'Round 01: Online Assessment (2 DSA problems + Work Style Survey + Debugging)',
      'Round 02: Technical Screening with Senior SDE (DSA + 2 Leadership Principles)',
      'Round 03: Onsite Round 1 — Coding & Problem Solving + Customer Obsession',
      'Round 04: Onsite Round 2 — Low Level Design / OOP + Bias for Action',
      'Round 05: Onsite Round 3 — Distributed Systems Design + Are Right, A Lot',
      'Round 06: The Bar Raiser Round — Deep Behavioral Probing + Ownership & Dive Deep'
    ],
    pyqTopics: [
      'Sliding Window & Hash Maps',
      'Priority Queues & Top-K Elements',
      'BFS/DFS on Grid & Routing',
      'Object Oriented Design (Parking Lot / Locker System)',
      'Idempotent Order Payment Systems',
      'DynamoDB Key Design & Hot Partitioning'
    ],
    interviewStyle:
      'Deeply grounded in the 16 Leadership Principles (LPs). Every single technical round dedicates 20 minutes to LP STAR behavioral questions before or after coding. The Bar Raiser has veto power over the entire hiring loop.',
    sampleQuestions: [
      'Number of Islands: BFS/DFS connected components on grid (Medium)',
      'Reorder Data in Log Files: Custom comparator sorting (Medium)',
      'Design Amazon Locker System: Object-oriented state machine (Medium)',
      'Course Schedule II: Topological sorting with cycle detection (Medium)',
      'Design TinyURL / Distributed ID Generator (Snowflake / UUID) (Medium)',
      'Design Amazon Prime Video Video Ingestion Pipeline (Hard)'
    ],
    prepNotes: [
      'Prepare at least TWO distinct, high-detail STAR stories for each of the 16 Leadership Principles.',
      'Never use "We did this" in LP answers. Amazon bar raisers look for personal contribution: "I designed X, I debugged Y".',
      'In System Design, always account for AWS infrastructure primitives: SQS, SNS, DynamoDB, S3, ECS, Lambda.'
    ],
    systemDesignArchetypes: [
      'Design Amazon E-Commerce Order Fulfillment & Checkout',
      'Design Prime Video Video Streaming & Transcoding',
      'Design Distributed Key-Value Store with DynamoDB Architecture'
    ],
    culturalValues: [
      'Customer Obsession: Starting with the customer and working backward',
      'Ownership: Thinking long term and never saying "that\'s not my job"',
      'Dive Deep: Staying connected to the details and verifying with data',
      'Bias for Action: Speed matters in business; calculated risk taking'
    ],
    communityInsights: [
      {
        title: 'The Bar Raiser Secret',
        detail: 'The Bar Raiser is an interviewer from an unrelated organization within Amazon whose sole job is to evaluate if you raise the bar above 50% of current Amazon engineers in that role.'
      },
      {
        title: 'OA2 Work Simulation',
        detail: 'For college campus drives, OA2 includes a virtual day-in-the-life simulation. Always align answers with Customer Obsession and Ownership.'
      }
    ],
    roadmap: {
      duration: '6-week master loop',
      weeks: [
        {
          label: 'Week 1',
          focus: '16 Leadership Principles Story Matrix',
          target: 'Draft 12 rich STAR stories with concrete metrics covering Customer Obsession, Ownership, and Bias for Action.',
          topics: ['Customer Obsession Stories', 'Ownership & Failure Retrospectives', 'Dive Deep Technical Decisions'],
          deliverable: 'Completed STAR matrix with quantified metrics for all 16 principles.'
        },
        {
          label: 'Week 2',
          focus: 'High-Frequency Amazon Coding Drills',
          target: 'Master Priority Queues, String manipulation, Grids, and Hash Maps.',
          topics: ['Top K Frequent Elements', 'Merge Intervals', 'Rotting Oranges', 'LRU Cache'],
          deliverable: 'Solve 25 Amazon-tagged problems with 100% testcase pass rate.'
        },
        {
          label: 'Week 3',
          focus: 'Object Oriented Design & Machine Coding',
          target: 'Design clean OOP classes for real-world physical systems with clear design patterns (Factory, Strategy, Observer).',
          topics: ['Design Amazon Locker', 'Design Parking Garage', 'Design Vending Machine', 'Design File Search System'],
          deliverable: 'Write 3 complete Java/Python/C++ OOP implementations with clean interfaces.'
        },
        {
          label: 'Week 4',
          focus: 'Non-Linear Algorithms & Trees/Graphs',
          target: 'Drill Binary Search Trees, Serialization, Graph BFS/DFS, and Shortest Paths.',
          topics: ['Serialize and Deserialize Binary Tree', 'Word Ladder', 'Critical Connections in Network (Tarjan)'],
          deliverable: 'Complete 15 advanced graph and tree problems.'
        },
        {
          label: 'Week 5',
          focus: 'AWS-Scale Distributed Systems',
          target: 'Design scalable, highly-available distributed services with SQS, DynamoDB, and Redis.',
          topics: ['Design Amazon Checkout & Inventory Locking', 'Design Distributed Rate Limiter', 'Design S3 Object Storage'],
          deliverable: 'Diagram complete end-to-end cloud architectures with failure recovery modes.'
        },
        {
          label: 'Week 6',
          focus: 'Bar Raiser Mock Interrogation & Rehearsal',
          target: 'Simulate intense Bar Raiser pressure interviews with follow-up probing questions on failures and metrics.',
          topics: ['Handling High Pressure Probing', 'Defending Design Decisions', 'Explaining Complex Technical Trade-offs'],
          deliverable: 'Pass 2 full mock loops with Bar Raiser debriefs.'
        }
      ],
      curatedPrep: [
        {
          title: 'LP Concrete Evidence',
          detail: 'Every behavioral answer must have a specific context, your exact actions, and measurable business impact.'
        },
        {
          title: 'Operational Excellence in Design',
          detail: 'Include alarms, dead-letter queues (DLQs), circuit breakers, and database rollback strategies in every system design.'
        },
        {
          title: 'Bar Raiser Resilience',
          detail: 'When challenged on a decision, maintain composure, acknowledge trade-offs, and walk through your evaluation data.'
        }
      ]
    }
  },
  {
    id: 'uber',
    name: 'Uber',
    category: 'high-growth',
    region: 'Global / US / India / Amsterdam',
    hiringProcess: [
      'Round 01: Online Assessment (4 questions, 70 mins)',
      'Round 02: Technical Phone Screen (45 mins DSA / Geospatial focus)',
      'Round 03: Onsite 1 — Advanced Data Structures & Graph Routing (60 mins)',
      'Round 04: Onsite 2 — Concurrency & Multithreading / Machine Coding (60 mins)',
      'Round 05: Onsite 3 — Real-Time Geospatial System Design (Uber Dispatch / Surge Pricing)',
      'Round 06: Behavioral & Cultural Leadership (Values & Execution)'
    ],
    pyqTopics: [
      'Geospatial Hashing (H3, S2, QuadTrees)',
      'Dijkstra & A* Shortest Path Routing',
      'Concurrency & Real-time Event Streaming (Kafka / Flink)',
      'Dynamic Pricing & Surge Algorithms',
      'Distributed Lock Manager (Redis / Redlock / Zookeeper)',
      'Sliding Window Rate Limiters'
    ],
    interviewStyle:
      'High-throughput, real-time systems focused. Uber interviewers love probing spatial algorithms, real-time location streaming, driver-rider matching under concurrency, and distributed state machines under high write load.',
    sampleQuestions: [
      'Bus Routes: Minimum transfers using BFS on route graphs (Hard)',
      'Design Real-Time Geospatial Matching Engine (Uber Dispatch) (Hard)',
      'Sliding Window Maximum / Event Stream Deduplication (Hard)',
      'Design Distributed Surge Pricing Engine with Kafka and Redis (Hard)',
      'Concurrent Task Scheduler with Dependencies (Medium)',
      'Evaluate Reverse Polish Notation / Expression Parsing (Medium)'
    ],
    prepNotes: [
      'Understand Uber’s H3 Hexagonal Hierarchical Spatial Index and QuadTrees for geospatial indexing.',
      'Be prepared to explain WebSocket connection scaling for millions of active drivers pinging GPS coordinates every 4 seconds.',
      'Discuss race conditions when multiple riders accept the same driver simultaneously.'
    ],
    systemDesignArchetypes: [
      'Design Uber Ride Matching & Dispatch Architecture',
      'Design Real-time GPS Location Ingestion Pipeline (1M pings/sec)',
      'Design Dynamic Surge Pricing Engine with Sliding Window Aggregation'
    ],
    culturalValues: [
      'Go Get It: Bias for action and proactive problem solving',
      'Trip-Obsessed: Prioritizing the real-world user and driver experience',
      'Build with Heart: Integrity and long-term sustainable systems'
    ],
    communityInsights: [
      {
        title: 'Uber Machine Coding & Concurrency',
        detail: 'Uber often asks candidates to implement a fully working multi-threaded in-memory component (e.g. concurrent priority queue or job scheduler) in 60 mins.'
      },
      {
        title: 'Real-time Scale Focus',
        detail: 'Expect in-depth questions about write-heavy workloads, Redis cluster partitioning, and event-driven architectures with Apache Kafka.'
      }
    ],
    roadmap: {
      duration: '5-week real-time loop',
      weeks: [
        {
          label: 'Week 1',
          focus: 'Graphs, Shortest Path & Spatial Structures',
          target: 'Master Dijkstra, BFS on graphs, and spatial indexing concepts (QuadTree, Geohash, H3).',
          topics: ['Bus Routes', 'Network Delay Time', 'QuadTree Implementation', 'Shortest Path with Obstacles'],
          deliverable: 'Implement a working QuadTree spatial search engine in 45 minutes.'
        },
        {
          label: 'Week 2',
          focus: 'Concurrency & Multi-Threaded Machine Coding',
          target: 'Build thread-safe components with locks, semaphores, and condition variables.',
          topics: ['Concurrent Rate Limiter', 'Thread-Safe LRU Cache', 'Job Scheduler with Dependency Graph'],
          deliverable: 'Write 3 production-grade concurrent programs with zero race conditions.'
        },
        {
          label: 'Week 3',
          focus: 'Sliding Windows, Heaps & Event Streaming',
          target: 'Drill high-throughput streaming algorithms, Sliding Window maximums, and Top-K frequency.',
          topics: ['Sliding Window Maximum', 'Find Median from Data Stream', 'Task Scheduler'],
          deliverable: 'Complete 20 high-frequency Uber coding challenges.'
        },
        {
          label: 'Week 4',
          focus: 'Geospatial Real-Time System Design',
          target: 'Design Uber Dispatch, Location Tracking, and Surge Pricing with Kafka, Redis, and WebSockets.',
          topics: ['Design Uber Ride Matching Engine', 'Design Real-Time Driver Location Ingestion', 'Surge Pricing Aggregator'],
          deliverable: 'Deliver full 60-minute architecture whiteboard presentation.'
        },
        {
          label: 'Week 5',
          focus: 'Cultural Alignment & Full Mock Loop',
          target: 'Refine STAR stories on handling real-world production outages and cross-team execution.',
          topics: ['Resolving High-Severity Outages', 'Collaborating Under Extreme Deadlines', 'Customer Impact'],
          deliverable: 'Run full 4-round mock interview loop.'
        }
      ],
      curatedPrep: [
        {
          title: 'Geospatial Indexing Mastery',
          detail: 'Know how Geohashes, QuadTrees, and Hexagonal H3 cells partition the globe into fast queryable buckets.'
        },
        {
          title: 'Write-Heavy Architecture',
          detail: 'Design ingestion buffers with Kafka and in-memory caches to handle millions of GPS writes without DB contention.'
        },
        {
          title: 'Race Condition Defense',
          detail: 'Use distributed locks (Redlock) or transactional compare-and-swap (CAS) to prevent double driver booking.'
        }
      ]
    }
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'fintech',
    region: 'Global / US / Remote / Dublin',
    hiringProcess: [
      'Round 01: Take-Home Coding Project or 45-min Pair Programming Screen',
      'Round 02: Onsite Round 1 — Practical Coding / Production Debugging (60 mins)',
      'Round 03: Onsite Round 2 — Data Structures & API Engineering (60 mins)',
      'Round 04: Onsite Round 3 — Distributed System Design (Payment Ledger & Idempotency)',
      'Round 05: Onsite Round 4 — Integration & API Design (Designing Developer Interfaces)',
      'Round 06: Behavioral & Engineering Rigor (Culture & Operational Empathy)'
    ],
    pyqTopics: [
      'Idempotency Keys & Deduplication',
      'Double-Entry Accounting & Ledger Immutability',
      'Webhook Delivery & Exponential Backoff Retries',
      'Rate Limiting (Leaky Bucket / Token Bucket)',
      'API Versioning & Backward Compatibility',
      'Transaction Isolation & ACID Guarantees'
    ],
    interviewStyle:
      'Production-oriented, developer-first, and exceptionally rigorous. Stripe avoids artificial puzzle problems and instead tests real software engineering: debugging existing codebases with failing unit tests, building HTTP API integrations, and designing resilient financial ledgers.',
    sampleQuestions: [
      'Production Debugging: Fix memory leak and race condition in an open-source repo (Hard)',
      'Design Idempotent Payment Processing API with retry guarantees (Hard)',
      'Build a Reliable Webhook Event Delivery Engine with Exponential Backoff (Hard)',
      'Design Immutable Double-Entry Ledger System (Hard)',
      'Implement a Token Bucket Rate Limiter middleware in code (Medium)',
      'Parse and Execute JSON Currency Exchange Rules engine (Medium)'
    ],
    prepNotes: [
      'You are allowed to use your own IDE, documentation, and Stack Overflow during coding rounds. Focus on writing clean, tested, idiomatic code.',
      'Always write unit tests first. Stripe engineers value test coverage and code maintainability over raw speed.',
      'In System Design, focus heavily on correctness, idempotency, audit trails, and reconciliation over raw throughput.'
    ],
    systemDesignArchetypes: [
      'Design Stripe Payment Processing & Webhook Delivery Engine',
      'Design Multi-Currency Double-Entry Financial Ledger',
      'Design Developer API Rate Limiter & Metering Pipeline'
    ],
    culturalValues: [
      'Users First: Building tools that delight developers and empower global commerce',
      'Rigor: Striving for perfection and mathematical correctness in financial software',
      'Efficiency: Thoughtful, deliberate, and high-signal communication'
    ],
    communityInsights: [
      {
        title: 'The Bring-Your-Own-IDE Advantage',
        detail: 'Stripe lets you use your personal VSCode/IntelliJ setup with autocomplete and unit testing frameworks. Ensure your environment is configured for fast test execution.'
      },
      {
        title: 'The Debugging Round',
        detail: 'You will receive a codebase with 10 failing unit tests. The key is reading stack traces methodically, reproducing the error, and making minimal surgical fixes.'
      }
    ],
    roadmap: {
      duration: '5-week engineering loop',
      weeks: [
        {
          label: 'Week 1',
          focus: 'Production Debugging & Test-Driven Development',
          target: 'Practice debugging large open-source codebases, parsing logs, and writing comprehensive pytest/jest test suites.',
          topics: ['Isolating Regression Bugs', 'Race Conditions in Concurrency', 'Mocking HTTP Dependencies'],
          deliverable: 'Debug and fix 4 real-world open-source repositories within 45 mins each.'
        },
        {
          label: 'Week 2',
          focus: 'API Design & Clean Abstractions',
          target: 'Design elegant, developer-friendly REST/gRPC interfaces with backward compatibility and clear error codes.',
          topics: ['Idempotency-Key Header Handling', 'Webhook Event Signature Verification', 'Pagination & Filtering APIs'],
          deliverable: 'Build a fully working Payment API with idempotency and unit tests.'
        },
        {
          label: 'Week 3',
          focus: 'Data Structures & Practical Parsing',
          target: 'Drill AST parsing, rule evaluation engines, and rate limiter algorithms in your primary language.',
          topics: ['Token Bucket Rate Limiter', 'JSON Rule Evaluator', 'Interval Scheduling & Replay Logs'],
          deliverable: 'Implement 10 production-grade algorithms with 100% test coverage.'
        },
        {
          label: 'Week 4',
          focus: 'Financial System Design & Ledgers',
          target: 'Design double-entry ledgers, reconciliation engines, and multi-region idempotent payment gateways.',
          topics: ['Double-Entry Bookkeeping Ledger', 'Distributed Webhook Delivery with DLQ', 'Payment Gateway State Machine'],
          deliverable: 'Deliver complete architectural whitepaper for an immutable financial ledger.'
        },
        {
          label: 'Week 5',
          focus: 'Engineering Rigor & Cultural Simulation',
          target: 'Refine behavioral stories on handling critical production bugs, API migrations, and cross-team technical decisions.',
          topics: ['Root Cause Analysis (RCA) Postmortems', 'Managing Technical Debt', 'Developer Empathy'],
          deliverable: 'Pass complete 4-round Stripe mock interview loop.'
        }
      ],
      curatedPrep: [
        {
          title: 'Idempotency as a First-Class Citizen',
          detail: 'Never design a payment API without an Idempotency-Key header, distributed lock, and cached response payload.'
        },
        {
          title: 'Audit Trails & Immutability',
          detail: 'Financial data should never be updated in-place. Use append-only immutable ledgers with credit/debit balances.'
        },
        {
          title: 'Developer Experience (DX)',
          detail: 'Provide intuitive error payloads with clear messages, documentation links, and suggested fixes.'
        }
      ]
    }
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    region: 'San Francisco, CA / London',
    hiringProcess: [
      'Round 01: Coding & Systems Screen (45 mins — High Performance Python / C++)',
      'Round 02: Onsite 1 — Distributed Systems / GPU Cluster Orchestration (60 mins)',
      'Round 03: Onsite 2 — Deep Systems Programming / KV-Cache & Memory Alignment (60 mins)',
      'Round 04: Onsite 3 — High-Throughput Streaming API Architecture (SSE / WebSockets)',
      'Round 05: Behavioral & Alignment (AI Safety, Mission, and High Agency)'
    ],
    pyqTopics: [
      'KV-Cache Management & PagedAttention',
      'Distributed GPU Cluster Scheduling',
      'Server-Sent Events (SSE) & Stream Backpressure',
      'Matrix Multiplication & Memory Coalescing',
      'Distributed Checkpointing & Fault Recovery',
      'High-Concurrency Token Rate Limiters'
    ],
    interviewStyle:
      'Cutting-edge, systems-heavy, and high-agency. OpenAI looks for engineers who understand systems from the metal up: GPU memory hierarchies, streaming token pipelines, distributed training fault-tolerance, and building durable AI infrastructure.',
    sampleQuestions: [
      'Design High-Throughput LLM Inference Server with KV-Cache optimization (Hard)',
      'Implement Server-Sent Events (SSE) Streaming Proxy with Backpressure (Hard)',
      'Design Distributed GPU Cluster Scheduler for 10,000 H100 Nodes (Hard)',
      'Matrix Transposition & Cache Blocking in C++ (Medium)',
      'Design Fault-Tolerant Distributed Checkpointing System (Hard)',
      'Sliding Window Token Bucket with Priority Queuing for Tiered Users (Medium)'
    ],
    prepNotes: [
      'Understand LLM inference bottlenecks: memory bandwidth bound vs compute bound (FLOPs vs bytes transferred).',
      'Master concurrency primitives: asyncio, GIL workarounds in Python, zero-copy socket buffers, and C++ memory models.',
      'Emphasize High Agency: ability to solve open-ended problems with minimal guidance.'
    ],
    systemDesignArchetypes: [
      'Design OpenAI Real-Time Voice API with Bidirectional WebSockets',
      'Design Distributed LLM Inference Cluster with PagedAttention',
      'Design Multi-Tenant Embeddings Vector Database & Search'
    ],
    culturalValues: [
      'AGI Mission: Dedication to creating safe, beneficial artificial general intelligence',
      'High Agency & Intensity: Extreme ownership and rapid execution',
      'Rigorous Alignment & Safety: Thoughtful consideration of risks and ethical implications'
    ],
    communityInsights: [
      {
        title: 'Systems Over Theory',
        detail: 'Unless applying for a research scientist role, coding rounds focus on rock-solid distributed systems, networking, and memory efficiency rather than raw math derivations.'
      },
      {
        title: 'OpenAI Intensity',
        detail: 'Interviews move fast with deep probing into real-world production failures in large-scale distributed setups.'
      }
    ],
    roadmap: {
      duration: '5-week frontier loop',
      weeks: [
        {
          label: 'Week 1',
          focus: 'High Performance Python, C++ & Concurrency',
          target: 'Master asyncio event loops, multiprocessing, zero-copy buffers, and multi-threaded synchronization.',
          topics: ['Async IO Event Loop internals', 'Zero-Copy Socket Streaming', 'Lock-Free Ring Buffers'],
          deliverable: 'Build a high-performance concurrent streaming proxy server.'
        },
        {
          label: 'Week 2',
          focus: 'GPU Architecture & Memory Hierarchy',
          target: 'Understand H100/A100 GPU architectures, High Bandwidth Memory (HBM), NVLink interconnects, and KV-Cache mechanics.',
          topics: ['KV-Cache Memory Footprint Math', 'PagedAttention Concepts', 'Memory Bandwidth vs Compute Bound'],
          deliverable: 'Implement an in-memory KV-cache memory manager with paging.'
        },
        {
          label: 'Week 3',
          focus: 'Real-Time Streaming Systems & SSE',
          target: 'Build production-grade Server-Sent Events (SSE) and WebSocket gateways with backpressure handling.',
          topics: ['SSE Token Streaming', 'TCP Backpressure & Buffer Bloat', 'Distributed Token Bucket Rate Limiting'],
          deliverable: 'Implement complete streaming LLM proxy with client disconnect handling.'
        },
        {
          label: 'Week 4',
          focus: 'Distributed AI Infrastructure Design',
          target: 'Design distributed inference clusters, GPU job scheduling, and high-speed checkpoint storage.',
          topics: ['Design Distributed LLM Inference Cluster', 'Design GPU Cluster Scheduler', 'Design Vector Embedding DB'],
          deliverable: 'Deliver full architecture blueprint for 10,000 GPU distributed cluster.'
        },
        {
          label: 'Week 5',
          focus: 'High Agency Alignment & Full Simulation',
          target: 'Calibrate STAR stories on moving with extreme speed, handling ambiguity, and driving mission-critical projects.',
          topics: ['Navigating Rapidly Changing Technical Landscapes', 'Extreme Project Ownership', 'AI Safety Empathy'],
          deliverable: 'Pass complete 4-round OpenAI mock interview sequence.'
        }
      ],
      curatedPrep: [
        {
          title: 'Inference Math Mastery',
          detail: 'Be able to calculate exact memory requirements: weights (2 bytes/param in FP16) + KV cache (2 * 2 * n_layers * n_heads * d_head * seq_len bytes).'
        },
        {
          title: 'Backpressure & Streaming',
          detail: 'Always explain how downstream slow clients are prevented from consuming unbounded memory in streaming proxies.'
        },
        {
          title: 'High Agency Demonstration',
          detail: 'Demonstrate initiative where you identified an unowned critical problem and independently built the solution.'
        }
      ]
    }
  }
];

export const companyPrepCatalog: CompanyPrepItem[] = curatedProfiles;
