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
  category?: 'faang' | 'high-growth' | 'ai' | 'fintech' | 'enterprise' | 'service-based' | 'india-tech';
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
    "id": "google",
    "name": "Google",
    "category": "faang",
    "region": "Global / US / India",
    "hiringProcess": [
      "Round 01: Online Assessment (2 algorithmic challenges, 90 mins)",
      "Round 02: Technical Phone Screen (45 mins DSA with Google engineer)",
      "Round 03: Onsite 1 — Advanced Data Structures & Tree/Graph Theory (45 mins)",
      "Round 04: Onsite 2 — Dynamic Programming & Math/Optimization (45 mins)",
      "Round 05: Onsite 3 — Distributed System Design / Large Scale Architecture (45 mins)",
      "Round 06: Googleyness & Leadership Calibration (STAR behavioural)"
    ],
    "pyqTopics": [
      "Topological Sort & DAGs",
      "Binary Tree LCA & Subtree Isomorphism",
      "Dynamic Programming with Bitmasking",
      "Dijkstra & Shortest Path with State",
      "Distributed Cache Invalidation",
      "Consistent Hashing & Partitioning"
    ],
    "interviewStyle": "Highly structured, hypothesis-driven, and rigorous. Google interviewers evaluate first-principles algorithmic derivation, formal time/space complexity proofs, proactive boundary-condition testing, and Googleyness (intellectual humility & collaboration).",
    "sampleQuestions": [
      "Alien Dictionary: Build topological ordering from sorted lexicon (Hard)",
      "Word Ladder II: Find all shortest transformation sequences via BFS+DFS (Hard)",
      "Design Distributed Web Crawler: URL frontier, deduplication & polite fetchers (Hard)",
      "Median of Two Sorted Arrays: Binary search across partition cuts in O(log(min(N,M))) (Hard)",
      "Logger Rate Limiter: Sliding window token bucket with low memory drift (Medium)",
      "Range Sum Query 2D: Mutable Segment Tree / Binary Indexed Tree (Hard)"
    ],
    "prepNotes": [
      "Never write code immediately. Spend the first 4-5 minutes asking clarifying questions on scale, input domains, and nullability.",
      "Explicitly write out worst-case Time and Auxiliary Space complexities in Big-O notation before writing the first function line.",
      "Dry-run your solution line-by-line with a tricky edge case (empty array, single node, duplicate values) without the interviewer asking."
    ],
    "systemDesignArchetypes": [
      "Design Google Drive / File Sync with Chunk Deduplication",
      "Design Distributed Search Typeahead with Trie & Caching",
      "Design Global Rate Limiter across multiple datacenter regions"
    ],
    "culturalValues": [
      "Googleyness: Thriving in ambiguity and intellectual humility",
      "Bias for Scalable First-Principles Solutions",
      "Radical Respect for Teammates & Candidate Empathy"
    ],
    "communityInsights": [
      {
        "title": "Google Hiring Committee Reality",
        "detail": "The interviewer does not make the final hire call. They submit structured transcripts to an independent Hiring Committee. Clean code and explicit communication transcripts are paramount."
      },
      {
        "title": "Campus & New Grad Weightage",
        "detail": "For college students and new grads, DP, Graphs, and Tree traversals constitute 80% of questions. System design is replaced with an extra DSA/LLD problem solving round."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Two Pointers & Monotonic Structures",
          "target": "Solve 25 timed problems. Master Monotonic Queue, Sliding Window boundaries, and In-place Transformations.",
          "topics": [
            "Sliding Window Maximum",
            "Trapping Rain Water",
            "Next Greater Element",
            "Subarray Sum Equals K"
          ],
          "deliverable": "Complete 4 timed 35-minute mock sessions with zero runtime bugs."
        },
        {
          "label": "Week 2",
          "focus": "Graph Theory, Trees & Topological Sort",
          "target": "Master BFS/DFS with state, Union-Find with path compression, LCA in Binary Trees, and Cycle Detection in Directed Graphs.",
          "topics": [
            "Alien Dictionary",
            "Course Schedule I/II",
            "Lowest Common Ancestor",
            "Network Delay Time (Dijkstra)"
          ],
          "deliverable": "Solve 20 graph/tree problems while narrating every invariant out loud."
        },
        {
          "label": "Week 3",
          "focus": "Dynamic Programming & State Machines",
          "target": "Deconstruct complex DP recurrences: 1D, 2D grid, interval DP, and state machine transitions.",
          "topics": [
            "Longest Increasing Subsequence (O(N log N))",
            "Edit Distance",
            "Regular Expression Matching",
            "Burst Balloons"
          ],
          "deliverable": "Derive state transition equations on whiteboard before coding implementation."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design & Concurrency",
          "target": "Build production-ready in-memory components using SOLID principles, thread-safety, and clean abstractions.",
          "topics": [
            "LRU/LFU Cache",
            "Thread-Safe Blocking Queue",
            "Design In-Memory File System",
            "Pub-Sub Message Bus"
          ],
          "deliverable": "Implement 3 end-to-end OOP systems with comprehensive unit test coverage."
        },
        {
          "label": "Week 5",
          "focus": "Large-Scale Distributed Systems",
          "target": "Master sharding, replication, CAP theorem tradeoffs, consistent hashing, and write-heavy telemetry pipelines.",
          "topics": [
            "Distributed Rate Limiter",
            "Google Drive Chunking",
            "Global Typeahead Suggestion",
            "Distributed Unique ID Generator"
          ],
          "deliverable": "Draft complete end-to-end architectural blueprints under 40-minute constraints."
        },
        {
          "label": "Week 6",
          "focus": "Googleyness & Full Simulation Loop",
          "target": "Execute 5 full 45-minute live simulations with rigorous peer feedback on communication and boundary testing.",
          "topics": [
            "STAR Behavioral Framework",
            "Ambiguity Resolution",
            "Handling Technical Disagreements",
            "Googleyness Scenarios"
          ],
          "deliverable": "Pass 3 consecutive blind peer calibration interviews with Strong Hire ratings."
        }
      ],
      "curatedPrep": [
        {
          "title": "Complexity Proofs",
          "detail": "Always state both time and auxiliary space complexities with formal Big-O proofs before writing implementation."
        },
        {
          "title": "Defensive Testing",
          "detail": "Proactively walk through null inputs, integer overflows, cycles, and massive input boundary checks."
        },
        {
          "title": "Structured Dialogue",
          "detail": "Think aloud continuously; articulate trade-offs between iterative and recursive state space approaches."
        }
      ]
    }
  },
  {
    "id": "microsoft",
    "name": "Microsoft",
    "category": "enterprise",
    "region": "Redmond, WA / India / Global",
    "hiringProcess": [
      "Round 01: Codility Online Assessment (3 algorithmic problems, 90 mins)",
      "Round 02: Technical Screening (45 mins DSA & Problem Solving)",
      "Round 03: Onsite 1 — Trees, Graphs & Recursion (45 mins)",
      "Round 04: Onsite 2 — Data Structures & Low-Level Design / OOP (45 mins)",
      "Round 05: Onsite 3 — High-Level System Architecture & Azure Cloud Concepts (45 mins)",
      "Round 06: As-Appropriate (AA) / Partner Director Interview (Technical depth & culture)"
    ],
    "pyqTopics": [
      "Binary Trees & BST Manipulations",
      "String Parsing & Pattern Matching",
      "Dynamic Programming & Matrix Traversals",
      "Low-Level Object Oriented Design",
      "Distributed Caching & Async Messaging",
      "Microservice Resiliency & Cloud Architecture"
    ],
    "interviewStyle": "Emphasizes clean code readability, modular OOP architecture, pragmatic algorithmic efficiency, and collaborative growth mindset. Microsoft values maintainable code that handles real-world error conditions.",
    "sampleQuestions": [
      "Serialize and Deserialize Binary Tree (Hard)",
      "Spiral Matrix II: Generate NxN clockwise matrix (Medium)",
      "Design In-Memory File System with directory navigation (Hard)",
      "Word Search II: Trie + 2D Backtracking (Hard)",
      "Course Schedule III: Greedy with Max-Heap (Hard)",
      "Design Cloud Blob Storage Metadata Service (Hard)"
    ],
    "prepNotes": [
      "Write production-grade code with clean variable naming, modular helper functions, and error handling.",
      "For LLD rounds, demonstrate Design Patterns (Factory, Strategy, Observer) with clean interfaces and SOLID principles.",
      "Prepare for the AA (As-Appropriate) round by researching Azure, enterprise customer empathy, and growth mindset anecdotes."
    ],
    "systemDesignArchetypes": [
      "Design Microsoft Teams Real-time Messaging and Status Sync",
      "Design Distributed Task Scheduler with Retry Backoff",
      "Design Azure Blob Storage with Hot/Cold Tiering"
    ],
    "culturalValues": [
      "Growth Mindset: Learn-it-all rather than know-it-all",
      "Customer Obsession & Enterprise Reliability",
      "Diversity & Inclusive Collaboration"
    ],
    "communityInsights": [
      {
        "title": "As-Appropriate (AA) Round Veto Power",
        "detail": "The AA interviewer is a senior Partner or Principal who has veto power over the entire hiring loop. Treat this round with deep technical and cultural preparation."
      },
      {
        "title": "Emphasis on Clean Code",
        "detail": "Microsoft interviewers penalize hacky one-liners. Clean helper methods, guard clauses, and readable logic score highest."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Linked Lists",
          "target": "Master two pointers, fast/slow pointers, in-place reversals, and string matching.",
          "topics": [
            "Reverse Nodes in k-Group",
            "LRU Cache with Doubly Linked List",
            "Longest Substring Without Repeating Characters",
            "String to Integer (atoi)"
          ],
          "deliverable": "Solve 25 classic Microsoft string/array interview problems."
        },
        {
          "label": "Week 2",
          "focus": "Trees, BSTs & Trie Structures",
          "target": "Master tree traversals (in/pre/post/level), BST validation, LCA, and Prefix Tries.",
          "topics": [
            "Serialize/Deserialize Binary Tree",
            "Binary Tree Maximum Path Sum",
            "Implement Trie (Prefix Tree)",
            "Validate BST"
          ],
          "deliverable": "Implement 5 tree problems with both recursive and iterative stack traversals."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, BFS/DFS & Backtracking",
          "target": "Master connected components, bipartite graphs, topological sort, and combinatorial search.",
          "topics": [
            "Word Search II",
            "Number of Islands",
            "Clone Graph",
            "Reconstruct Itinerary (Eulerian Path)"
          ],
          "deliverable": "Complete 20 graph problems with clean cycle handling."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design & SOLID Principles",
          "target": "Design scalable OOP systems with design patterns (Strategy, Factory, Singleton, Observer).",
          "topics": [
            "Design Parking Lot",
            "Design Elevator System",
            "Design Snake and Ladder Game",
            "Design Splitwise Expense Sharing"
          ],
          "deliverable": "Write fully compilable OOP design solutions with unit test classes."
        },
        {
          "label": "Week 5",
          "focus": "High-Level System Design",
          "target": "Design scalable Azure-style cloud services, pub-sub architectures, and reliable databases.",
          "topics": [
            "Design Teams Chat",
            "Design Cloud File Sync (OneDrive)",
            "Design Distributed Rate Limiter",
            "Design Notification Engine"
          ],
          "deliverable": "Present 3 full 40-minute system design architectures."
        },
        {
          "label": "Week 6",
          "focus": "Growth Mindset & Live Mock Loop",
          "target": "Rehearse behavioural scenarios highlighting learning from failure, teamwork, and enterprise impact.",
          "topics": [
            "STAR Method for Microsoft Culture",
            "Handling Ambiguous Requirements",
            "AA Round Mock Scenarios"
          ],
          "deliverable": "Complete 3 full mock interview loops with Senior Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "OOP Architecture",
          "detail": "Structure solutions into clean domain classes, interfaces, and separation of concerns."
        },
        {
          "title": "Edge Case Rigor",
          "detail": "Check for null pointer exceptions, empty collections, and numerical boundary conditions."
        },
        {
          "title": "Cloud First Thinking",
          "detail": "Connect system design choices to cloud elasticity, availability zones, and geo-redundancy."
        }
      ]
    }
  },
  {
    "id": "amazon",
    "name": "Amazon",
    "category": "faang",
    "region": "Global / US / India / EU",
    "hiringProcess": [
      "Round 01: Online Assessment — 2 Coding Questions + Work Style Assessment (90 mins)",
      "Round 02: Technical Phone Screen (DSA + Leadership Principles, 60 mins)",
      "Round 03: Onsite 1 — Problem Solving, Trees & Graphs + 2 LPs (60 mins)",
      "Round 04: Onsite 2 — Dynamic Programming / Greedy + 2 LPs (60 mins)",
      "Round 05: Onsite 3 — Low-Level Object Oriented Design / LLD + 2 LPs (60 mins)",
      "Round 06: Onsite 4 — System Design / Bar Raiser Interview + 2 LPs (60 mins)"
    ],
    "pyqTopics": [
      "BFS/DFS on 2D Grids & Shortest Paths",
      "PriorityQueue & Top-K Streaming Elements",
      "Interval Merging & Greedy Scheduling",
      "Design Patterns & LLD (SOLID)",
      "Distributed Caching & DynamoDB Partitioning",
      "16 Amazon Leadership Principles"
    ],
    "interviewStyle": "Every single round divides time 50/50: 25-30 minutes dedicated to 14/16 Leadership Principles with probing follow-ups, and 30-35 minutes for high-speed, bug-free algorithmic coding or system design.",
    "sampleQuestions": [
      "Rotting Oranges: Multi-source BFS grid traversal (Medium)",
      "Merge k Sorted Lists: PriorityQueue min-heap reduction (Hard)",
      "Design Amazon Locker System: LLD with size matching & expiration (Medium)",
      "Word Break II: Backtracking with memoization (Hard)",
      "Course Schedule II: Topological sort with cycle detection (Medium)",
      "Design E-Commerce Flash Sale System with Inventory Locking (Hard)"
    ],
    "prepNotes": [
      "Prepare 2 distinct, highly quantified STAR stories for EVERY single Amazon Leadership Principle (Customer Obsession, Ownership, Bias for Action, Dive Deep, Earn Trust, Have Backbone).",
      "Never skip the Bar Raiser round preparation: Bar Raisers evaluate long-term hiring bar calibration and culture fit across teams.",
      "Practice writing fully working, syntactically valid code quickly; Amazon interviewers expect complete runnable logic within 25 minutes."
    ],
    "systemDesignArchetypes": [
      "Design Amazon Prime Video Recommendation & Streaming Engine",
      "Design High-Concurrency Flash Sale Inventory Reservation System",
      "Design Distributed Order Tracking & Notification Pipeline"
    ],
    "culturalValues": [
      "Customer Obsession: Start with customer and work backwards",
      "Ownership & Bias for Action: Speed matters in business",
      "Frugality, Dive Deep, and Highest Standards"
    ],
    "communityInsights": [
      {
        "title": "Bar Raiser Authority",
        "detail": "The Bar Raiser is from an outside team and has ultimate veto power. If you fail LPs with the Bar Raiser, strong coding scores cannot save the loop."
      },
      {
        "title": "STAR Metrics Requirement",
        "detail": "Amazon interviewers demand concrete metrics in answers (e.g. reduced latency by 34%, saved $120K annually, handled 45K RPS)."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Heaps, Two Pointers & Grid Traversal",
          "target": "Master Multi-source BFS, Top K elements with Heaps, and sliding window arrays.",
          "topics": [
            "Rotting Oranges",
            "Top K Frequent Elements",
            "Merge Intervals",
            "Meeting Rooms II"
          ],
          "deliverable": "Solve 25 Amazon-tagged priority queue and grid problems."
        },
        {
          "label": "Week 2",
          "focus": "Graphs, BFS/DFS & Disjoint Sets",
          "target": "Master Course Schedule, Word Ladder, Connected Components, and Minimum Spanning Trees.",
          "topics": [
            "Word Ladder",
            "Critical Connections in a Network (Tarjan Bridge)",
            "Number of Connected Components",
            "Network Delay Time"
          ],
          "deliverable": "Implement Tarjan Algorithm and Union-Find from scratch."
        },
        {
          "label": "Week 3",
          "focus": "Dynamic Programming & Strings",
          "target": "Master Knapsack variations, Longest Palindromic Substring, Word Break, and Coin Change.",
          "topics": [
            "Word Break I & II",
            "Coin Change",
            "Longest Valid Parentheses",
            "Decode Ways"
          ],
          "deliverable": "Solve 20 DP problems with bottom-up memory optimization."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design (LLD / OOD)",
          "target": "Master real-world Amazon LLD patterns: Lockers, Inventory, Shopping Cart, and Rate Limiter.",
          "topics": [
            "Design Amazon Locker",
            "Design Online Bookstore",
            "Design Vending Machine",
            "Design File Search API"
          ],
          "deliverable": "Write 4 complete compilable class diagrams with design patterns."
        },
        {
          "label": "Week 5",
          "focus": "System Design & DynamoDB Modeling",
          "target": "Master distributed inventory, payment gateways, message queues, and high-concurrency read/write.",
          "topics": [
            "Design Flash Sale System",
            "Design Order Management System",
            "Design Distributed Locking (Redis/Zookeeper)"
          ],
          "deliverable": "Architect 3 large-scale distributed systems under time constraints."
        },
        {
          "label": "Week 6",
          "focus": "16 Leadership Principles & Bar Raiser Simulation",
          "target": "Draft and rehearse 16 polished STAR stories with quantified business impact and lessons learned.",
          "topics": [
            "Customer Obsession Scenarios",
            "Bias for Action vs Dive Deep",
            "Bar Raiser Mock Interview"
          ],
          "deliverable": "Conduct 4 mock LP interviews with seasoned Amazon engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "LP Story Matrix",
          "detail": "Build a spreadsheet mapping 16 Leadership Principles to 8-10 major projects with concrete data metrics."
        },
        {
          "title": "Speed & Working Code",
          "detail": "Aim to reach a working baseline solution within 15 minutes, then optimize data structures."
        },
        {
          "title": "Scalability Trade-offs",
          "detail": "Be ready to discuss relational SQL vs NoSQL DynamoDB Single-Table Design trade-offs."
        }
      ]
    }
  },
  {
    "id": "meta",
    "name": "Meta",
    "category": "faang",
    "region": "Global / US / UK / India",
    "hiringProcess": [
      "Round 01: Technical Screen (2 algorithmic problems in 45 mins)",
      "Round 02: Onsite 1 — Coding Speed & Data Structures (2 problems, 45 mins)",
      "Round 03: Onsite 2 — Algorithmic Edge-Cases & Graphs/DP (2 problems, 45 mins)",
      "Round 04: Onsite 3 — Systems Design / Product Architecture (45 mins)",
      "Round 05: Onsite 4 — Behavioral & Engineering Leadership (STAR, 45 mins)"
    ],
    "pyqTopics": [
      "Two Pointers & Sliding Window",
      "Binary Tree Level Order & LCA",
      "Graph BFS/DFS & Topological Sort",
      "Dynamic Programming & Greedy",
      "Distributed Feed Architecture",
      "Real-Time Presence & Pub-Sub"
    ],
    "interviewStyle": "Extreme emphasis on coding speed, flawless execution, and zero syntax bugs. Meta candidates must solve TWO medium/hard algorithmic problems in 45 minutes, leaving zero room for prolonged debugging.",
    "sampleQuestions": [
      "Lowest Common Ancestor of a Binary Tree III (Medium)",
      "Minimum Remove to Make Valid Parentheses (Medium)",
      "Dot Product of Two Sparse Vectors (Medium)",
      "Vertical Order Traversal of a Binary Tree (Hard)",
      "Word Break (Medium)",
      "Design Instagram Feed with Dynamic Caching & Fanout (Hard)"
    ],
    "prepNotes": [
      "Target solving medium problems in under 12 minutes and hard problems in under 20 minutes with zero compiler errors.",
      "Practice writing bug-free code on a plain text editor without auto-completion or syntax highlighting.",
      "For System Design, master fanout-on-write vs fanout-on-read trade-offs and distributed cache synchronization."
    ],
    "systemDesignArchetypes": [
      "Design Facebook News Feed with Real-Time Ranking",
      "Design WhatsApp End-to-End Chat & Delivery Receipts",
      "Design Instagram Stories Ingestion & Ephemeral Storage"
    ],
    "culturalValues": [
      "Move Fast: Build with urgency and test in production",
      "Focus on Long-Term Impact & Bold Bets",
      "Be Open and Build Social Value"
    ],
    "communityInsights": [
      {
        "title": "Two Problems in 45 Minutes",
        "detail": "Meta rarely asks for novel mathematical tricks; they test speed and accuracy on standard data structures. Solving only 1 problem almost always results in a No-Hire."
      },
      {
        "title": "Plain Text Coding",
        "detail": "Interviews are conducted on CoderPad with execution disabled in many rounds. You must dry-run and prove correctness manually."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Rapid Two Pointers, Strings & Hash Tables",
          "target": "Solve 30 Meta-frequent string and array problems under 15 minutes each.",
          "topics": [
            "Minimum Remove to Make Valid Parentheses",
            "Valid Palindrome II",
            "Custom Sort String",
            "Subarray Sum Equals K"
          ],
          "deliverable": "Achieve average solve time under 14 minutes for LeetCode Mediums."
        },
        {
          "label": "Week 2",
          "focus": "Binary Trees & Tree Traversals",
          "target": "Master LCA with parent pointers, vertical order traversal, diameter, and serialization.",
          "topics": [
            "Lowest Common Ancestor III",
            "Vertical Order Traversal",
            "Binary Tree Right Side View",
            "Diameter of Binary Tree"
          ],
          "deliverable": "Solve 25 tree problems with clean linear time/space solutions."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, BFS & Shortest Paths",
          "target": "Master grid traversal, accounts merge, word ladder, and topological ordering.",
          "topics": [
            "Accounts Merge (Union Find)",
            "Shortest Path in Binary Matrix",
            "Word Ladder",
            "Alien Dictionary"
          ],
          "deliverable": "Implement Union-Find with path compression and rank optimization."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Binary Search",
          "target": "Master search in rotated sorted arrays, capacity to ship packages, and 1D/2D DP.",
          "topics": [
            "Search in Rotated Sorted Array",
            "Find Peak Element",
            "Divide Two Integers",
            "Continuous Subarray Sum"
          ],
          "deliverable": "Solve 20 binary search and DP edge-case questions."
        },
        {
          "label": "Week 5",
          "focus": "Scale Architecture & Feed Design",
          "target": "Master distributed feeds, cache tiers (TAO), graph databases, and notification fanout.",
          "topics": [
            "Design News Feed",
            "Design Messenger",
            "Design Proximity Service (Yelp)",
            "Design Live Comments Stream"
          ],
          "deliverable": "Draft 3 complete feed/messaging system blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Speed Drills & Meta Behavioral",
          "target": "Conduct 6 timed 45-minute sessions solving 2 problems per session, followed by behavioral alignment.",
          "topics": [
            "Mock 2-Problem Sprints",
            "Handling Conflicting Priorities",
            "Constructive Disagreement at Scale"
          ],
          "deliverable": "Complete 3 mock interviews meeting the 2-problem threshold."
        }
      ],
      "curatedPrep": [
        {
          "title": "Speed Execution",
          "detail": "Internalize standard templates (BFS, DFS, Binary Search, Sliding Window) for instant muscle memory."
        },
        {
          "title": "Dry-Run Discipline",
          "detail": "Trace code step-by-step with sample input before declaring the problem finished."
        },
        {
          "title": "System Design Breadth",
          "detail": "Cover CDN, Load Balancing, Cache Tiers, Database Sharding, and Async Workers within 35 minutes."
        }
      ]
    }
  },
  {
    "id": "apple",
    "name": "Apple",
    "category": "faang",
    "region": "Cupertino, CA / Global / India",
    "hiringProcess": [
      "Round 01: Recruiter Phone Screen (Background & team match)",
      "Round 02: Technical Phone Screen (45-60 mins DSA & Low-Level Concepts)",
      "Round 03: Onsite 1 — Deep Data Structures & Memory Management (60 mins)",
      "Round 04: Onsite 2 — Concurrency, Multithreading & OS Internals (60 mins)",
      "Round 05: Onsite 3 — Domain Specific Architecture / System Design (60 mins)",
      "Round 06: Onsite 4 — Cross-Functional & Cultural Calibration with Engineering Manager (60 mins)"
    ],
    "pyqTopics": [
      "Pointers, Memory Layout & Zero-Copy",
      "Thread Synchronization & Mutex/Semaphores",
      "Binary Trees, BSTs & Bit Manipulation",
      "LRU Cache & Low-Level In-Memory Buffers",
      "Distributed CloudKit Synchronization",
      "Hardware-Software Boundary Trade-offs"
    ],
    "interviewStyle": "Team-specific and deeply technical. Apple interviewers probe low-level engineering craft, memory efficiency, multithreaded correctness, and hardware-software architectural empathy.",
    "sampleQuestions": [
      "Implement LRU Cache with Thread-Safe Read/Write Locks (Hard)",
      "Find Median from Data Stream (Hard)",
      "Design Thread-Safe Circular Ring Buffer (Medium)",
      "Bitwise AND of Numbers Range (Medium)",
      "Flatten Nested List Iterator (Medium)",
      "Design Apple Push Notification Service (APNs) at Scale (Hard)"
    ],
    "prepNotes": [
      "Understand low-level memory allocation, stack vs heap, cache line alignment, and race conditions.",
      "Be prepared for deep domain questions tailored specifically to the hiring team (OS, CloudKit, Siri, WebKit, Media).",
      "Apple places immense value on privacy, end-to-end security, and elegant user-facing product empathy."
    ],
    "systemDesignArchetypes": [
      "Design Apple Push Notification Service (APNs) with Persistent TCP Connections",
      "Design iCloud Photo Backup with Incremental Delta Sync",
      "Design Global Siri Voice Query Routing & Low-Latency Inference"
    ],
    "culturalValues": [
      "Insane Attention to Detail & Craftsmanship",
      "User Privacy as a Fundamental Human Right",
      "Collaboration at the Intersection of Hardware & Software"
    ],
    "communityInsights": [
      {
        "title": "No Universal Hiring Bar",
        "detail": "Apple does not use a central hiring committee; individual teams own their hiring bar. Tailor your prep directly to the team domain."
      },
      {
        "title": "Low-Level Questions Common",
        "detail": "Even for backend/cloud roles, expect questions on memory leaks, locks, synchronization primitives, and OS scheduling."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Pointers, Bit Manipulation & Arrays",
          "target": "Master bitwise operations, memory alignments, and two-pointer arrays.",
          "topics": [
            "Single Number I/II/III",
            "Bitwise AND of Numbers Range",
            "LRU Cache",
            "Reverse Linked List in k-Groups"
          ],
          "deliverable": "Solve 25 bitwise and memory-sensitive array problems."
        },
        {
          "label": "Week 2",
          "focus": "Concurrency, Threading & Synchronization",
          "target": "Implement thread-safe structures: Reader-Writer locks, Ring Buffers, and Blocking Queues.",
          "topics": [
            "Thread-Safe Ring Buffer",
            "Producer-Consumer Problem",
            "Deadlock Detection & Prevention",
            "Print in Order (Concurrency)"
          ],
          "deliverable": "Implement 3 production-grade lock-free / thread-safe data structures."
        },
        {
          "label": "Week 3",
          "focus": "Trees, Graphs & Heaps",
          "target": "Master tree serializations, topological sorting, and stream medians.",
          "topics": [
            "Find Median from Data Stream",
            "Serialize and Deserialize N-ary Tree",
            "Course Schedule II",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph/tree questions with rigorous complexity analysis."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Caching Systems",
          "target": "Master in-memory caching algorithms (LRU, LFU, ARC) and 2D DP.",
          "topics": [
            "LFU Cache",
            "Longest Increasing Subsequence",
            "Trapping Rain Water",
            "Design In-Memory Key-Value Store"
          ],
          "deliverable": "Write a complete LFU Cache with O(1) time complexity across all operations."
        },
        {
          "label": "Week 5",
          "focus": "Large-Scale Apple Cloud Architecture",
          "target": "Design privacy-first, low-latency distributed systems (APNs, iCloud, Siri Routing).",
          "topics": [
            "Design APNs Notification Pipeline",
            "Design End-to-End Encrypted Sync",
            "Design Global CDN Edge Caching"
          ],
          "deliverable": "Present 3 end-to-end system design architectures."
        },
        {
          "label": "Week 6",
          "focus": "Team Domain Fit & Leadership Calibration",
          "target": "Rehearse technical deep-dives into your past architectural decisions and cross-functional leadership.",
          "topics": [
            "Privacy-Preserving Architecture",
            "Cross-Functional Technical Disagreements",
            "Apple Craftsmanship Standards"
          ],
          "deliverable": "Pass 3 mock interviews with Senior Apple/Big-Tech engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Memory & Concurrency",
          "detail": "Deep dive into volatile keywords, atomic operations, and memory barriers."
        },
        {
          "title": "Domain Relevance",
          "detail": "Research the specific Apple organization (CoreOS, Cloud Services, SPG, AI/ML) beforehand."
        },
        {
          "title": "Security & Privacy",
          "detail": "Incorporate zero-knowledge proofs, encryption at rest/transit, and anonymized telemetry into design."
        }
      ]
    }
  },
  {
    "id": "netflix",
    "name": "Netflix",
    "category": "faang",
    "region": "Los Gatos, CA / Global / Remote",
    "hiringProcess": [
      "Round 01: Recruiter Phone Screen & Culture Alignment (30 mins)",
      "Round 02: Technical Phone Screen — High-Level Architecture & Systems (45-60 mins)",
      "Round 03: Onsite 1 — Distributed Systems & Microservice Resiliency (60 mins)",
      "Round 04: Onsite 2 — Data Engineering / Concurrency & High-Throughput Pipelines (60 mins)",
      "Round 05: Onsite 3 — Deep Cultural Calibration with Director / VP (Freedom & Responsibility, 60 mins)",
      "Round 06: Onsite 4 — High-Level Domain Architecture (60 mins)"
    ],
    "pyqTopics": [
      "Microservice Resiliency (Circuit Breakers, Bulkheads, Fallbacks)",
      "High-Throughput Video Ingestion & Transcoding Pipelines",
      "Distributed Caching (EVCache, Redis Cluster)",
      "Adaptive Bitrate Streaming (ABR) Protocols",
      "Event-Driven Architecture with Kafka",
      "Chaos Engineering & Fault Injection"
    ],
    "interviewStyle": "Netflix hires senior engineers exclusively. Interviews emphasize massive-scale distributed systems, trade-offs between consistency and availability, fault tolerance, and the famous Netflix Culture of Freedom & Responsibility.",
    "sampleQuestions": [
      "Design Netflix Video Transcoding & Chunking Pipeline (Hard)",
      "Design Global Content Delivery Network (CDN) with Open Connect (Hard)",
      "Implement Circuit Breaker Pattern with Sliding Window Error Thresholds (Medium)",
      "Design Real-Time User Viewing History & Continue Watching Feed (Hard)",
      "Design Distributed Dynamic Rate Limiter across 500 microservices (Hard)",
      "Design A/B Testing & Metric Computation Engine at Scale (Hard)"
    ],
    "prepNotes": [
      "Read and internalize the Netflix Culture Memo thoroughly. You will be evaluated ruthlessly on candor, stunning colleagues standard, and ownership.",
      "Demonstrate deep mastery of Chaos Engineering (Chaos Monkey), graceful degradation, and asynchronous event-driven pipelines.",
      "Be prepared to debate architectural trade-offs with senior staff engineers without being defensive."
    ],
    "systemDesignArchetypes": [
      "Design Netflix Open Connect CDN & Video Routing Engine",
      "Design Global Multi-Region Active-Active Microservices Architecture",
      "Design Real-Time Personalized Recommendation & Ranking Pipeline"
    ],
    "culturalValues": [
      "Freedom and Responsibility: Selflessness over politics",
      "Stunning Colleagues: High performance is contagious",
      "Radical Candor & Highly Aligned, Loosely Coupled"
    ],
    "communityInsights": [
      {
        "title": "Senior-Only Hiring Bar",
        "detail": "Netflix rarely asks pure trivia DSA. Expect deep systems questions about real production outages, thread pool exhaustion, and network partitions."
      },
      {
        "title": "Culture Round is Decisive",
        "detail": "The culture interview with an Engineering Director is as rigorous as the technical rounds. Misalignment with Freedom & Responsibility is an instant reject."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Concurrency, Thread Pools & Resilience Patterns",
          "target": "Implement Circuit Breakers, Rate Limiters, and Backpressure mechanisms.",
          "topics": [
            "Circuit Breaker Implementation",
            "Token Bucket Rate Limiter",
            "Thread Pool Starvation Prevention",
            "Async Non-Blocking IO"
          ],
          "deliverable": "Build a production-ready resilient HTTP proxy with fallback mechanisms."
        },
        {
          "label": "Week 2",
          "focus": "Event Streaming & Kafka Architecture",
          "target": "Master partition strategies, consumer lag, exactly-once semantics, and stream processing.",
          "topics": [
            "Kafka Partitioning & Consumer Groups",
            "Real-Time Telemetry Pipeline",
            "Dead Letter Queues",
            "Event Sourcing"
          ],
          "deliverable": "Architect a 100K RPS event streaming pipeline with schema validation."
        },
        {
          "label": "Week 3",
          "focus": "Distributed Caching & Multi-Region Storage",
          "target": "Master EVCache, Redis clustering, cache stampede prevention, and multi-region Cassandra replication.",
          "topics": [
            "Cache Stampede / Dogpiling Mitigation",
            "Multi-Region Active-Active Replication",
            "DynamoDB / Cassandra Tuning"
          ],
          "deliverable": "Solve 3 multi-region data synchronization scenarios."
        },
        {
          "label": "Week 4",
          "focus": "Video Ingestion & CDN Architecture",
          "target": "Design high-throughput video encoding pipelines, adaptive bitrate streaming, and CDN edge placement.",
          "topics": [
            "Open Connect CDN Architecture",
            "Video Chunk Transcoding Pipeline",
            "Dynamic Bitrate Adaptation",
            "Asset Storage"
          ],
          "deliverable": "Draft complete blueprint for Netflix Video Delivery Pipeline."
        },
        {
          "label": "Week 5",
          "focus": "Observability, Chaos & Fault Tolerance",
          "target": "Design Chaos Monkey experiments, distributed tracing (Zipkin), and automated rollback engines.",
          "topics": [
            "Distributed Tracing & Correlation IDs",
            "Chaos Engineering Scenarios",
            "Canary Deployment Analysis"
          ],
          "deliverable": "Simulate 3 disaster recovery & cascading failure mitigation plans."
        },
        {
          "label": "Week 6",
          "focus": "Culture Memo Deep-Dive & Executive Simulation",
          "target": "Rehearse cultural scenarios: radical candor, dealing with underperformance, and high-alignment autonomy.",
          "topics": [
            "Freedom & Responsibility Scenarios",
            "Keeper Test Defense",
            "Executive Director Mock Interview"
          ],
          "deliverable": "Complete 2 full system design + culture interviews with Staff-level engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Active-Active Multi-Region",
          "detail": "Master cross-region replication latency, split-brain resolution, and regional failovers."
        },
        {
          "title": "Culture Alignment",
          "detail": "Prepare real career examples demonstrating proactivity without asking for managerial permission."
        },
        {
          "title": "Asynchronous Microservices",
          "detail": "Design systems that never block synchronously across network boundaries."
        }
      ]
    }
  },
  {
    "id": "uber",
    "name": "Uber",
    "category": "high-growth",
    "region": "Global / US / India / Amsterdam",
    "hiringProcess": [
      "Round 01: CodeSignal Online Assessment (4 problems, 70 mins)",
      "Round 02: Technical Phone Screen (DSA & Problem Solving, 45 mins)",
      "Round 03: Onsite 1 — Graph Algorithms & Geospatial Indexing (45 mins)",
      "Round 04: Onsite 2 — Advanced Dynamic Programming & Concurrency (45 mins)",
      "Round 05: Onsite 3 — Low-Level Object Oriented Design (60 mins)",
      "Round 06: Onsite 4 — High-Scale System Design & Real-Time Logistics (60 mins)",
      "Round 07: Onsite 5 — Culture & Behavioral Calibration"
    ],
    "pyqTopics": [
      "Geospatial Indexing (H3 Hexagonal Hierarchical Spatial Index, QuadTrees)",
      "Bipartite Graph Matching & Dispatch Algorithms",
      "Real-Time WebSocket Ingestion & Location Tracking",
      "Dynamic Pricing & Surge Multiplier Calculation",
      "Distributed Locks & Idempotency Keys in Payments",
      "High-Throughput Ringpop & Distributed Gossip"
    ],
    "interviewStyle": "Rigorous engineering focus on real-time systems, geospatial partitioning, concurrency, and high-concurrency LLD. Uber interviewers probe whether you can handle fast-moving physical world state updates.",
    "sampleQuestions": [
      "Design Ride-Matching Dispatch Engine with Geospatial H3 Indexing (Hard)",
      "Bus Routes: BFS on bipartite graph with minimum transfers (Hard)",
      "Design Real-Time Driver Location Ingestion Pipeline with WebSockets (Hard)",
      "Reconstruct Itinerary (Hard)",
      "Design Idempotent Payment Gateway with Distributed Locks (Medium)",
      "Design Uber Eats Delivery Time Estimator with Machine Learning Serving (Hard)"
    ],
    "prepNotes": [
      "Understand Uber open-source tech stack: H3 spatial index, Jaeger tracing, Ringpop, Cadence/Temporal workflow engine.",
      "For LLD, be ready to code working classes for ride matching, surge pricing, or payment state machines in 45 minutes.",
      "Explicitly explain how your architecture handles driver location updates every 4 seconds from 5 million active vehicles."
    ],
    "systemDesignArchetypes": [
      "Design Uber Ride Matching & Dispatch Architecture",
      "Design Real-Time Location Ingestion Engine (1M writes/sec)",
      "Design Uber Dynamic Surge Pricing Engine"
    ],
    "culturalValues": [
      "Go Get It: Bias for action and solving hard physical problems",
      "Trip-Obsessed: Customer and driver safety first",
      "Build with Heart & Great Minds Don't Think Alike"
    ],
    "communityInsights": [
      {
        "title": "Geospatial Focus",
        "detail": "Uber loves geospatial problems. Familiarize yourself with H3 hexagons, QuadTrees, GeoHashing, and spatial range queries."
      },
      {
        "title": "Working Code in LLD",
        "detail": "Unlike pure theoretical design, Uber LLD rounds require running code with clean design patterns and unit tests."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Graphs, BFS & Shortest Paths",
          "target": "Master Dijkstra, BFS on bipartite graphs, and minimum route transfers.",
          "topics": [
            "Bus Routes",
            "Network Delay Time",
            "Cheapest Flights Within K Stops",
            "Reconstruct Itinerary"
          ],
          "deliverable": "Solve 25 graph pathfinding and transfer optimization problems."
        },
        {
          "label": "Week 2",
          "focus": "Spatial Data Structures & Interval Processing",
          "target": "Master QuadTrees, GeoHash encoding, and interval scheduling.",
          "topics": [
            "Insert Delete GetRandom O(1)",
            "Meeting Rooms II",
            "QuadTree Construction",
            "Range Module"
          ],
          "deliverable": "Implement a 2D QuadTree spatial index from scratch in code."
        },
        {
          "label": "Week 3",
          "focus": "Dynamic Programming & State Transitions",
          "target": "Master travel optimization, knapsack variations, and sequence alignment.",
          "topics": [
            "Coin Change",
            "Word Break II",
            "Maximum Profit in Job Scheduling",
            "Trapping Rain Water"
          ],
          "deliverable": "Solve 20 Uber-tagged dynamic programming problems."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design (LLD / OOD)",
          "target": "Build production-ready code for real-time ride matching, surge calculator, and locker systems.",
          "topics": [
            "Design Ride Sharing Dispatcher",
            "Design Splitwise Payment Splitter",
            "Design Rate Limiter",
            "Design Parking Garage"
          ],
          "deliverable": "Implement 3 complete OOP designs with comprehensive unit tests."
        },
        {
          "label": "Week 5",
          "focus": "Real-Time High-Scale Distributed Systems",
          "target": "Architect high-throughput location ingestion, dispatch matching, and surge pricing.",
          "topics": [
            "Design Uber Backend",
            "Design Real-Time Location Tracker",
            "Design Push Notification Service"
          ],
          "deliverable": "Draft complete architecture diagrams for 1M QPS ingestion pipelines."
        },
        {
          "label": "Week 6",
          "focus": "Live Simulation & Cultural Alignment",
          "target": "Execute 4 live mock interview loops covering DSA speed, LLD, and Uber core values.",
          "topics": [
            "Uber Core Values Scenarios",
            "Handling Scale Bottlenecks",
            "Live Coding Sprints"
          ],
          "deliverable": "Pass 3 full mock interviews with Staff Uber engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Geospatial Partitioning",
          "detail": "Explain why hexagonal H3 cells outperform square grids for neighbor distance calculations."
        },
        {
          "title": "WebSocket Scalability",
          "detail": "Detail connection termination, gateway pooling, and async message passing via Kafka."
        },
        {
          "title": "Concurrency Safety",
          "detail": "Prevent double-booking of drivers using distributed locks (Redis Redlock) and optimistic concurrency."
        }
      ]
    }
  },
  {
    "id": "adobe",
    "name": "Adobe",
    "category": "enterprise",
    "region": "San Jose, CA / India / Global",
    "hiringProcess": [
      "Round 01: Online Assessment on HackerRank (3 coding problems, 90 mins)",
      "Round 02: Technical Interview 1 — Core Data Structures, Trees & Linked Lists (60 mins)",
      "Round 03: Onsite 1 — Advanced Algorithms, DP & Graphs (60 mins)",
      "Round 04: Onsite 2 — Low-Level Design & C++/Java Object Modeling (60 mins)",
      "Round 05: Onsite 3 — High-Level Cloud Architecture / Creative Cloud Systems (60 mins)",
      "Round 06: Director / HR Culture Fit Round (STAR behavioral)"
    ],
    "pyqTopics": [
      "Binary Search on Complex Predicates",
      "Tree Traversals & BST Manipulations",
      "Matrix Algorithms & Image/Pixel Processing",
      "Memory Efficient String Manipulation",
      "Object Oriented Design Patterns (Factory, Decorator, Composite)",
      "Collaborative Document Editing & Operational Transformation"
    ],
    "interviewStyle": "Strong emphasis on core algorithmic foundation, matrix/image manipulations, tree problems, and object-oriented design patterns. Adobe values clean mathematical logic and scalable cloud backend engineering.",
    "sampleQuestions": [
      "Rotate Image: In-place 2D matrix transformation (Medium)",
      "Word Search II: Trie with 2D backtracking (Hard)",
      "Design Collaborative Document Editing Engine with Operational Transformation (Hard)",
      "Median of Two Sorted Arrays (Hard)",
      "Design Adobe Sign PDF Security & Digital Signature Verification (Medium)",
      "LRU Cache with Custom Doubly Linked List (Medium)"
    ],
    "prepNotes": [
      "Brush up on 2D matrix operations, bitwise operations, and in-place transformations frequently asked in Adobe rounds.",
      "For design rounds, understand collaborative document synchronization (OT / CRDT) used in Creative Cloud tools.",
      "Demonstrate clean modular code with clear time and space complexity explanations."
    ],
    "systemDesignArchetypes": [
      "Design Adobe Creative Cloud Asset Sync & Versioning Engine",
      "Design Real-Time Collaborative Canvas / Whiteboard",
      "Design High-Throughput PDF Rendering & OCR Processing Pipeline"
    ],
    "culturalValues": [
      "Genuine, Exceptional, Innovative, and Involved",
      "Customer-Centric Innovation in Digital Experiences",
      "Long-Term Engineering Excellence"
    ],
    "communityInsights": [
      {
        "title": "Matrix & Geometry Questions",
        "detail": "Adobe frequently asks 2D matrix, geometry, and image manipulation questions related to pixel rendering."
      },
      {
        "title": "Comprehensive DSA Bar",
        "detail": "Expect equal weightage on Trees, Graphs, DP, and OOP design patterns across all technical rounds."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, 2D Matrices & Strings",
          "target": "Master matrix rotations, spiral orders, search in 2D sorted matrices, and string parsing.",
          "topics": [
            "Rotate Image",
            "Spiral Matrix",
            "Search a 2D Matrix II",
            "Set Matrix Zeroes"
          ],
          "deliverable": "Solve 25 matrix and string manipulation problems."
        },
        {
          "label": "Week 2",
          "focus": "Trees, BSTs & Prefix Tries",
          "target": "Master tree traversals, BST balancing, LCA, and multi-word searches.",
          "topics": [
            "Lowest Common Ancestor in BST",
            "Word Search II",
            "Construct Binary Tree from Preorder and Inorder",
            "Kth Smallest Element in BST"
          ],
          "deliverable": "Solve 20 tree/Trie problems with clean recursive and iterative code."
        },
        {
          "label": "Week 3",
          "focus": "Dynamic Programming & Recursion",
          "target": "Master 1D/2D DP, string edit distances, and subset partitioning.",
          "topics": [
            "Edit Distance",
            "Longest Common Subsequence",
            "Partition Equal Subset Sum",
            "Coin Change"
          ],
          "deliverable": "Solve 20 classic DP problems with space optimization."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design & Design Patterns",
          "target": "Master structural design patterns (Decorator, Composite, Adapter) for document/canvas modeling.",
          "topics": [
            "Design Document Editor with Undo/Redo",
            "Design File System",
            "Design Rate Limiter",
            "Design Paint Application Canvas"
          ],
          "deliverable": "Implement 3 compilable OOP design solutions with design patterns."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Cloud Architecture",
          "target": "Design scalable Creative Cloud sync engines, OCR pipelines, and digital signature systems.",
          "topics": [
            "Design Adobe Creative Cloud Asset Storage",
            "Design Real-Time Collaborative Canvas (OT/CRDT)",
            "Design PDF Processing Pipeline"
          ],
          "deliverable": "Present 3 end-to-end system architectures."
        },
        {
          "label": "Week 6",
          "focus": "Live Mock Sprints & Behavioral Alignment",
          "target": "Execute timed mock interview sessions covering problem solving, OOP design, and Adobe core values.",
          "topics": [
            "STAR Behavioral Framework",
            "Technical Communication",
            "Adobe Values Simulation"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Adobe Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Matrix & Geometry",
          "detail": "Master boundary checks, in-place coordinate swaps, and direction arrays [dx, dy]."
        },
        {
          "title": "OOP Design Patterns",
          "detail": "Clearly articulate why you chose Strategy or Observer patterns for extensible systems."
        },
        {
          "title": "Collaborative Sync",
          "detail": "Understand difference between Operational Transformation (OT) and CRDTs for real-time document editing."
        }
      ]
    }
  },
  {
    "id": "salesforce",
    "name": "Salesforce",
    "category": "enterprise",
    "region": "San Francisco, CA / India / Global",
    "hiringProcess": [
      "Round 01: HackerRank Online Assessment (2-3 algorithmic problems, 90 mins)",
      "Round 02: Technical Phone Screen (45-60 mins DSA & Architecture)",
      "Round 03: Onsite 1 — Data Structures & Graph Algorithms (60 mins)",
      "Round 04: Onsite 2 — Advanced Problem Solving & Dynamic Programming (60 mins)",
      "Round 05: Onsite 3 — Object Oriented Design & Multi-Tenant Architecture (60 mins)",
      "Round 06: Onsite 4 — High-Level Distributed System Design (60 mins)",
      "Round 07: Hiring Manager & Culture Alignment (Ohana Values)"
    ],
    "pyqTopics": [
      "Multi-Tenant Database Partitioning",
      "Graph Traversal & Dependency Resolution",
      "LRU/LFU In-Memory Caching",
      "Custom Metadata & Object Query Engines",
      "Event-Driven Pub-Sub Architecture",
      "Distributed Rate Limiting by Tenant"
    ],
    "interviewStyle": "Focuses on enterprise cloud reliability, multi-tenant architectural design, clean object-oriented code, and algorithmic efficiency. Salesforce evaluates how well you design systems that serve millions of diverse enterprise tenants securely.",
    "sampleQuestions": [
      "Design Multi-Tenant Database Metadata Engine (Hard)",
      "Design Distributed Rate Limiter with Per-Tenant Quotas (Medium)",
      "Course Schedule II: Package dependency resolution (Medium)",
      "Design LRU Cache with TTL Expiration (Medium)",
      "Trapping Rain Water (Hard)",
      "Design Salesforce Notification & Workflow Trigger Pipeline (Hard)"
    ],
    "prepNotes": [
      "Understand Multi-Tenant Architecture: shared database schemas, tenant isolation, governor limits, and metadata-driven compute.",
      "Write clean, modular code with strong encapsulation and separation of concerns.",
      "Prepare for Ohana culture questions emphasizing Trust, Customer Success, Innovation, and Equality."
    ],
    "systemDesignArchetypes": [
      "Design Multi-Tenant CRM Metadata Architecture",
      "Design Enterprise Workflow Automation & Trigger Engine",
      "Design Real-Time Event Streaming Bus across Enterprise Integrations"
    ],
    "culturalValues": [
      "Trust: The #1 value — security and reliability are non-negotiable",
      "Customer Success & Innovation",
      "Equality & Ohana Spirit"
    ],
    "communityInsights": [
      {
        "title": "Multi-Tenancy Emphasis",
        "detail": "Salesforce loves testing your understanding of multi-tenancy: how to prevent one rogue tenant from starving shared CPU/database resources."
      },
      {
        "title": "Clean Object Modeling",
        "detail": "In LLD rounds, demonstrate clear domain models, custom validation hooks, and event-driven observer triggers."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Hash Maps, Two Pointers & Arrays",
          "target": "Master custom hash functions, frequency maps, and interval mergers.",
          "topics": [
            "LRU Cache with TTL",
            "Subarray Sum Equals K",
            "Merge Intervals",
            "Insert Delete GetRandom O(1)"
          ],
          "deliverable": "Solve 25 array and caching problems."
        },
        {
          "label": "Week 2",
          "focus": "Graphs & Dependency Resolution",
          "target": "Master DAG topological sorting, cycle detection, and connected components.",
          "topics": [
            "Course Schedule I & II",
            "Alien Dictionary",
            "Evaluate Division",
            "Network Delay Time"
          ],
          "deliverable": "Build a dependency resolution engine for package managers."
        },
        {
          "label": "Week 3",
          "focus": "Trees, BSTs & Prefix Tries",
          "target": "Master Trie prefix searches, LCA, and balanced binary search trees.",
          "topics": [
            "Implement Trie",
            "Lowest Common Ancestor",
            "Serialize/Deserialize Binary Tree",
            "Binary Tree Maximum Path Sum"
          ],
          "deliverable": "Solve 20 tree and Trie questions."
        },
        {
          "label": "Week 4",
          "focus": "Object Oriented Design (LLD)",
          "target": "Design multi-tenant rate limiters, workflow triggers, and event notification engines.",
          "topics": [
            "Design Multi-Tenant Rate Limiter",
            "Design Workflow Execution Engine",
            "Design In-Memory Key-Value Store",
            "Design Parking Garage"
          ],
          "deliverable": "Implement 3 complete OOP designs with tenant isolation logic."
        },
        {
          "label": "Week 5",
          "focus": "Distributed Systems & Multi-Tenant Architecture",
          "target": "Design enterprise CRM backends, event streaming buses, and metadata engines.",
          "topics": [
            "Design Multi-Tenant CRM",
            "Design Global Notification Bus",
            "Design Scalable Audit Logging Engine"
          ],
          "deliverable": "Present 3 full system design architectures."
        },
        {
          "label": "Week 6",
          "focus": "Ohana Values & Live Mock Loop",
          "target": "Rehearse Trust, Customer Success, and leadership scenarios under the STAR framework.",
          "topics": [
            "Ohana Cultural Values",
            "Handling Outages & Trust",
            "Mock Interviews with Senior Engineers"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Salesforce Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Tenant Isolation",
          "detail": "Always consider tenant ID sharding, quota enforcement, and rate limit boundaries."
        },
        {
          "title": "Trust & Security",
          "detail": "Incorporate encryption, RBAC permissions, and audit trails into system designs."
        },
        {
          "title": "Clean Interfaces",
          "detail": "Write maintainable, self-documenting code with comprehensive unit test classes."
        }
      ]
    }
  },
  {
    "id": "oracle",
    "name": "Oracle",
    "category": "enterprise",
    "region": "Austin, TX / India / Global",
    "hiringProcess": [
      "Round 01: OCI / Oracle Online Assessment on HackerRank (3 problems, 90 mins)",
      "Round 02: Technical Phone Screen — Algorithms & OS Internals (60 mins)",
      "Round 03: Onsite 1 — Core Data Structures, Trees & Graphs (60 mins)",
      "Round 04: Onsite 2 — Dynamic Programming & Storage/Memory Efficiency (60 mins)",
      "Round 05: Onsite 3 — Low-Level Systems, Multithreading & C++/Java Concurrency (60 mins)",
      "Round 06: Onsite 4 — Distributed Cloud Architecture / OCI Infrastructure (60 mins)",
      "Round 07: Hiring Manager Behavioral & Leadership Calibration"
    ],
    "pyqTopics": [
      "B-Trees & LSM Trees Storage Engines",
      "Database Indexing, Transactions & ACID Locks",
      "Multithreading, Deadlocks & Memory Barriers",
      "Graph Pathfinding & Shortest Paths",
      "Distributed Consensus (Raft/Paxos)",
      "Cloud Virtualization & Block Storage"
    ],
    "interviewStyle": "Deeply grounded in systems engineering, operating system internals, database storage engines, multithreading, and algorithmic foundations. Oracle (especially OCI) tests deep fundamental computer science knowledge.",
    "sampleQuestions": [
      "Design Distributed Block Storage Engine with Replication (Hard)",
      "Implement Read-Write Lock with Writer Preference (Medium)",
      "Alien Dictionary (Hard)",
      "Serialize and Deserialize Binary Tree (Hard)",
      "Design In-Memory Relational Table with B+ Tree Indexing (Hard)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Master Database Internals: WAL (Write-Ahead Logging), B+ Trees, LSM Trees, MVCC (Multi-Version Concurrency Control), and distributed transactions (2PC).",
      "Be prepared for deep OS questions on memory virtualization, paging, thread synchronization, and CPU cache coherency.",
      "For OCI (Oracle Cloud Infrastructure), focus on cloud networking, block volumes, and distributed object storage."
    ],
    "systemDesignArchetypes": [
      "Design Oracle Cloud Infrastructure (OCI) Block Volume Service",
      "Design Distributed Relational Database with Raft Replication",
      "Design High-Throughput Database Transaction Log Engine"
    ],
    "culturalValues": [
      "Mission-Critical Reliability & Performance",
      "Deep Technical Rigor & First-Principles CS",
      "Customer Trust in Enterprise Data"
    ],
    "communityInsights": [
      {
        "title": "OCI Technical Bar",
        "detail": "Oracle Cloud Infrastructure (OCI) has one of the highest technical bars in the cloud industry, with heavy emphasis on distributed systems and concurrency."
      },
      {
        "title": "Deep OS & Database Theory",
        "detail": "Expect interviewers to ask how a B+ Tree splits nodes or how an OS kernel schedules kernel threads vs user-level threads."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Bit Manipulation & Memory Efficiency",
          "target": "Master low-level bit operations, memory layouts, and fast pointer traversals.",
          "topics": [
            "Single Number III",
            "Reverse Bits",
            "LRU Cache",
            "Sliding Window Maximum"
          ],
          "deliverable": "Solve 25 systems-oriented array and bitwise problems."
        },
        {
          "label": "Week 2",
          "focus": "Concurrency, Synchronization & Locks",
          "target": "Implement synchronization primitives: Read-Write Locks, Semaphores, and Barrier.",
          "topics": [
            "Read-Write Lock Implementation",
            "Producer Consumer with Blocking Queue",
            "Deadlock Detection Graph",
            "Dining Philosophers"
          ],
          "deliverable": "Write 3 complete multithreaded data structures with zero race conditions."
        },
        {
          "label": "Week 3",
          "focus": "Trees, Graphs & Pathfinding",
          "target": "Master B+ Tree concepts, Segment Trees, and Dijkstra/A* pathfinding.",
          "topics": [
            "Serialize Binary Tree",
            "Alien Dictionary",
            "Range Sum Query Mutable",
            "Word Ladder II"
          ],
          "deliverable": "Solve 20 tree/graph questions with formal complexity proofs."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Storage Optimization",
          "target": "Master 1D/2D DP, knapsack optimization, and memory cache line alignments.",
          "topics": [
            "Edit Distance",
            "Burst Balloons",
            "Regular Expression Matching",
            "Maximum Subarray Sum in Circular Array"
          ],
          "deliverable": "Solve 20 advanced DP problems."
        },
        {
          "label": "Week 5",
          "focus": "OCI Distributed Systems & Storage Engines",
          "target": "Design block storage services, distributed consensus engines (Raft), and WAL logging.",
          "topics": [
            "Design OCI Block Storage",
            "Design Distributed Key-Value Store with Raft",
            "Design Database WAL & Recovery Engine"
          ],
          "deliverable": "Draft 3 complete cloud infrastructure system architectures."
        },
        {
          "label": "Week 6",
          "focus": "Live Technical Sprints & Behavioral Fit",
          "target": "Execute timed mock interviews covering systems programming, architecture, and engineering ownership.",
          "topics": [
            "STAR Behavioral Method",
            "Outage Postmortem Scenarios",
            "OCI Architecture Review"
          ],
          "deliverable": "Complete 3 mock interviews with Principal OCI Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Database Engine Mastery",
          "detail": "Understand differences between B+ Trees (read-optimized) and LSM Trees (write-optimized)."
        },
        {
          "title": "Distributed Consensus",
          "detail": "Master leader election, log replication, and heartbeats in Raft consensus."
        },
        {
          "title": "Memory & Concurrency",
          "detail": "Articulate volatile variables, atomic instructions (CAS), and lock-free data structures."
        }
      ]
    }
  },
  {
    "id": "linkedin",
    "name": "LinkedIn",
    "category": "faang",
    "region": "Sunnyvale, CA / India / Global",
    "hiringProcess": [
      "Round 01: HackerRank Online Assessment (2-3 coding problems, 90 mins)",
      "Round 02: Technical Phone Screen (45-60 mins DSA on CoderPad)",
      "Round 03: Onsite 1 — Coding: Data Structures & Graph Algorithms (45-60 mins)",
      "Round 04: Onsite 2 — Coding: Advanced Recursion & Dynamic Programming (45-60 mins)",
      "Round 05: Onsite 3 — Distributed System Design / Craft & Architecture (60 mins)",
      "Round 06: Onsite 4 — Host Manager & Behavioral / Culture Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Social Graph Traversals (Bidirectional BFS, Degrees of Separation)",
      "Nested Lists & String Parsers",
      "Distributed Caching & Feed Generation",
      "Kafka / Samza Real-Time Event Streaming",
      "Segment Trees & Range Queries",
      "High-Throughput Connection Recommendations"
    ],
    "interviewStyle": "LinkedIn has a very clean, structured interview process with a high bar on graph traversals (especially Bidirectional BFS for connection degrees), clean recursion, and distributed systems architecture.",
    "sampleQuestions": [
      "Nested List Weight Sum I & II (Medium)",
      "Word Ladder & Word Ladder II (Hard)",
      "Design LinkedIn Feed with Real-Time Activity Streams (Hard)",
      "All O(1) Data Structure: Insert, Delete, GetMaxKey, GetMinKey in O(1) (Hard)",
      "Find Second Minimum in Binary Tree (Easy/Medium)",
      "Design People You May Know (PYMK) Graph Recommendation Engine (Hard)"
    ],
    "prepNotes": [
      "Master Bidirectional BFS: indispensable for social graph connection questions (Degrees of Separation between users).",
      "Write clean, modular code with descriptive variable names and explicit time/space complexity proofs.",
      "Understand LinkedIn open source technologies: Kafka, Pinot, Venice, Rest.li, and Espresso distributed database."
    ],
    "systemDesignArchetypes": [
      "Design People You May Know (PYMK) Social Graph Service",
      "Design LinkedIn Feed & Real-Time Notification Stream",
      "Design High-Throughput Distributed Analytics Engine (Pinot)"
    ],
    "culturalValues": [
      "Members First: Prioritize economic opportunity for members",
      "Relationships Matter & Be Open, Honest and Constructive",
      "Demand Excellence & Take Intelligent Risks"
    ],
    "communityInsights": [
      {
        "title": "Bidirectional BFS Favorite",
        "detail": "LinkedIn interviewers frequently ask for 2nd and 3rd degree connection graph searches using Bidirectional BFS."
      },
      {
        "title": "Emphasis on Code Readability",
        "detail": "Code modularity, clean helper functions, and test case dry runs are heavily weighted by the hiring team."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Nested Structures",
          "target": "Master nested list parsing, iterator design, and custom data structures.",
          "topics": [
            "Nested List Weight Sum I & II",
            "Flatten Nested List Iterator",
            "All O(1) Data Structure",
            "Subarray Sum Equals K"
          ],
          "deliverable": "Solve 25 LinkedIn-tagged array and string parser problems."
        },
        {
          "label": "Week 2",
          "focus": "Social Graphs & Bidirectional BFS",
          "target": "Master shortest paths in large social graphs, degrees of separation, and cycle detection.",
          "topics": [
            "Word Ladder I & II",
            "Shortest Path in Binary Matrix",
            "Clone Graph",
            "Degrees of Separation in Social Network"
          ],
          "deliverable": "Implement Bidirectional BFS from scratch with benchmark comparisons."
        },
        {
          "label": "Week 3",
          "focus": "Trees, BSTs & Binary Search",
          "target": "Master tree traversals, LCA, and range query data structures.",
          "topics": [
            "Lowest Common Ancestor in Binary Tree",
            "Binary Tree Maximum Path Sum",
            "Serialize Binary Tree",
            "Find Peak Element"
          ],
          "deliverable": "Solve 20 tree and binary search questions."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Caching",
          "target": "Master 1D/2D DP, string edit distances, and in-memory cache eviction.",
          "topics": [
            "Edit Distance",
            "Word Break",
            "Coin Change",
            "Design In-Memory Key-Value Store with Venice Storage Architecture"
          ],
          "deliverable": "Solve 20 DP problems with space optimization."
        },
        {
          "label": "Week 5",
          "focus": "Distributed Systems & Social Graph Scale",
          "target": "Design social feeds, connection recommendation engines (PYMK), and real-time messaging.",
          "topics": [
            "Design People You May Know (PYMK)",
            "Design LinkedIn Feed",
            "Design Distributed Analytics Engine with Pinot"
          ],
          "deliverable": "Draft 3 complete distributed social graph blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Cultural Calibration & Live Mock Sprints",
          "target": "Rehearse Members First, cross-functional collaboration, and live problem-solving under time pressure.",
          "topics": [
            "Members First Behavioral Scenarios",
            "Constructive Conflict Resolution",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior LinkedIn Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Bidirectional BFS",
          "detail": "Halves the search space from O(b^d) to O(b^(d/2)) when traversing social graphs."
        },
        {
          "title": "Data Structure Design",
          "detail": "Master combination of HashMaps + Doubly Linked Lists for O(1) insertions, deletions, and min/max queries."
        },
        {
          "title": "Distributed Stream Processing",
          "detail": "Understand Kafka partition offsets, consumer rebalances, and stream joins in Samza/Flink."
        }
      ]
    }
  },
  {
    "id": "atlassian",
    "name": "Atlassian",
    "category": "enterprise",
    "region": "Sydney, AU / Global / India / Remote",
    "hiringProcess": [
      "Round 01: Online Coding Assessment on Karat / HackerRank (3 problems, 60-90 mins)",
      "Round 02: Technical Phone Screen — Coding & Problem Solving (60 mins)",
      "Round 03: Onsite 1 — Data Structures & Algorithms (60 mins)",
      "Round 04: Onsite 2 — Low-Level Design & Code Craftsmanship (60 mins)",
      "Round 05: Onsite 3 — High-Level System Architecture & Scale (60 mins)",
      "Round 06: Onsite 4 — Values & Culture Alignment (Values Interview, 60 mins)"
    ],
    "pyqTopics": [
      "Rate Limiting & Sliding Window Counter",
      "File System & Tag-Based Search Engines",
      "Low-Level Object Oriented Design (SOLID, Extensibility)",
      "Collaborative Issue Tracking & KanBan Board Sync",
      "Event-Driven Webhook Delivery Pipelines",
      "High-Concurrency Microservices on AWS"
    ],
    "interviewStyle": "Atlassian places huge emphasis on code craftsmanship, clean naming, modular architecture, and their unique company values (e.g. Open company, no bullshit; Don't #@!% the customer). In LLD, candidates write real, running code in an IDE.",
    "sampleQuestions": [
      "Design In-Memory File System with Tagging & File Size Filtering (Medium)",
      "Design Distributed Rate Limiter with Sliding Window Counter (Medium)",
      "Design Jira Issue Tracking & Dependency Workflow Engine (Hard)",
      "Design Collaborative KanBan Board with Real-Time WebSocket Updates (Hard)",
      "Meeting Rooms II: Minimum conference rooms required (Medium)",
      "Design Reliable Webhook Ingestion & Delivery Service with Retry Backoff (Hard)"
    ],
    "prepNotes": [
      "In LLD rounds, code is written in a real IDE (IntelliJ, VS Code). Write clean Java/Python/TypeScript with unit tests and design patterns.",
      "Know all 5 Atlassian Values thoroughly: Open company, no bullshit; Build with heart & balance; Don't #@!% the customer; Play, as a team; Be the change you seek.",
      "Prioritize maintainability and clean abstractions over hyper-clever one-liners."
    ],
    "systemDesignArchetypes": [
      "Design Jira Issue Workflow & State Machine Engine",
      "Design Confluence Collaborative Document Real-Time Sync",
      "Design Enterprise Webhook Dispatch Pipeline with Dead-Letter Queues"
    ],
    "culturalValues": [
      "Open Company, No Bullshit: Radical transparency",
      "Don't #@!% the Customer: Prioritize user trust always",
      "Play, As a Team & Be the Change You Seek"
    ],
    "communityInsights": [
      {
        "title": "IDE Coding in LLD",
        "detail": "Atlassian lets you use your own IDE. You are expected to run code, write unit tests, and demonstrate clean OOP design patterns."
      },
      {
        "title": "Values Interview is Critical",
        "detail": "The Values interview is conducted by 2 trained values interviewers who have absolute veto power over the hire."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Hash Tables & Sliding Windows",
          "target": "Master rate limiting algorithms, sliding windows, and in-memory collections.",
          "topics": [
            "Design Hit Counter",
            "Sliding Window Maximum",
            "Meeting Rooms II",
            "Insert Delete GetRandom O(1)"
          ],
          "deliverable": "Solve 25 array, hashing, and rate-limiting problems."
        },
        {
          "label": "Week 2",
          "focus": "Low-Level Design & Code Craftsmanship",
          "target": "Build clean, testable OOP components in IDE: File System, Rate Limiter, and Tag Indexer.",
          "topics": [
            "Design In-Memory File System with Tags",
            "Design Rate Limiter with Token Bucket",
            "Design Snake and Ladder",
            "Design Coffee Machine"
          ],
          "deliverable": "Implement 3 complete OOP projects with 100% JUnit/pytest test coverage."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Dependency Engines",
          "target": "Master DAG dependency trees, topological sort, and cycle detection for issue tracking.",
          "topics": [
            "Course Schedule I & II",
            "Alien Dictionary",
            "Lowest Common Ancestor",
            "Serialize Binary Tree"
          ],
          "deliverable": "Build an issue dependency resolver with circular dependency detection."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & String Matching",
          "target": "Master sequence alignment, edit distance, and memoized recursion.",
          "topics": [
            "Edit Distance",
            "Longest Common Subsequence",
            "Word Break",
            "Coin Change"
          ],
          "deliverable": "Solve 20 classic DP questions."
        },
        {
          "label": "Week 5",
          "focus": "Enterprise Scale Architecture (Jira / Confluence)",
          "target": "Design scalable collaborative issue tracking, webhook delivery, and document sync.",
          "topics": [
            "Design Jira Workflow Engine",
            "Design Confluence Document Sync",
            "Design Reliable Webhook Delivery Pipeline"
          ],
          "deliverable": "Draft 3 complete enterprise architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "5 Atlassian Values & Live Simulation",
          "target": "Rehearse stories demonstrating transparency, team empathy, customer focus, and proactive leadership.",
          "topics": [
            "Atlassian Values Framework",
            "Handling Difficult Feedback",
            "Values Interview Simulation"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Atlassian Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "IDE Clean Code",
          "detail": "Structure classes with clear interfaces, separation of concerns, and clean dependency injection."
        },
        {
          "title": "Values Authenticity",
          "detail": "Be honest and authentic in the values interview; Atlassian values genuine humility and vulnerability."
        },
        {
          "title": "Webhook Reliability",
          "detail": "Master exponential backoff, circuit breaking, and idempotency keys in distributed webhook dispatch."
        }
      ]
    }
  },
  {
    "id": "stripe",
    "name": "Stripe",
    "category": "fintech",
    "region": "Global / US / Remote / Dublin",
    "hiringProcess": [
      "Round 01: Recruiter Phone Screen (Technical background & team alignment)",
      "Round 02: Technical Phone Screen — Practical Coding on CoderPad (60 mins)",
      "Round 03: Onsite 1 — Practical Coding: File/API Processing & Data Transformation (60 mins)",
      "Round 04: Onsite 2 — Practical Coding: Feature Extension on Live Codebase (60 mins)",
      "Round 05: Onsite 3 — Distributed System Design / Payment Infrastructure (60 mins)",
      "Round 06: Onsite 4 — Bug Squash / Debugging Real Production Issue (60 mins)",
      "Round 07: Onsite 5 — Behavioral & Engineering Leadership Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Idempotency Keys & Deduplication in Payments",
      "Distributed Two-Phase Commit & Saga Orchestration",
      "High-Throughput Rate Limiting & Sliding Windows",
      "Financial Ledger Double-Entry Bookkeeping",
      "Webhook Delivery with Exponential Backoff",
      "API Versioning & Backward Compatibility"
    ],
    "interviewStyle": "Stripe does NOT ask classic puzzle LeetCode. Instead, they test real-world software engineering: parsing API payloads, implementing rate limiters, refactoring existing code, debugging distributed bugs, and designing fault-tolerant financial pipelines.",
    "sampleQuestions": [
      "Implement Idempotent Payment API with Key Caching & Race Condition Locking (Hard)",
      "Design Distributed Double-Entry Financial Ledger with Immutable Audit Trail (Hard)",
      "Implement Rate Limiter with Sliding Window Token Bucket Algorithm (Medium)",
      "Implement HTTP Request Router with Wildcard Route Matching & Path Variables (Medium)",
      "Bug Squash: Find and fix concurrency race condition in banking transaction worker (Hard)",
      "Design Global Payment Orchestration Engine with Multi-Acquirer Routing (Hard)"
    ],
    "prepNotes": [
      "Practice writing clean, idiomatic code using standard language libraries (collections, json, regex, threading) in your favorite language.",
      "Master Idempotency, Exactly-Once Processing Semantics, Distributed Locks (Redis/Postgres), and Double-Entry Bookkeeping principles.",
      "In the Bug Squash round, read logs carefully, write unit tests to reproduce the bug first, and explain your hypothesis before patching."
    ],
    "systemDesignArchetypes": [
      "Design Stripe Idempotent Payment Gateway & Acquirer Routing",
      "Design Immutable Double-Entry Ledger for Millions of Accounts",
      "Design Global Webhook Delivery Engine with Exponential Jitter Backoff"
    ],
    "culturalValues": [
      "Users First: Relentless empathy for developers building businesses",
      "Move with Urgency & Rigor: Quality and speed are not trade-offs",
      "Intellectual Rigor & Continuous Learning"
    ],
    "communityInsights": [
      {
        "title": "Practical Coding Focus",
        "detail": "You are allowed to look up documentation and use standard libraries. Stripe evaluates how efficiently and cleanly you build real production features."
      },
      {
        "title": "Zero Tolerance for Data Inconsistency",
        "detail": "In fintech design rounds, losing or duplicating a transaction is a critical failure. Always show idempotency keys and transactional boundaries."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "API Processing, Parsing & Data Structures",
          "target": "Master JSON payload parsing, router matching, interval merges, and token buckets.",
          "topics": [
            "HTTP Route Matching with Wildcards",
            "Sliding Window Rate Limiter",
            "JSON Schema Validator",
            "LRU Cache with TTL"
          ],
          "deliverable": "Implement a complete micro-framework HTTP router with route middleware."
        },
        {
          "label": "Week 2",
          "focus": "Idempotency, Concurrency & Distributed Locks",
          "target": "Implement idempotent API filters, distributed locking mechanisms, and atomic counters.",
          "topics": [
            "Idempotency Key Middleware",
            "Distributed Lock with Redis Redlock",
            "Double-Spend Prevention",
            "Atomic Balance Updates"
          ],
          "deliverable": "Build an idempotent payment endpoint with optimistic locking."
        },
        {
          "label": "Week 3",
          "focus": "Financial Ledgers & Double-Entry Accounting",
          "target": "Master double-entry bookkeeping schemas, immutable audit trails, and reconciliation workers.",
          "topics": [
            "Double-Entry Ledger Schema",
            "Account Balance Invariant Proofs",
            "Reconciliation Pipeline",
            "Currency Exchange Engine"
          ],
          "deliverable": "Implement a zero-loss double-entry financial ledger service with unit tests."
        },
        {
          "label": "Week 4",
          "focus": "Bug Squashing & Live Code Refactoring",
          "target": "Practice reading unfamiliar codebases, writing reproduction tests, and fixing concurrency bugs.",
          "topics": [
            "Debugging Race Conditions",
            "Thread Deadlock Analysis",
            "Memory Leak Profiling",
            "Refactoring Monoliths"
          ],
          "deliverable": "Complete 3 timed bug squashing simulations in 45 minutes."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Payment System Design",
          "target": "Architect payment gateways, card vaults (PCI-DSS), webhook dispatchers, and fraud detection.",
          "topics": [
            "Design Stripe Payment Gateway",
            "Design Global Webhook Delivery Engine",
            "Design Fraud Scoring Pipeline"
          ],
          "deliverable": "Draft 3 complete financial infrastructure architectures."
        },
        {
          "label": "Week 6",
          "focus": "Live Stripe Simulation & Cultural Calibration",
          "target": "Execute 4 mock interview sessions with real-world developer API tooling and leadership scenarios.",
          "topics": [
            "Developer Experience Philosophy",
            "Handling Critical Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Pass 3 practical coding and system design mock sessions with Senior Stripe Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Idempotency & Race Conditions",
          "detail": "Always use database unique constraints on idempotency keys to guarantee safety against concurrent network retries."
        },
        {
          "title": "Double-Entry Invariants",
          "detail": "Every transaction must have equal debit and credit sums: sum(debits) - sum(credits) == 0 at all times."
        },
        {
          "title": "Practical Code Speed",
          "detail": "Familiarize yourself with your IDE shortcuts and language standard library functions."
        }
      ]
    }
  },
  {
    "id": "bloomberg",
    "name": "Bloomberg",
    "category": "fintech",
    "region": "New York, NY / London, UK / Global",
    "hiringProcess": [
      "Round 01: Technical Phone Screen on HackerRank (2 problems, 60 mins)",
      "Round 02: Onsite 1 — Data Structures, Strings & Linked Lists (60 mins)",
      "Round 03: Onsite 2 — Graphs, Trees & Concurrency / Multi-Threading (60 mins)",
      "Round 04: Onsite 3 — Low-Level Systems & Distributed Real-Time Architecture (60 mins)",
      "Round 05: Engineering Manager Behavioral & Values Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Real-Time Financial Market Data Streaming",
      "Pointers, C++ Memory & Custom Data Structures",
      "Binary Trees, BSTs & Custom Comparators",
      "Multi-Threaded Producer-Consumer Queues",
      "Ultra-Low Latency Order Book Matching",
      "Two-Pointer & Sliding Window Stream Analytics"
    ],
    "interviewStyle": "Heavy focus on memory efficiency, C++/Java low-level concurrency, custom data structure design (e.g. Leaderboard, Order Book, Stock Ticker), and real-time financial market data latency optimization.",
    "sampleQuestions": [
      "Design In-Memory Stock Ticker / Leaderboard (Top K Stocks by Volume) in O(1) (Hard)",
      "Design Real-Time Limit Order Book with Price-Time Priority Matching Engine (Hard)",
      "Two City Scheduling: Greedy cost minimization (Medium)",
      "Design Underground System: Average travel time tracking (Medium)",
      "Subway / Transit System Travel Time Tracking with O(1) lookups (Medium)",
      "Flatten a Multilevel Doubly Linked List (Medium)"
    ],
    "prepNotes": [
      "Be prepared to design custom composite data structures combining HashMaps, Balanced BSTs (std::map), and Doubly Linked Lists.",
      "Bloomberg interviewers care deeply about memory footprint, cache locality, and sub-millisecond execution latency.",
      "Show passion for financial market infrastructure and high-throughput real-time data feeds."
    ],
    "systemDesignArchetypes": [
      "Design Real-Time Limit Order Book & Matching Engine",
      "Design Bloomberg Terminal Financial News & Market Feed Ingestion",
      "Design Distributed Market Data Cache for Millions of Financial Instruments"
    ],
    "culturalValues": [
      "Speed, Accuracy, and Transparency in Financial Markets",
      "Collaborative Engineering & Constant Innovation",
      "Philanthropy and Ethical Standards"
    ],
    "communityInsights": [
      {
        "title": "Custom Composite Data Structures",
        "detail": "Bloomberg almost always asks you to design a custom class (e.g. Stock Ticker, Underground Transit Tracker, Leaderboard) with O(1) or O(log N) operations."
      },
      {
        "title": "C++ & Low Latency Edge",
        "detail": "If interviewing in C++, expect deep questions on const references, move semantics, memory layout, and smart pointers."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Custom Data Structures & Composite Containers",
          "target": "Master HashMap + Doubly Linked List / TreeSet combinations for O(1) operations.",
          "topics": [
            "Design Underground System",
            "Design Leaderboard",
            "LRU/LFU Cache",
            "Insert Delete GetRandom O(1)"
          ],
          "deliverable": "Solve 25 Bloomberg-tagged custom data structure questions."
        },
        {
          "label": "Week 2",
          "focus": "Linked Lists & Multilevel Pointers",
          "target": "Master in-place pointer manipulations, cycle detection, and flattening nested lists.",
          "topics": [
            "Flatten a Multilevel Doubly Linked List",
            "Copy List with Random Pointer",
            "Reverse Nodes in k-Group",
            "Merge k Sorted Lists"
          ],
          "deliverable": "Implement 20 linked list problems with zero extra space."
        },
        {
          "label": "Week 3",
          "focus": "Trees, Graphs & Priority Queues",
          "target": "Master Top-K streaming elements, BFS graph routing, and BST balance.",
          "topics": [
            "Top K Frequent Words",
            "Word Break II",
            "Number of Islands",
            "Course Schedule II"
          ],
          "deliverable": "Solve 20 graph and tree problems with optimal Big-O bounds."
        },
        {
          "label": "Week 4",
          "focus": "Concurrency, Threading & Memory Optimization",
          "target": "Master lock-free ring buffers, thread-safe queues, and order matching engines.",
          "topics": [
            "Thread-Safe Queue",
            "Limit Order Book Engine",
            "Producer-Consumer Synchronization",
            "Memory Footprint Tuning"
          ],
          "deliverable": "Implement a working Limit Order Book matching engine."
        },
        {
          "label": "Week 5",
          "focus": "Real-Time Financial System Architecture",
          "target": "Design low-latency market data feeds, terminal news distribution, and real-time streaming.",
          "topics": [
            "Design Real-Time Market Data Feed",
            "Design Bloomberg Terminal News Ingestion",
            "Design Distributed In-Memory Cache"
          ],
          "deliverable": "Draft 3 complete financial system architectures."
        },
        {
          "label": "Week 6",
          "focus": "Live Simulation & Manager Calibration",
          "target": "Execute timed mock interviews with focus on communication, edge cases, and Bloomberg values.",
          "topics": [
            "Financial Market Motivation",
            "Handling Latency Bottlenecks",
            "Live Coding Sprints"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Bloomberg Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Order Book Architecture",
          "detail": "Master price-time priority: Map<Price, DoublyLinkedList<Order>> for O(1) order insertion and matching."
        },
        {
          "title": "Memory Footprint",
          "detail": "Avoid unnecessary object allocations and copying inside high-frequency processing loops."
        },
        {
          "title": "Clarifying Constraints",
          "detail": "Always ask about scale: how many symbols, updates per second, and read vs write ratios."
        }
      ]
    }
  },
  {
    "id": "goldman-sachs",
    "name": "Goldman Sachs",
    "category": "fintech",
    "region": "New York, NY / London, UK / Bengaluru, India",
    "hiringProcess": [
      "Round 01: HackerRank Online Assessment (Math/Probability + 2 DSA problems, 90 mins)",
      "Round 02: Technical Phone Screen on CoderPad (60 mins DSA & System Concepts)",
      "Round 03: Onsite 1 — Data Structures & Algorithmic Problem Solving (60 mins)",
      "Round 04: Onsite 2 — Core Java / C++, Memory & Concurrency / Multi-Threading (60 mins)",
      "Round 05: Onsite 3 — High-Level Financial System Design / Trading Architecture (60 mins)",
      "Round 06: Onsite 4 — Engineering Leadership & Quantitative Analytical Culture (60 mins)"
    ],
    "pyqTopics": [
      "Combinatorics, Probability & Mathematical Logic",
      "High-Throughput Order Routing & Trade Execution",
      "Java Memory Model, Garbage Collection & Low Latency",
      "Tree Traversals & Graph Shortest Paths",
      "Dynamic Programming & Matrix Traversals",
      "Distributed Caching & Financial Transaction Logging"
    ],
    "interviewStyle": "Goldman Sachs tests strong mathematical reasoning, pure algorithmic derivation, deep Java/C++ memory internals, concurrency/threading, and financial systems design.",
    "sampleQuestions": [
      "High Five: Calculate top 5 average scores per student (Medium)",
      "Trapping Rain Water (Hard)",
      "Knight Probability in Chessboard (Medium)",
      "Design Real-Time Trade Booking & Settlement Engine with Audit Trail (Hard)",
      "First Unique Character in a String / First Non-Repeating Character (Easy/Medium)",
      "Minimum Size Subarray Sum (Medium)"
    ],
    "prepNotes": [
      "Prepare for basic probability, expected values, and combinatorics frequently asked in Goldman Sachs rounds.",
      "If interviewing in Java, master JVM memory model, GC tuning (G1, ZGC), volatile, Atomic primitives, and ConcurrentHashMap internals.",
      "Demonstrate deep awareness of transactional integrity, auditability, and regulatory compliance in trading systems."
    ],
    "systemDesignArchetypes": [
      "Design Real-Time Trade Execution & Allocation Engine",
      "Design Market Risk Analytics & Value-at-Risk (VaR) Engine",
      "Design Secure Banking Transaction Processing & Fraud Screening Engine"
    ],
    "culturalValues": [
      "Client Service & Fiduciary Responsibility",
      "Excellence, Innovation & Deep Analytical Rigor",
      "Integrity and Partnership"
    ],
    "communityInsights": [
      {
        "title": "Math & Quant Flavor",
        "detail": "Goldman Sachs frequently blends DSA with probability, prime factorization, and matrix mathematics."
      },
      {
        "title": "JVM & Concurrency Depth",
        "detail": "Expect deep questions on how ConcurrentHashMap locks buckets and how CAS (Compare-And-Swap) works under the hood."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Sliding Windows",
          "target": "Master two pointers, subarray sums, and string transformations.",
          "topics": [
            "High Five",
            "Minimum Size Subarray Sum",
            "Trapping Rain Water",
            "Subarray Sum Equals K"
          ],
          "deliverable": "Solve 25 Goldman Sachs tagged array and string problems."
        },
        {
          "label": "Week 2",
          "focus": "Probability, Math & Dynamic Programming",
          "target": "Master combinatorics, expected value calculations, and grid DP.",
          "topics": [
            "Knight Probability in Chessboard",
            "Soup Servings",
            "Coin Change",
            "Target Sum"
          ],
          "deliverable": "Solve 20 probability and DP problems."
        },
        {
          "label": "Week 3",
          "focus": "Trees, Graphs & Priority Queues",
          "target": "Master BSTs, Dijkstra shortest paths, and stream processing with heaps.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Top K Frequent Elements",
            "Network Delay Time"
          ],
          "deliverable": "Solve 20 graph/tree problems with optimal space bounds."
        },
        {
          "label": "Week 4",
          "focus": "Java Concurrency & Memory Internals",
          "target": "Master JVM memory, GC algorithms, ConcurrentHashMap, volatile, and thread pools.",
          "topics": [
            "ConcurrentHashMap Internals",
            "Thread-Safe Blocking Queue",
            "Atomic Reference & CAS",
            "JVM Garbage Collection Tuning"
          ],
          "deliverable": "Write 3 lock-free/thread-safe financial data structures."
        },
        {
          "label": "Week 5",
          "focus": "Trading & Banking System Design",
          "target": "Design high-throughput trade booking engines, VaR risk calculation engines, and payment ledgers.",
          "topics": [
            "Design Trade Booking Engine",
            "Design Risk Analytics Engine",
            "Design Payment Reconciliation System"
          ],
          "deliverable": "Draft 3 complete financial system architectures."
        },
        {
          "label": "Week 6",
          "focus": "Leadership Calibration & Live Mock Sprints",
          "target": "Rehearse client focus, ethical decision making, and quantitative problem solving under time constraints.",
          "topics": [
            "STAR Behavioral Framework",
            "Handling Regulatory & Compliance Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Goldman Sachs Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Probability & Math",
          "detail": "Review Bayes theorem, expected values, and dynamic programming on probability grids."
        },
        {
          "title": "JVM Internals",
          "detail": "Explain happens-before relationship, memory visibility, and CPU cache coherency (MESI protocol)."
        },
        {
          "title": "Trading System Invariants",
          "detail": "Always explain how trade matching prevents negative cash balances and unauthorized risk exposure."
        }
      ]
    }
  },
  {
    "id": "jpmorgan",
    "name": "JPMorgan Chase",
    "category": "fintech",
    "region": "New York, NY / London, UK / Bengaluru, India",
    "hiringProcess": [
      "Round 01: HackerRank Online Coding Assessment (2 problems, 60 mins)",
      "Round 02: Technical Video Screen on HireVue / CoderPad (45-60 mins)",
      "Round 03: Onsite 1 — Core Data Structures & String/Array Algorithms (60 mins)",
      "Round 04: Onsite 2 — Java / Python Enterprise Architecture & Concurrency (60 mins)",
      "Round 05: Onsite 3 — Scalable Financial Cloud & Microservices Design (60 mins)",
      "Round 06: Onsite 4 — Leadership, Ethics & Culture Calibration (60 mins)"
    ],
    "pyqTopics": [
      "High-Throughput Payment Processing & ISO 20022",
      "Java Multi-Threading & Thread Pool Sizing",
      "Event-Driven Microservices with Kafka",
      "Distributed Ledger & Blockchain (Onyx by JPM)",
      "Tree Traversals & Graph Shortest Paths",
      "Resilient Database Transactions & Data Integrity"
    ],
    "interviewStyle": "Focuses on enterprise scale, Java/Python programming craft, microservice design patterns, resilient banking systems, and rigorous financial security and compliance.",
    "sampleQuestions": [
      "Design Global High-Speed Wire Transfer & Payment Clearing Engine (Hard)",
      "Design Distributed Credit Card Fraud Detection Pipeline with Low Latency (Hard)",
      "Happy Number: Cycle detection with Floyd cycle-finding algorithm (Easy/Medium)",
      "Subarray Sums Divisible by K: Prefix sum with modulo arithmetic (Medium)",
      "Implement Thread-Safe Account Balance Transfer with Deadlock Avoidance (Medium)",
      "Number of Islands: 2D grid BFS/DFS (Medium)"
    ],
    "prepNotes": [
      "Master thread safety and deadlock prevention (e.g. always acquiring account locks in consistent global ID order).",
      "Demonstrate understanding of modern cloud architecture (AWS/K8s), Spring Boot microservices, and Kafka event streaming.",
      "Highlight security best practices: encryption at rest/transit, mTLS, OAuth2, and role-based access control."
    ],
    "systemDesignArchetypes": [
      "Design Global Multi-Currency Payment Clearing Engine",
      "Design Real-Time Credit Card Fraud Detection Pipeline",
      "Design Enterprise Banking Microservices with Distributed Transactions"
    ],
    "culturalValues": [
      "Exceptional Client Service & Financial Integrity",
      "Operational Excellence and Risk Management",
      "Diversity, Inclusion & Global Partnership"
    ],
    "communityInsights": [
      {
        "title": "Heavy Java & Spring Focus",
        "detail": "For backend roles, expect in-depth questions on Spring Boot, dependency injection, JPA/Hibernate performance, and transaction isolation levels."
      },
      {
        "title": "Deadlock Avoidance Question",
        "detail": "A classic JPMC question is transferring money between 2 accounts concurrently. You must demonstrate how to avoid deadlocks by ordering locks."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Prefix Sums & Hashing",
          "target": "Master prefix sum modulos, hash tables, and cycle detection algorithms.",
          "topics": [
            "Subarray Sums Divisible by K",
            "Happy Number",
            "Two Sum",
            "Subarray Sum Equals K"
          ],
          "deliverable": "Solve 25 JPMC-tagged array and hashing problems."
        },
        {
          "label": "Week 2",
          "focus": "Java Concurrency & Deadlock Prevention",
          "target": "Implement safe multi-threaded financial balance transfers and thread-safe queues.",
          "topics": [
            "Thread-Safe Account Transfer",
            "Deadlock Detection & Prevention",
            "ExecutorService & Thread Pools",
            "ReentrantLock with Fairness"
          ],
          "deliverable": "Implement a deadlock-free concurrent bank account transfer simulator."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master BFS/DFS grid traversals, topological sorting, and tree traversals.",
          "topics": [
            "Number of Islands",
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design & Microservices Patterns",
          "target": "Design resilient microservice components using Saga pattern, Outbox pattern, and Circuit Breakers.",
          "topics": [
            "Transactional Outbox Pattern",
            "Saga Pattern for Distributed Payments",
            "Design Rate Limiter",
            "Design Banking Account Ledger"
          ],
          "deliverable": "Implement 3 complete OOP designs with Spring Boot architecture."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Banking System Design",
          "target": "Design global wire transfer networks, fraud detection engines, and high-availability banking APIs.",
          "topics": [
            "Design Global Payment Clearing System",
            "Design Real-Time Fraud Detection Engine",
            "Design High-Availability Banking Core"
          ],
          "deliverable": "Draft 3 complete financial system architectures."
        },
        {
          "label": "Week 6",
          "focus": "Leadership, Risk & Behavioral Sprints",
          "target": "Rehearse risk management scenarios, handling production financial incidents, and JPMC leadership values.",
          "topics": [
            "JPMC Leadership Values",
            "Risk Management & Regulatory Compliance",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior JPMorgan Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Consistent Lock Ordering",
          "detail": "Always acquire locks on accounts in ascending ID order (min(idA, idB) then max(idA, idB)) to guarantee zero deadlocks."
        },
        {
          "title": "Database Isolation Levels",
          "detail": "Master differences between Read Committed, Repeatable Read, and Serializable to prevent dirty and phantom reads."
        },
        {
          "title": "Saga vs 2PC",
          "detail": "Explain why Choreography/Orchestration Saga pattern is preferred over blocking Two-Phase Commit in modern microservices."
        }
      ]
    }
  },
  {
    "id": "visa",
    "name": "Visa",
    "category": "fintech",
    "region": "Foster City, CA / Bengaluru, India / Global",
    "hiringProcess": [
      "Round 01: HackerRank Online Coding Assessment (2-3 DSA problems, 90 mins)",
      "Round 02: Technical Phone Screen (45-60 mins Problem Solving & CS Fundamentals)",
      "Round 03: Onsite 1 — Data Structures & Graph Algorithms (60 mins)",
      "Round 04: Onsite 2 — Concurrency, Multithreading & Low-Latency C++/Java (60 mins)",
      "Round 05: Onsite 3 — High-Throughput Distributed System Design (VisaNet Scale, 60 mins)",
      "Round 06: Director / HR Leadership & Values Alignment (60 mins)"
    ],
    "pyqTopics": [
      "High-Throughput Transaction Processing (65,000+ TPS)",
      "Low-Latency In-Memory Routing & Message Switching",
      "Idempotency, Tokenization & PCI-DSS Compliance",
      "Distributed Caching & Real-Time Fraud Scoring",
      "Trees, Graphs & Dynamic Programming",
      "Active-Active Multi-Datacenter Replication"
    ],
    "interviewStyle": "Visa focuses on ultra-high throughput (VisaNet processes 65K+ transaction messages per second), sub-second latency, zero-downtime active-active replication, payment tokenization, and clean DSA fundamentals.",
    "sampleQuestions": [
      "Design VisaNet High-Throughput Payment Authorization Engine (Hard)",
      "Design Real-Time Payment Card Tokenization & Vault Service (Hard)",
      "Meeting Rooms II: Minimum conference rooms required (Medium)",
      "Subarray Sum Equals K: Hash table prefix sums (Medium)",
      "Design Distributed Rate Limiter with Cardholder Level Throttling (Medium)",
      "Course Schedule II (Medium)"
    ],
    "prepNotes": [
      "Understand how VisaNet processes authorization requests in under 100ms across multiple geographically distributed datacenters.",
      "Master payment security concepts: PAN tokenization, HSM (Hardware Security Modules), and point-to-point encryption.",
      "Show deep understanding of high-throughput Java/C++ concurrency, lock-free queues, and memory caching."
    ],
    "systemDesignArchetypes": [
      "Design VisaNet Authorization & Clearing Network",
      "Design Payment Tokenization Service with PCI-DSS Vault",
      "Design Global Card Fraud Detection Pipeline (65K TPS)"
    ],
    "culturalValues": [
      "Universal Acceptance & Trust in Global Commerce",
      "Uncompromising Security & 99.999% Reliability",
      "Collaboration, Diversity & Inclusivity"
    ],
    "communityInsights": [
      {
        "title": "VisaNet Scale Scale Scale",
        "detail": "In system design, be prepared for 65,000+ transactions per second with sub-50ms p99 latency SLA."
      },
      {
        "title": "Tokenization Security",
        "detail": "Visa loves asking how to replace sensitive 16-digit credit card PAN numbers with secure tokens that can be safely routed across merchants."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Prefix Sums & Hashing",
          "target": "Master two pointers, hash map lookups, and sliding window aggregations.",
          "topics": [
            "Subarray Sum Equals K",
            "Meeting Rooms II",
            "Longest Substring Without Repeating Characters",
            "Two Sum"
          ],
          "deliverable": "Solve 25 Visa-tagged array and string problems."
        },
        {
          "label": "Week 2",
          "focus": "Concurrency, Low Latency & Lock-Free Data Structures",
          "target": "Master lock-free ring buffers, thread-safe memory caches, and non-blocking IO.",
          "topics": [
            "Lock-Free Ring Buffer",
            "Thread-Safe Token Bucket",
            "Disruptor Pattern Architecture",
            "Atomic CAS Operations"
          ],
          "deliverable": "Implement a high-throughput lock-free transaction queue in code."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Search Algorithms",
          "target": "Master topological sorting, LCA in binary trees, and shortest route optimization.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Network Delay Time",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design & Payment Security",
          "target": "Design payment tokenization engines, rate limiters, and card validation state machines.",
          "topics": [
            "Design Tokenization Service",
            "Design Rate Limiter by Cardholder",
            "Design Fraud Rule Evaluator",
            "Design Parking Garage"
          ],
          "deliverable": "Implement 3 compilable OOP designs with clean design patterns."
        },
        {
          "label": "Week 5",
          "focus": "High-Throughput Payment System Design (VisaNet)",
          "target": "Design authorization pipelines, token vaults, and active-active multi-datacenter replication.",
          "topics": [
            "Design VisaNet Payment Authorization Engine",
            "Design Card Tokenization Vault",
            "Design Real-Time Fraud Scoring Engine"
          ],
          "deliverable": "Draft 3 complete financial system architectures with 65K TPS scale."
        },
        {
          "label": "Week 6",
          "focus": "Live Simulation & Leadership Calibration",
          "target": "Execute timed mock interview loops covering DSA, systems architecture, and Visa core values.",
          "topics": [
            "Visa Leadership Values",
            "Handling Global Payment Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Visa Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "High-Throughput Routing",
          "detail": "Master LMAX Disruptor pattern and memory-mapped files for ultra-low latency transaction messaging."
        },
        {
          "title": "Tokenization vs Encryption",
          "detail": "Explain why tokenization is mathematically irreversible without the secure vault mapping, eliminating PCI scope for merchants."
        },
        {
          "title": "Active-Active Multi-Region",
          "detail": "Show how geographically replicated nodes handle cross-datacenter routing with local caching."
        }
      ]
    }
  },
  {
    "id": "mastercard",
    "name": "Mastercard",
    "category": "fintech",
    "region": "Purchase, NY / Pune, India / Global",
    "hiringProcess": [
      "Round 01: Online Assessment on HackerRank (2 coding questions + CS aptitude, 90 mins)",
      "Round 02: Technical Phone Screen (45-60 mins DSA & Java/Spring)",
      "Round 03: Onsite 1 — Data Structures, Arrays & Trees (60 mins)",
      "Round 04: Onsite 2 — Core Java, Microservices Architecture & Concurrency (60 mins)",
      "Round 05: Onsite 3 — Distributed System Design & Global Payment Settlement (60 mins)",
      "Round 06: Leadership & Culture Fit Round with Director (60 mins)"
    ],
    "pyqTopics": [
      "Global Settlement & Clearing Pipelines",
      "Microservices Design with Spring Boot & Kafka",
      "Payment Tokenization & Biometric Authentication (EMVCo)",
      "High-Concurrency In-Memory Caching (Hazelcast, Redis)",
      "Trees, Graphs & Dynamic Programming",
      "API Security (OAuth2, Mutual TLS, HMAC Signatures)"
    ],
    "interviewStyle": "Tests solid understanding of Java enterprise ecosystems, Spring Boot microservices, distributed transaction settlement, tokenization, high-concurrency caching, and algorithmic problem solving.",
    "sampleQuestions": [
      "Design Mastercard Global Clearing & Settlement Batch Pipeline (Hard)",
      "Design Real-Time Card Tokenization & Biometric Auth Gateway (Hard)",
      "LRU Cache with Custom Doubly Linked List (Medium)",
      "Two Sum II - Input Array Is Sorted (Medium)",
      "Course Schedule (Medium)",
      "Design Distributed Idempotent Payment Webhook Service (Hard)"
    ],
    "prepNotes": [
      "Understand the difference between Payment Authorization (real-time 100ms) and Clearing & Settlement (daily multi-currency batch processing).",
      "Brush up on Spring Boot, Kafka stream processing, Hazelcast distributed caching, and RESTful API security.",
      "Emphasize zero data loss, idempotency, and audit compliance across all system design answers."
    ],
    "systemDesignArchetypes": [
      "Design Global Settlement & Currency Clearing Engine",
      "Design Real-Time Payment Tokenization & Merchant Gateway",
      "Design High-Speed Credit Card Transaction Routing Switch"
    ],
    "culturalValues": [
      "Priceless Possibilities & Decency Quotient (DQ)",
      "Integrity, Inclusion & Global Economic Growth",
      "Agility and Innovation in Secure Payments"
    ],
    "communityInsights": [
      {
        "title": "Decency Quotient (DQ)",
        "detail": "Mastercard looks for high \"Decency Quotient\" alongside IQ and EQ. Demonstrate empathy, collaborative communication, and ethical integrity."
      },
      {
        "title": "Clearing vs Authorization",
        "detail": "Demonstrating clear knowledge of dual-message vs single-message transaction processing sets you apart from standard software candidates."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and custom cache implementations.",
          "topics": [
            "LRU Cache",
            "Two Sum II",
            "Subarray Sum Equals K",
            "Valid Parentheses"
          ],
          "deliverable": "Solve 25 Mastercard-tagged array and string problems."
        },
        {
          "label": "Week 2",
          "focus": "Java Concurrency & Spring Boot Microservices",
          "target": "Master thread pools, Spring Boot dependency injection, and distributed caching with Hazelcast/Redis.",
          "topics": [
            "Thread-Safe Singleton & Factory",
            "Spring Boot Transaction Boundaries",
            "Distributed Cache Stampede Prevention",
            "CompletableFuture & Async Work"
          ],
          "deliverable": "Build a secure Spring Boot microservice with JWT & HMAC verification."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Topological Sort",
          "target": "Master dependency graph resolution, LCA, and tree traversals.",
          "topics": [
            "Course Schedule I & II",
            "Lowest Common Ancestor",
            "Serialize Binary Tree",
            "Number of Connected Components"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design & Payment Patterns",
          "target": "Design payment gateways, tokenization vaults, and idempotent webhook dispatchers.",
          "topics": [
            "Design Payment Token Vault",
            "Design Distributed Rate Limiter",
            "Design Idempotent Webhook Dispatcher",
            "Design Parking Garage"
          ],
          "deliverable": "Implement 3 compilable OOP designs with clean unit tests."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Settlement & Payment Architecture",
          "target": "Design global batch settlement pipelines, multi-currency conversion, and fraud scoring.",
          "topics": [
            "Design Global Clearing & Settlement Pipeline",
            "Design Card Tokenization Service",
            "Design Real-Time Transaction Routing Switch"
          ],
          "deliverable": "Draft 3 complete financial system architectures."
        },
        {
          "label": "Week 6",
          "focus": "Decency Quotient (DQ) & Leadership Calibration",
          "target": "Rehearse stories demonstrating Decency Quotient (DQ), cross-functional teamwork, and handling production outages.",
          "topics": [
            "Decency Quotient Scenarios",
            "Handling Financial Outages & Audits",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Mastercard Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Batch Settlement Pipelines",
          "detail": "Master chunk-based batch processing with checkpointing and atomic commits for overnight bank settlements."
        },
        {
          "title": "Decency Quotient (DQ)",
          "detail": "Show genuine empathy for colleagues, client partners, and end consumers in every behavioral answer."
        },
        {
          "title": "Idempotency Keys",
          "detail": "Ensure all webhook and payment endpoints are completely idempotent to prevent duplicate charges."
        }
      ]
    }
  },
  {
    "id": "nvidia",
    "name": "Nvidia",
    "category": "ai",
    "region": "Santa Clara, CA / India / Global",
    "hiringProcess": [
      "Round 01: Online Coding Assessment on HackerRank (C++ / Python / CUDA, 90 mins)",
      "Round 02: Technical Phone Screen (45-60 mins C++ / GPU Architecture / Algorithms)",
      "Round 03: Onsite 1 — Low-Level C++ / Memory Management & Data Structures (60 mins)",
      "Round 04: Onsite 2 — High-Performance Concurrency, Thread Synchronization & CUDA (60 mins)",
      "Round 05: Onsite 3 — Distributed AI Cluster Architecture / InfiniBand & GPU Fabric (60 mins)",
      "Round 06: Onsite 4 — Engineering Leadership & Hardware-Software Co-Design (60 mins)"
    ],
    "pyqTopics": [
      "C++ Memory Layout, SIMD & Cache Line Optimization",
      "CUDA Parallel Programming (Threads, Warps, Blocks, Shared Memory)",
      "Distributed GPU Training (Data Parallelism, Tensor Parallelism, Megatron-LM)",
      "InfiniBand, RoCE & NVLink High-Bandwidth Interconnects",
      "Matrix Multiplication & Tensor Operations Optimization",
      "Zero-Copy GPU Buffer Ingestion & PyTorch Internals"
    ],
    "interviewStyle": "Deeply technical and focused on high-performance computing (HPC), C++ systems programming, GPU architecture, parallel algorithm design, and large-scale AI distributed cluster infrastructure.",
    "sampleQuestions": [
      "Implement Parallel Matrix Multiplication with Shared Memory Tiling in CUDA / C++ (Hard)",
      "Design Distributed LLM Training Cluster with NVLink & InfiniBand Interconnects (Hard)",
      "Design High-Throughput GPU Inference Serving Engine (Triton / TensorRT) (Hard)",
      "Trapping Rain Water: Vectorized SIMD optimization (Hard)",
      "Design Lock-Free Ring Buffer with Memory Barriers for CPU-GPU Shared Memory (Hard)",
      "LRU Cache with Custom In-Memory Page Eviction (Medium)"
    ],
    "prepNotes": [
      "Master C++20 memory model: std::atomic, memory order acquire/release, cache locality, and SIMD vectorization.",
      "For AI systems roles, understand distributed training paradigms: Data Parallelism (DDP), Pipeline Parallelism, Tensor Parallelism, and ZeRO (Zero Redundancy Optimizer).",
      "Understand GPU hardware architecture: Streaming Multiprocessors (SM), Warps (32 threads), Shared Memory, and Tensor Cores."
    ],
    "systemDesignArchetypes": [
      "Design Distributed AI Supercluster (10,000 H100 GPUs) with InfiniBand Fabric",
      "Design High-Throughput Triton Inference Server with Dynamic Batching",
      "Design GPU Shared Memory Cache for Real-Time Computer Vision Streaming"
    ],
    "culturalValues": [
      "Speed of Light Execution & Flat Organizational Structure",
      "Intellectual Honesty and Tolerance for Risk",
      "Pioneering the Future of Accelerated Computing"
    ],
    "communityInsights": [
      {
        "title": "C++ & Systems Depth",
        "detail": "Nvidia interviewers care intensely about clock cycles, cache misses, memory bandwidth, and parallel speedup."
      },
      {
        "title": "Distributed Training Focus",
        "detail": "For AI infrastructure roles, expect deep questions on all-reduce collective communication (NCCL) and gradient sharding."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "C++ Systems Programming & Memory Layout",
          "target": "Master pointers, memory alignments, cache lines, and SIMD optimization.",
          "topics": [
            "Trapping Rain Water",
            "LRU Cache",
            "Vectorized Dot Product",
            "Memory Layout & Cache Miss Profiling"
          ],
          "deliverable": "Solve 25 C++ systems and cache-friendly algorithmic problems."
        },
        {
          "label": "Week 2",
          "focus": "Parallel Algorithms & CUDA Fundamentals",
          "target": "Master thread hierarchy, warp divergence, shared memory tiling, and parallel reduction.",
          "topics": [
            "Parallel Reduction in CUDA",
            "Matrix Multiplication with Tiling",
            "Prefix Sum (Scan) in Parallel",
            "Lock-Free Ring Buffer with Memory Barriers"
          ],
          "deliverable": "Implement a tiled matrix multiplication kernel in CUDA / C++."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Spatial Indexing",
          "target": "Master Octrees for 3D graphics, BFS/DFS, and topological scheduling.",
          "topics": [
            "Alien Dictionary",
            "Course Schedule II",
            "Octree / KD-Tree Construction",
            "Serialize Binary Tree"
          ],
          "deliverable": "Solve 20 spatial and graph tree problems."
        },
        {
          "label": "Week 4",
          "focus": "High-Performance Inference Server Design",
          "target": "Design Triton-style inference servers with dynamic batching, model pipelining, and CUDA streams.",
          "topics": [
            "Dynamic Batching Queue",
            "Model Pipelining with CUDA Streams",
            "Zero-Copy Shared Memory IPC",
            "GPU Memory Pool Allocator"
          ],
          "deliverable": "Build a prototype dynamic batching inference server in C++/Python."
        },
        {
          "label": "Week 5",
          "focus": "Distributed AI Training Superclusters",
          "target": "Architect 10,000+ GPU clusters with NCCL, Megatron-LM tensor parallelism, and RoCE networking.",
          "topics": [
            "Design Distributed LLM Training Cluster",
            "NCCL Ring All-Reduce Architecture",
            "ZeRO Sharded Optimizer Pipeline"
          ],
          "deliverable": "Draft complete distributed AI cluster architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Speed of Light Execution & Live Mock Sprints",
          "target": "Execute timed mock interviews covering hardware-software co-design, C++ rigor, and Nvidia culture.",
          "topics": [
            "Speed of Light Execution Scenarios",
            "Hardware-Software Tradeoffs",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Nvidia HPC Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "GPU Memory Hierarchy",
          "detail": "Master differences between Global Memory, Shared Memory (L1), L2 Cache, and Registers."
        },
        {
          "title": "Collective Communications (NCCL)",
          "detail": "Understand Ring All-Reduce and Tree All-Reduce bandwidth math for distributed gradient exchange."
        },
        {
          "title": "Warp Divergence",
          "detail": "Avoid branch divergence inside 32-thread warps to keep GPU execution efficiency near 100%."
        }
      ]
    }
  },
  {
    "id": "servicenow",
    "name": "ServiceNow",
    "category": "enterprise",
    "region": "Santa Clara, CA / Hyderabad, India / Global",
    "hiringProcess": [
      "Round 01: HackerRank Online Coding Assessment (2-3 DSA problems, 90 mins)",
      "Round 02: Technical Phone Screen (45-60 mins Problem Solving & OOP)",
      "Round 03: Onsite 1 — Data Structures & Graph Algorithms (60 mins)",
      "Round 04: Onsite 2 — Dynamic Programming & Algorithmic Optimization (60 mins)",
      "Round 05: Onsite 3 — Low-Level Object Oriented Design & Extensibility (60 mins)",
      "Round 06: Onsite 4 — High-Level Enterprise Platform System Design (60 mins)",
      "Round 07: Hiring Manager Behavioral & Culture Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Multi-Instance Enterprise Cloud Architecture",
      "Workflow Automation State Machines & DAGs",
      "Table Inheritance & Relational Modeling",
      "Distributed Job Scheduling & Queue Worker Pools",
      "Trees, Graphs & Dynamic Programming",
      "Real-Time Enterprise Notification Dispatch"
    ],
    "interviewStyle": "Emphasizes enterprise platform scalability, workflow state machine modeling, clean object-oriented design, multi-instance database isolation, and algorithmic foundations.",
    "sampleQuestions": [
      "Design Enterprise Workflow Automation Engine with DAG Execution (Hard)",
      "Design Distributed Task Scheduler with Job Dependencies & Priorities (Hard)",
      "Course Schedule II: Task dependency resolution (Medium)",
      "Design In-Memory File System with Role-Based Access Control (Medium)",
      "LRU Cache with Custom In-Memory Storage (Medium)",
      "Word Break (Medium)"
    ],
    "prepNotes": [
      "Understand ServiceNow unique Multi-Instance Architecture: each enterprise customer gets dedicated virtualized database instances.",
      "For LLD rounds, master state machine patterns, command patterns, and workflow dependency graphs.",
      "Write clean, modular code with clear time and space complexity explanations."
    ],
    "systemDesignArchetypes": [
      "Design Enterprise Workflow Automation & Execution Engine",
      "Design Distributed Task Scheduler across Millions of Enterprise Jobs",
      "Design Real-Time Incident Management & On-Call Alerting System"
    ],
    "culturalValues": [
      "Win as a Team & Wow Our Customers",
      "Create Belonging & Deliver Meaningful Value",
      "Passion for Enterprise Workflow Innovation"
    ],
    "communityInsights": [
      {
        "title": "Workflow DAGs Favorite",
        "detail": "ServiceNow loves workflow execution questions. Be ready to model tasks, triggers, conditional branches, and rollback states."
      },
      {
        "title": "Multi-Instance vs Multi-Tenant",
        "detail": "Understanding ServiceNow multi-instance model (dedicated customer databases) vs Salesforce multi-tenant model (shared database) is a huge bonus."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and in-memory caches.",
          "topics": [
            "LRU Cache",
            "Subarray Sum Equals K",
            "Valid Parentheses",
            "Merge Intervals"
          ],
          "deliverable": "Solve 25 ServiceNow-tagged array and string problems."
        },
        {
          "label": "Week 2",
          "focus": "Graphs & Workflow Dependency Engines",
          "target": "Master DAG topological sorting, cycle detection, and dependency resolution.",
          "topics": [
            "Course Schedule I & II",
            "Alien Dictionary",
            "Clone Graph",
            "Reconstruct Itinerary"
          ],
          "deliverable": "Build a complete DAG workflow engine simulator."
        },
        {
          "label": "Week 3",
          "focus": "Trees, BSTs & Search Algorithms",
          "target": "Master tree traversals, LCA, and balanced binary search trees.",
          "topics": [
            "Lowest Common Ancestor",
            "Serialize Binary Tree",
            "Implement Trie",
            "Binary Tree Maximum Path Sum"
          ],
          "deliverable": "Solve 20 tree and Trie questions."
        },
        {
          "label": "Week 4",
          "focus": "Low-Level Design & State Machine Modeling",
          "target": "Design workflow state machines, task schedulers, and incident management engines.",
          "topics": [
            "Design Workflow State Machine",
            "Design Distributed Task Scheduler",
            "Design Rate Limiter",
            "Design Parking Garage"
          ],
          "deliverable": "Implement 3 compilable OOP designs with clean design patterns."
        },
        {
          "label": "Week 5",
          "focus": "Enterprise Platform Architecture",
          "target": "Design multi-instance enterprise cloud backends, task schedulers, and incident alerting.",
          "topics": [
            "Design Enterprise Workflow Engine",
            "Design Distributed Task Scheduler",
            "Design Incident Alerting System (PagerDuty/ServiceNow)"
          ],
          "deliverable": "Draft 3 complete enterprise cloud system architectures."
        },
        {
          "label": "Week 6",
          "focus": "Live Simulation & Leadership Calibration",
          "target": "Execute timed mock interviews covering problem solving, enterprise architecture, and ServiceNow culture.",
          "topics": [
            "ServiceNow Culture Values",
            "Handling Enterprise Platform Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior ServiceNow Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Workflow State Machines",
          "detail": "Model state transitions with strict validation, rollback handlers, and idempotent state persistence."
        },
        {
          "title": "Multi-Instance Architecture",
          "detail": "Explain benefits of dedicated database instances for enterprise compliance and data sovereignty."
        },
        {
          "title": "Task Scheduling",
          "detail": "Master priority queues, worker heartbeat leases, and distributed retry backoff mechanisms."
        }
      ]
    }
  },
  {
    "id": "openai",
    "name": "OpenAI",
    "category": "ai",
    "region": "San Francisco, CA / London, UK",
    "hiringProcess": [
      "Round 01: Recruiter Phone Screen & Research / Engineering Alignment (30 mins)",
      "Round 02: Technical Phone Screen — Practical High-Performance Coding (60 mins)",
      "Round 03: Onsite 1 — Systems Coding & Concurrency (C++ / Python, 60 mins)",
      "Round 04: Onsite 2 — Distributed AI Training / Inference Cluster Architecture (60 mins)",
      "Round 05: Onsite 3 — Practical Debugging & Performance Profiling on Live Code (60 mins)",
      "Round 06: Onsite 4 — AI Safety, Frontier Mindset & Culture Calibration (60 mins)"
    ],
    "pyqTopics": [
      "High-Performance Async Python & C++ Interop",
      "Distributed GPU Training & Pipeline Parallelism",
      "KV Cache Management (vLLM PagedAttention)",
      "Streaming Token Generation & Backpressure",
      "CUDA Kernel Optimization & Memory Footprint",
      "Distributed Fault-Tolerant Checkpoint Storage"
    ],
    "interviewStyle": "OpenAI evaluates first-principles engineering craft, high-performance concurrency (asyncio, C++ zero-copy), deep understanding of LLM training/inference mechanics (KV caching, tensor parallelism, token streaming), and relentless technical curiosity.",
    "sampleQuestions": [
      "Design High-Throughput LLM Inference Gateway with PagedAttention KV Caching (Hard)",
      "Implement Async Token Streaming Pipeline with Backpressure & Flow Control (Hard)",
      "Implement Thread-Safe Lock-Free Ring Buffer in C++ / Python (Hard)",
      "Design Distributed Checkpoint Storage Engine for 100,000 GPU Cluster (Hard)",
      "Design Distributed Dynamic Rate Limiter for Multi-Tier LLM API (Medium)",
      "Find Median from Data Stream (Hard)"
    ],
    "prepNotes": [
      "Understand LLM Inference Optimization: KV Cache memory calculation, PagedAttention, Continuous Batching, and Speculative Decoding.",
      "Master High-Performance Python: asyncio event loop internals, uvloop, multiprocessing vs threading, GIL bypass, and zero-copy memory buffers.",
      "Be prepared to discuss AI Safety, Frontier Model Governance, and ethical implications of AGI."
    ],
    "systemDesignArchetypes": [
      "Design High-Throughput OpenAI API Inference Infrastructure (vLLM)",
      "Design Distributed Training Checkpoint & Fault Recovery Pipeline",
      "Design Real-Time Voice-to-Voice LLM Streaming Architecture"
    ],
    "culturalValues": [
      "Frontier Mindset: Pushing beyond current technological limits",
      "High Agency & Extreme Technical Ownership",
      "Broadly Beneficial AGI & Uncompromising AI Safety"
    ],
    "communityInsights": [
      {
        "title": "Practical Systems Testing",
        "detail": "OpenAI gives practical coding challenges (e.g. implementing streaming server, lock-free queues, or debugging concurrency deadlocks) rather than traditional LeetCode."
      },
      {
        "title": "Deep Inference Understanding",
        "detail": "Candidates who can calculate KV Cache memory requirements (2 * 2 * n_layers * n_heads * d_head * seq_len * batch_size) stand out immediately."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "High Performance Python, C++ & Concurrency",
          "target": "Master asyncio event loops, multiprocessing, zero-copy buffers, and multi-threaded synchronization.",
          "topics": [
            "Async IO Event Loop Internals",
            "Zero-Copy Socket Streaming",
            "Lock-Free Ring Buffers",
            "Python GIL Bypass"
          ],
          "deliverable": "Build a high-performance concurrent streaming server processing 10K events/sec."
        },
        {
          "label": "Week 2",
          "focus": "LLM Inference & KV Cache Mechanics",
          "target": "Deconstruct KV cache memory math, PagedAttention, continuous batching, and speculative decoding.",
          "topics": [
            "KV Cache Memory Calculation",
            "PagedAttention Architecture",
            "Continuous Batching Scheduler",
            "Speculative Decoding Engine"
          ],
          "deliverable": "Implement a simulated continuous batching LLM inference scheduler in Python/C++."
        },
        {
          "label": "Week 3",
          "focus": "Distributed GPU Training Architecture",
          "target": "Master Megatron-LM 3D Parallelism (Tensor, Pipeline, Data), ZeRO optimizer, and InfiniBand networking.",
          "topics": [
            "Tensor Parallelism & All-Reduce",
            "Pipeline Parallelism & 1F1B Scheduling",
            "ZeRO Memory Optimization",
            "NCCL Communication Primitives"
          ],
          "deliverable": "Draft end-to-end 3D parallelism training cluster architecture."
        },
        {
          "label": "Week 4",
          "focus": "Distributed Storage & Checkpoint Engines",
          "target": "Design ultra-fast checkpoint storage engines saving 100TB model weights in seconds across NVMe/S3.",
          "topics": [
            "Distributed Async Checkpointing",
            "NVMe-over-Fabrics Storage",
            "Fast Fault-Recovery Protocols",
            "Chunked Object Ingestion"
          ],
          "deliverable": "Build a simulated distributed checkpoint save/restore pipeline."
        },
        {
          "label": "Week 5",
          "focus": "Real-Time Voice & Multimodal Streaming",
          "target": "Design sub-150ms real-time audio/video multimodal ingestion and streaming synthesis pipelines.",
          "topics": [
            "Real-Time WebRTC Streaming",
            "Voice Activity Detection (VAD)",
            "Interleaved Multimodal Encoders",
            "Backpressure Flow Control"
          ],
          "deliverable": "Design complete architecture for OpenAI Realtime Voice API."
        },
        {
          "label": "Week 6",
          "focus": "Frontier AI Safety & Executive Calibration",
          "target": "Execute 4 live mock sessions with deep focus on first-principles reasoning and AGI safety alignment.",
          "topics": [
            "AI Safety & Alignment Principles",
            "Handling Unbounded Scalability Challenges",
            "Full Loop Simulation"
          ],
          "deliverable": "Pass 3 high-intensity mock interviews with Senior AI Systems Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "KV Cache Math",
          "detail": "Master exact memory calculations for token generation: Memory = 2 * 2 * n_layers * n_heads * d_head * seq_len * batch_size bytes."
        },
        {
          "title": "Zero-Copy IO",
          "detail": "Utilize memory-mapped files (mmap) and shared memory (shm) for ultra-fast IPC without serializing overhead."
        },
        {
          "title": "Frontier Agency",
          "detail": "Demonstrate extreme proactivity in proposing novel solutions rather than regurgitating standard textbook patterns."
        }
      ]
    }
  },
  {
    "id": "flipkart",
    "name": "Flipkart",
    "category": "high-growth",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding Round / LLD (Write working, runnable OOP code in 90-120 mins)",
      "Round 02: Problem Solving & Data Structures (DSA, Graphs & DP, 60 mins)",
      "Round 03: High-Level System Design (E-Commerce Scale & Big Billion Days Flash Traffic, 60 mins)",
      "Round 04: Hiring Manager / Cultural Fitment & Values Alignment (60 mins)"
    ],
    "pyqTopics": [
      "Machine Coding LLD with Design Patterns (Clean Architecture, Concurrency)",
      "Graph Shortest Paths & Topological Sort",
      "Inventory Locking & Flash Sale Consistency",
      "Order Fulfillment & Supply Chain Routing",
      "Distributed Caching (Redis Cluster) & Message Queues (Kafka)",
      "Dynamic Programming & Interval Scheduling"
    ],
    "interviewStyle": "Flipkart is famous for its Machine Coding round where you must write fully working, modular OOP code with unit tests on your IDE within 90 minutes. Cleared candidates face deep DSA, Big Billion Days system design, and cultural alignment.",
    "sampleQuestions": [
      "Machine Coding: Design In-Memory Flipkart Order Management & Flash Sale System (Hard)",
      "Machine Coding: Design Multi-Level Cache System with Eviction Strategies (Hard)",
      "Rotting Oranges: BFS shortest supply route (Medium)",
      "Course Schedule II: Item category dependency resolution (Medium)",
      "Design Big Billion Days High-Concurrency Flash Sale Inventory Reservation (Hard)",
      "Word Break II (Hard)"
    ],
    "prepNotes": [
      "In the Machine Coding round, prioritize a working executable solution with clean OOP principles (SOLID), custom models, services, repositories, and edge case handling.",
      "For System Design, master distributed inventory locking (Redis Lua scripts / pessimistic vs optimistic locking) for flash sales.",
      "Be prepared to explain past projects with business metrics (scale, throughput, latency improvements)."
    ],
    "systemDesignArchetypes": [
      "Design Big Billion Days Flash Sale Inventory & Order Placement Engine",
      "Design Flipkart Search Ranking & Autocomplete with Tries and Solr/Elasticsearch",
      "Design Supply Chain & Last-Mile Delivery Hub Routing Engine"
    ],
    "culturalValues": [
      "Customer First & Extreme Ownership",
      "Audacity: Dream big and take bold calculated bets",
      "Bias for Action with Uncompromising Quality"
    ],
    "communityInsights": [
      {
        "title": "Machine Coding is the Elim Round",
        "detail": "Over 70% of candidates get eliminated in Round 1 Machine Coding. Clean OOP, proper design patterns, and running driver code are mandatory."
      },
      {
        "title": "Big Billion Days Architecture",
        "detail": "Flipkart interviewers frequently ask how to handle 500,000 requests per second during Big Billion Days without crashing inventory databases."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding Mastery & Design Patterns",
          "target": "Practice timed 90-minute full OOP implementations: Order Management, Cache, Parking Lot, and Snake-Ladder.",
          "topics": [
            "SOLID Principles Implementation",
            "Strategy & Factory Patterns",
            "In-Memory Repositories",
            "Driver Code Setup"
          ],
          "deliverable": "Complete 4 timed 90-minute end-to-end machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Graphs, BFS/DFS & Shortest Paths",
          "target": "Master shortest paths, supply routing, dependency DAGs, and grid traversals.",
          "topics": [
            "Rotting Oranges",
            "Course Schedule II",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph/tree problems with optimal Big-O bounds."
        },
        {
          "label": "Week 3",
          "focus": "Dynamic Programming & Strings",
          "target": "Master 1D/2D DP, subset partitioning, and sequence matching.",
          "topics": [
            "Word Break I & II",
            "Edit Distance",
            "Coin Change",
            "Longest Increasing Subsequence"
          ],
          "deliverable": "Solve 20 DP problems with space optimization."
        },
        {
          "label": "Week 4",
          "focus": "Advanced Machine Coding & Concurrency",
          "target": "Build multi-threaded machine coding projects with locking and race condition safety.",
          "topics": [
            "Design Multi-Level Cache",
            "Design Splitwise",
            "Design Distributed Queue",
            "Design Ride Sharing Dispatcher"
          ],
          "deliverable": "Implement 3 thread-safe machine coding systems with unit test suites."
        },
        {
          "label": "Week 5",
          "focus": "E-Commerce System Design & Scale",
          "target": "Design flash sale systems, search typeahead, order fulfillment, and Kafka event streaming.",
          "topics": [
            "Design Big Billion Days Flash Sale",
            "Design E-Commerce Search",
            "Design Payment Gateway & Cart"
          ],
          "deliverable": "Draft 3 complete distributed e-commerce architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Flipkart Cultural Calibration & Mock Loop",
          "target": "Rehearse customer obsession, extreme ownership, and live machine coding simulations.",
          "topics": [
            "Flipkart Culture Scenarios",
            "Handling System Failures in Flash Sales",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Flipkart SDEs."
        }
      ],
      "curatedPrep": [
        {
          "title": "Machine Coding Speed",
          "detail": "Set up a boilerplate project template with models, services, repositories, and driver code ready in 5 minutes."
        },
        {
          "title": "Inventory Concurrency",
          "detail": "Use Redis Lua scripts for atomic decrement + Postgres optimistic locking to prevent overselling."
        },
        {
          "title": "Clean OOP Code",
          "detail": "Avoid monolithic God-classes; maintain clean separation between domain models, business logic, and storage interfaces."
        }
      ]
    }
  },
  {
    "id": "swiggy",
    "name": "Swiggy",
    "category": "high-growth",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Low-Level Design (90 mins in IDE)",
      "Round 02: Problem Solving & Data Structures (DSA, Graphs & Heaps, 60 mins)",
      "Round 03: High-Level System Design (Hyperlocal Logistics, Assignment & Dispatch Engine, 60 mins)",
      "Round 04: Hiring Manager / Values & Architecture Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Hyperlocal Geospatial Indexing (Geohash, Google S2 / Uber H3)",
      "Bipartite Delivery Executive Matching & Batching Algorithms",
      "Real-Time Delivery Tracking with WebSockets & Kafka",
      "Dynamic Delivery Fee & ETA Estimation Pipelines",
      "Machine Coding: Order Dispatch & Restaurant Allocation",
      "Distributed Caching & High-Throughput Menu Ingestion"
    ],
    "interviewStyle": "Hyper-focused on real-time hyperlocal logistics, real-time tracking, geospatial algorithms, low-level machine coding, and high-concurrency order placement.",
    "sampleQuestions": [
      "Machine Coding: Design Delivery Executive Assignment & Batching Engine (Hard)",
      "Design Swiggy Hyperlocal Delivery Tracking & Real-Time Dispatch System (Hard)",
      "Bus Routes: Minimum vehicle transfers (Hard)",
      "Design In-Memory Restaurant Menu Cache with Geohash Filtering (Medium)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Swiggy hyperlocal tech stack: Geohash spatial bucketing, Delivery Executive (DE) dispatch algorithms, and batch delivery optimization.",
      "Write modular, compilable code during the Machine Coding round with clean domain models and service interfaces.",
      "In System Design, explain how you calculate and broadcast delivery partner live coordinates every 3-5 seconds to millions of active users."
    ],
    "systemDesignArchetypes": [
      "Design Swiggy Hyperlocal Order Dispatch & Batching Engine",
      "Design Real-Time Delivery Partner Location Tracking & ETA Pipeline",
      "Design High-Throughput Restaurant Menu Ingestion & Search"
    ],
    "culturalValues": [
      "Consumer Comes First & Display Bias for Action",
      "Act Like an Owner & Stand on the Shoulders of Giants",
      "Always Be Curious & Learn Continuously"
    ],
    "communityInsights": [
      {
        "title": "Hyperlocal Spatial Emphasis",
        "detail": "Swiggy loves spatial data structures (Geohash, QuadTrees). Prepare to explain why restaurants are clustered into geospatial grids."
      },
      {
        "title": "Machine Coding in Round 1",
        "detail": "You will be asked to model delivery partners, orders, restaurants, and assignment strategies in clean OOP code."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Hyperlocal Domain Modeling",
          "target": "Implement clean OOP machine coding systems: Order Dispatch, Delivery Partner Matching, and Restaurant Menu.",
          "topics": [
            "Machine Coding Boilerplate",
            "Strategy Pattern for Dispatch",
            "Clean Repository Interfaces",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed 90-minute machine coding solutions in your IDE."
        },
        {
          "label": "Week 2",
          "focus": "Geospatial Data Structures & Heaps",
          "target": "Master Geohash, spatial indexing, Dijkstra pathfinding, and PriorityQueue schedulers.",
          "topics": [
            "Bus Routes",
            "Meeting Rooms II",
            "Network Delay Time",
            "Geohash Spatial Clustering"
          ],
          "deliverable": "Solve 20 spatial and graph routing problems."
        },
        {
          "label": "Week 3",
          "focus": "Dynamic Programming & Optimization",
          "target": "Master trip optimization, knapsack variations, and route selection.",
          "topics": [
            "Trapping Rain Water",
            "Word Break II",
            "Coin Change",
            "Longest Increasing Subsequence"
          ],
          "deliverable": "Solve 20 DP problems with space optimization."
        },
        {
          "label": "Week 4",
          "focus": "Concurrency & Real-Time Event Pipelines",
          "target": "Master thread-safe queues, lock-free dispatch buffers, and WebSocket gateways.",
          "topics": [
            "Thread-Safe Order Queue",
            "Lock-Free Location Ingestion",
            "WebSocket Connection Manager",
            "Kafka Partitioning"
          ],
          "deliverable": "Implement a simulated real-time location tracking server."
        },
        {
          "label": "Week 5",
          "focus": "Hyperlocal Distributed System Design",
          "target": "Design Swiggy dispatch engines, live tracking pipelines, and high-concurrency food ordering.",
          "topics": [
            "Design Swiggy Order Dispatch",
            "Design Live Delivery Tracking",
            "Design Restaurant Menu Search"
          ],
          "deliverable": "Draft 3 complete hyperlocal logistics system blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Swiggy Culture & Live Mock Loop",
          "target": "Rehearse Consumer First, bias for action, and full technical interview loops.",
          "topics": [
            "Swiggy Values Framework",
            "Handling Peak Hour Logistics Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Swiggy Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Geohash Clustering",
          "detail": "Use Geohash length 6 (~1.2km x 0.6km) for neighborhood restaurant and rider discovery."
        },
        {
          "title": "Order Batching",
          "detail": "Explain trade-offs between instant single-order assignment vs delayed batch assignment (Hungarian algorithm) for cost savings."
        },
        {
          "title": "WebSocket Gateways",
          "detail": "Terminate WebSocket connections at edge proxy gateways and publish location updates to Kafka."
        }
      ]
    }
  },
  {
    "id": "zomato",
    "name": "Zomato",
    "category": "high-growth",
    "region": "Gurugram, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Problem Solving Round (90 mins in IDE)",
      "Round 02: Data Structures & Core Algorithms (60 mins DSA)",
      "Round 03: High-Level System Design & Scaling (60 mins)",
      "Round 04: Engineering Manager / Cultural & High-Ownership Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Flash Sale & High Concurrency Ordering (New Year Eve 100K+ RPM)",
      "Hyperlocal Restaurant Search & Geo-Filtering",
      "Machine Coding LLD with Clean Patterns",
      "Redis Caching Strategies & Thundering Herd Prevention",
      "Real-Time Delivery Fleet Management",
      "Graph Traversal & Greedy Optimization"
    ],
    "interviewStyle": "Tests high-speed coding, clean machine coding LLD, pragmatic system design for massive peak traffic spikes (e.g. New Year Eve food rush), and extreme ownership culture.",
    "sampleQuestions": [
      "Machine Coding: Design In-Memory Food Delivery & Restaurant Table Booking System (Hard)",
      "Design Zomato Search & Ordering Platform for New Year Eve Traffic Spikes (Hard)",
      "Rotting Oranges (Medium)",
      "Design In-Memory Key-Value Store with TTL & LRU Eviction (Medium)",
      "Course Schedule II (Medium)",
      "Median of Two Sorted Arrays (Hard)"
    ],
    "prepNotes": [
      "Zomato engineers take pride in lean, high-throughput architectures. Be ready to discuss caching, Redis pipelining, and database sharding.",
      "Write clean, modular code in Machine Coding with clear entities, services, and unit tests.",
      "Demonstrate high energy, hustle, and obsession with exceptional user experience."
    ],
    "systemDesignArchetypes": [
      "Design Zomato New Year Eve High-Throughput Food Ordering Engine",
      "Design Real-Time Restaurant Search & Filtering Engine",
      "Design Zomato Gold / Loyalty & Discount Engine with Concurrency Locks"
    ],
    "culturalValues": [
      "Extreme Ownership & Continuous Innovation",
      "Customer Obsession with Speed and Simplicity",
      "Zero Politics and High Agility"
    ],
    "communityInsights": [
      {
        "title": "New Year Eve Scale Scenarios",
        "detail": "Zomato often asks how to handle 200,000 orders per minute on New Year Eve without degrading user latency or dropping transactions."
      },
      {
        "title": "Pragmatic Architecture",
        "detail": "They prefer simple, robust solutions over over-engineered theoretical architectures."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Clean Architecture",
          "target": "Master rapid LLD implementation in IDE: Table Booking, Food Ordering, and In-Memory Cache.",
          "topics": [
            "Machine Coding Structure",
            "Service Layer Pattern",
            "In-Memory Storage",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed 90-minute machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master sliding windows, two pointers, and frequency maps.",
          "topics": [
            "Rotting Oranges",
            "Subarray Sum Equals K",
            "Two Sum",
            "Sliding Window Maximum"
          ],
          "deliverable": "Solve 25 array and hash map problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master topological sort, LCA in binary trees, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Word Ladder",
            "Number of Islands"
          ],
          "deliverable": "Solve 20 graph/tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Caching",
          "target": "Master 1D/2D DP, knapsack variations, and cache stampede prevention.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "LRU Cache",
            "Redis Caching Strategies"
          ],
          "deliverable": "Solve 20 DP and caching problems."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale FoodTech System Design",
          "target": "Design Zomato ordering engine for New Year traffic, search engines, and real-time tracking.",
          "topics": [
            "Design Zomato Ordering Engine",
            "Design Restaurant Search",
            "Design Loyalty & Coupon Engine"
          ],
          "deliverable": "Draft 3 complete system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Zomato Culture & Live Mock Loop",
          "target": "Rehearse extreme ownership, high-urgency execution, and full loop mock interviews.",
          "topics": [
            "Zomato Culture Values",
            "Handling High-Traffic Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Zomato Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Peak Traffic Handling",
          "detail": "Implement queue-based asynchronous order ingestion with circuit breakers to protect database backends."
        },
        {
          "title": "Machine Coding Speed",
          "detail": "Write clean Java/Python code with separation of concerns within the 90-minute limit."
        },
        {
          "title": "Coupon Concurrency",
          "detail": "Use atomic Redis increments and distributed locks to prevent double-spending on discount codes."
        }
      ]
    }
  },
  {
    "id": "phonepe",
    "name": "PhonePe",
    "category": "fintech",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding Round (90-120 mins in IDE — clean OOP, thread safety, unit tests)",
      "Round 02: Data Structures & Algorithms (60 mins DSA, Graphs & DP)",
      "Round 03: High-Level System Design (UPI Payments, NPCI Switch & High TPS Ledgers, 60 mins)",
      "Round 04: Techno-Managerial / Engineering Leadership Calibration (60 mins)"
    ],
    "pyqTopics": [
      "UPI Payment Switch Integration & NPCI Protocol",
      "Machine Coding: Thread-Safe In-Memory Ledgers & Payment Gateways",
      "High-Throughput Distributed Transactions (50,000+ UPI TPS)",
      "Idempotency & Race Condition Prevention in Wallets",
      "Distributed Caching (Aerospike, Redis) & Database Sharding",
      "Graph Cycle Detection & Shortest Paths"
    ],
    "interviewStyle": "Extreme technical rigor on Machine Coding in Round 1, followed by hard DSA, distributed system design at massive UPI TPS scale, and deep database transaction mechanics.",
    "sampleQuestions": [
      "Machine Coding: Design In-Memory Payment Gateway with Payment Modes & Routing Rules (Hard)",
      "Machine Coding: Design Thread-Safe Wallet & Transaction Ledger with Atomic Balances (Hard)",
      "Design PhonePe UPI Payment Switch (50K+ TPS) with Asynchronous Settlement (Hard)",
      "Course Schedule II: Dependency resolution (Medium)",
      "Trapping Rain Water (Hard)",
      "LRU Cache with TTL (Medium)"
    ],
    "prepNotes": [
      "In the Machine Coding round, write working code with clean design patterns (Strategy, Factory, State), thread-safety, and comprehensive test cases.",
      "Understand UPI ecosystem: NPCI (National Payments Corporation of India), PSP (Payment Service Provider), Bank CBS (Core Banking System), and VPA (Virtual Payment Address).",
      "Emphasize zero transaction loss, strict idempotency, and high availability (99.999%)."
    ],
    "systemDesignArchetypes": [
      "Design PhonePe High-Speed UPI Payment Switch & Routing Engine",
      "Design Real-Time Wallet Balance & Transaction History Ledger",
      "Design High-Throughput QR Code Merchant Payment Ingestion Engine"
    ],
    "culturalValues": [
      "Customer Trust & Financial Integrity",
      "Technical Excellence & First-Principles Engineering",
      "Speed, Agility and Scalability at National Scale"
    ],
    "communityInsights": [
      {
        "title": "Machine Coding Elimination Bar",
        "detail": "PhonePe has one of the strictest Machine Coding rounds in India. Non-compiling code or missing test cases is an immediate reject."
      },
      {
        "title": "UPI Scale Questions",
        "detail": "Expect questions on how to handle bank CBS downtimes and delayed webhook callbacks without double-debiting users."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding: Payment Gateways & Ledgers",
          "target": "Implement working in-memory payment routers, digital wallets, and transaction ledger services in IDE.",
          "topics": [
            "Payment Gateway Machine Coding",
            "Wallet Ledger Architecture",
            "Strategy & State Patterns",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 full machine coding projects with 100% test coverage."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Hashing & Two Pointers",
          "target": "Master sliding windows, prefix sums, and hash table caching.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Insert Delete GetRandom O(1)"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Topological Sort",
          "target": "Master DAGs, cycle detection in financial routing, and tree traversals.",
          "topics": [
            "Course Schedule I & II",
            "Alien Dictionary",
            "Lowest Common Ancestor",
            "Network Delay Time"
          ],
          "deliverable": "Solve 20 graph/tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Concurrency & Thread-Safe Financial State",
          "target": "Master multi-threading, optimistic locking, and atomic balance updates.",
          "topics": [
            "Thread-Safe Bank Account Transfer",
            "Distributed Lock with Redis",
            "Double-Spend Prevention",
            "CAS Atomic Operations"
          ],
          "deliverable": "Implement a concurrent multi-account transaction simulator."
        },
        {
          "label": "Week 5",
          "focus": "High-Throughput UPI System Design",
          "target": "Design UPI payment switches, wallet ledgers, and QR merchant payment systems.",
          "topics": [
            "Design PhonePe UPI Switch",
            "Design Wallet Ledger",
            "Design Fraud Detection Engine"
          ],
          "deliverable": "Draft 3 complete financial system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "PhonePe Leadership Calibration & Full Simulation",
          "target": "Rehearse financial reliability, risk mitigation, and full interview loops.",
          "topics": [
            "PhonePe Engineering Culture",
            "Handling Bank Outages & Retries",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior PhonePe Architects."
        }
      ],
      "curatedPrep": [
        {
          "title": "UPI Invariants",
          "detail": "Always use idempotency keys and state machines (INITIATED -> PENDING_NPCI -> SUCCESS/FAILED) for every transaction."
        },
        {
          "title": "Machine Coding Thread-Safety",
          "detail": "Use ConcurrentHashMap and ReentrantLocks to ensure multi-threaded deposit/withdrawal correctness."
        },
        {
          "title": "Aerospike / Distributed Caching",
          "detail": "Master sub-millisecond key-value stores for user profile and balance caching."
        }
      ]
    }
  },
  {
    "id": "razorpay",
    "name": "Razorpay",
    "category": "fintech",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Practical Coding Round (90 mins in IDE)",
      "Round 02: Data Structures & Algorithmic Problem Solving (60 mins DSA)",
      "Round 03: High-Level System Design (Payment Gateway, Webhook Engine & Banking APIs, 60 mins)",
      "Round 04: Engineering Manager / Values & Culture Fit (60 mins)"
    ],
    "pyqTopics": [
      "Payment Gateway Integration & Smart Routing across Banks",
      "High-Throughput Webhook Ingestion & Delivery with Jitter Backoff",
      "Idempotency, Tokenization & Double-Entry Accounting",
      "Machine Coding LLD: Payment Orchestrator & Auto-Refund Engine",
      "Distributed Caching (Redis) & Microservices on Kubernetes",
      "Dynamic Programming & Graph Shortest Paths"
    ],
    "interviewStyle": "Evaluates clean code craft in Machine Coding, deep fintech systems knowledge (idempotency, webhook delivery, payment routing), and strong DSA foundations.",
    "sampleQuestions": [
      "Machine Coding: Design Payment Gateway with Smart Routing & Fallback (Hard)",
      "Machine Coding: Design Rate Limiter with Sliding Window & Token Bucket (Medium)",
      "Design Razorpay High-Throughput Webhook Delivery Service (100M events/day) (Hard)",
      "Course Schedule II (Medium)",
      "Design Multi-Bank Payment Orchestration Engine (Hard)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Master webhook delivery architecture: exponential backoff, circuit breaking, idempotency headers, and dead letter queues.",
      "In Machine Coding, write clean, object-oriented code with good interface design and unit tests.",
      "Understand Razorpay neo-banking products (RazorpayX, Smart Routing, Subscriptions, Capital)."
    ],
    "systemDesignArchetypes": [
      "Design Razorpay Payment Gateway & Smart Routing Engine",
      "Design Enterprise Webhook Ingestion & Delivery Engine (100M events/day)",
      "Design Neo-Banking Payout & Auto-Reconciliation Engine"
    ],
    "culturalValues": [
      "Customer Obsession & Transparency",
      "Ownership and Agility in Fintech Innovation",
      "Continuous Learning & High Engineering Standards"
    ],
    "communityInsights": [
      {
        "title": "Webhook Question Regular",
        "detail": "Razorpay frequently asks how to reliably deliver webhooks to third-party merchants who might have slow servers or downtime."
      },
      {
        "title": "Smart Routing Mechanics",
        "detail": "Be ready to explain how to dynamically route transactions to the bank with the highest instantaneous success rate."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Payment Patterns",
          "target": "Build payment gateways, rate limiters, and webhook dispatchers in your IDE.",
          "topics": [
            "Payment Gateway Machine Coding",
            "Rate Limiter Implementation",
            "Strategy Pattern Routing",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, hash map lookups, and sliding windows.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Topological Sort",
          "target": "Master dependency DAGs, LCA, and shortest route optimization.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Network Delay Time",
            "Alien Dictionary"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & String Processing",
          "target": "Master sequence matching, knapsack variations, and edit distance.",
          "topics": [
            "Edit Distance",
            "Word Break",
            "Coin Change",
            "Longest Increasing Subsequence"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "Payment Gateway & Webhook System Design",
          "target": "Design Razorpay payment gateway, webhook delivery engine, and payout pipelines.",
          "topics": [
            "Design Razorpay Payment Gateway",
            "Design Reliable Webhook Engine",
            "Design Payout Reconciliation"
          ],
          "deliverable": "Draft 3 complete financial system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Razorpay Culture & Live Mock Loop",
          "target": "Rehearse customer obsession, dealing with outages, and full mock interview loops.",
          "topics": [
            "Razorpay Values Framework",
            "Handling Financial Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Razorpay Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Smart Routing",
          "detail": "Use sliding window success rate metrics per payment network to dynamically route traffic to the healthiest acquirer."
        },
        {
          "title": "Webhook Jitter Backoff",
          "detail": "Add full jitter to exponential retry backoffs to prevent thundering herd on merchant servers."
        },
        {
          "title": "Clean OOP Code",
          "detail": "Structure machine coding classes with clear Separation of Concerns and clean unit test classes."
        }
      ]
    }
  },
  {
    "id": "juspay",
    "name": "JusPay",
    "category": "fintech",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Online Coding Assessment on HackerEarth (3 hard algorithmic problems, 90 mins)",
      "Round 02: Tree / Graph Recursion & Locking Round (Part 1 Coding, 90 mins)",
      "Round 03: Tree / Graph Locking Round (Part 2 — Concurrency, Thread Safety & Multi-Threading, 90 mins)",
      "Round 04: Functional Programming / High-Level System Architecture (60 mins)",
      "Round 05: Founder / Engineering Director Calibration (Deep tech philosophy)"
    ],
    "pyqTopics": [
      "N-ary Tree Locking / Thread-Safe Tree Locking Mechanism (Lock/Unlock/Upgrade)",
      "Functional Programming (Haskell, PureScript, Clojure, Pure Functions)",
      "Payment Orchestration (Express Checkout, 1-Click Payments)",
      "Ultra-Low Latency In-Memory State Machines",
      "Graph Cycle Detection & Shortest Paths",
      "Multi-Threading, Mutexes & Atomic Locks"
    ],
    "interviewStyle": "Legendary for its signature 'Tree of Space / Thread-Safe Tree Locking' round. JusPay evaluates deep first-principles thinking, functional programming mindset (immutability, pure functions), and multithreaded correctness.",
    "sampleQuestions": [
      "Tree of Space: Thread-Safe N-ary Tree Locking & Upgrading (Hard - JusPay Signature)",
      "Design JusPay 1-Click Payment Orchestration Engine (Hard)",
      "Find Shortest Path in Weighted Graph with Turn Constraints (Hard)",
      "Alien Dictionary: Topological Sort (Hard)",
      "Implement Functional State Machine with Immutable Transitions (Medium)",
      "Course Schedule II (Medium)"
    ],
    "prepNotes": [
      "Master the 'Tree of Space' problem thoroughly: Lock(node, id), Unlock(node, id), and Upgrade(node, id) with O(log N) or O(H) complexity.",
      "Understand Functional Programming paradigms: pure functions, immutability, monads, and why JusPay uses PureScript/Haskell in payment routing.",
      "Show deep passion for building high-reliability, zero-latency payment infrastructure."
    ],
    "systemDesignArchetypes": [
      "Design JusPay Express Checkout & Multi-Gateway Orchestration Engine",
      "Design Thread-Safe In-Memory Payment State Machine",
      "Design High-Throughput Bank SDK Telemetry & Auto-Routing Pipeline"
    ],
    "culturalValues": [
      "First-Principles Thinking & Deep Technical Curiosity",
      "Functional Programming & Code Purity",
      "Relentless Focus on Sub-Second Checkout Latency"
    ],
    "communityInsights": [
      {
        "title": "Tree of Space is Decisive",
        "detail": "JusPay's Tree Locking question is asked in almost 90% of hiring drives. Master the parent/child locking invariants and upgrade constraints."
      },
      {
        "title": "Functional Mindset Appreciated",
        "detail": "Even in Java/C++, writing immutable data classes and pure function logic earns immense praise from JusPay interviewers."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "N-ary Trees & Tree Locking (Tree of Space)",
          "target": "Master Tree of Space implementation: Lock, Unlock, and Upgrade with ancestor/descendant state tracking.",
          "topics": [
            "Tree of Space Single Threaded",
            "Ancestor/Descendant Invariant Tracking",
            "O(H) Lock Optimization",
            "Tree Traversal"
          ],
          "deliverable": "Implement fully working Tree of Space solution passing all edge cases."
        },
        {
          "label": "Week 2",
          "focus": "Thread-Safe Tree Locking & Concurrency",
          "target": "Make Tree of Space thread-safe with fine-grained locks and atomic primitives.",
          "topics": [
            "Thread-Safe Tree of Space",
            "Fine-Grained Node Locking",
            "Deadlock Prevention in Trees",
            "Atomic Operations"
          ],
          "deliverable": "Implement multi-threaded Tree of Space with zero concurrency race conditions."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Shortest Paths & Topological Sort",
          "target": "Master Dijkstra, Bellman-Ford, and dependency DAGs.",
          "topics": [
            "Alien Dictionary",
            "Course Schedule II",
            "Cheapest Flights Within K Stops",
            "Network Delay Time"
          ],
          "deliverable": "Solve 20 advanced graph problems."
        },
        {
          "label": "Week 4",
          "focus": "Functional Programming & State Machines",
          "target": "Master immutable state machines, pure functions, and functional programming concepts.",
          "topics": [
            "Immutable State Machine",
            "Pure Function Architecture",
            "Monadic Error Handling",
            "Payment State Transitions"
          ],
          "deliverable": "Build a functional payment state machine in your preferred language."
        },
        {
          "label": "Week 5",
          "focus": "Payment Orchestration System Design",
          "target": "Design JusPay 1-Click checkout, multi-gateway routing, and telemetry pipelines.",
          "topics": [
            "Design JusPay Express Checkout",
            "Design Payment Orchestrator",
            "Design Real-Time Bank Latency Monitor"
          ],
          "deliverable": "Draft 3 complete payment orchestration system blueprints."
        },
        {
          "label": "Week 6",
          "focus": "JusPay Culture & Founder Calibration",
          "target": "Rehearse first-principles engineering reasoning and deep technical problem solving.",
          "topics": [
            "First-Principles Reasoning",
            "Functional Tech Philosophy",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior JusPay Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Tree of Space Mastery",
          "detail": "Maintain descendant_locked_count on every ancestor node to check child lock conditions in O(1) time."
        },
        {
          "title": "Fine-Grained Locking",
          "detail": "Lock nodes top-down (root to node) when verifying ancestor states to prevent circular wait deadlocks."
        },
        {
          "title": "Functional Purity",
          "detail": "Separate side-effects (IO/database) from pure deterministic business rules."
        }
      ]
    }
  },
  {
    "id": "cred",
    "name": "CRED",
    "category": "fintech",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Low-Level Design (90 mins in IDE — clean OOP & design patterns)",
      "Round 02: Problem Solving & Data Structures (60 mins DSA, Graphs & DP)",
      "Round 03: High-Level System Design (Credit Card Payments, Gamification Engine & Microservices, 60 mins)",
      "Round 04: Engineering Manager / High-Bar Culture & Product Design Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Gamification Engine & Reward Distribution Architecture (Jackpot, CRED Coins)",
      "Credit Card Bill Payment & Statement Ingestion",
      "Machine Coding: Reward Evaluator & Slot Machine Engine",
      "High-Trust Financial Microservices with Idempotency",
      "Distributed Caching (Redis) & High-Throughput Event Streaming",
      "Dynamic Programming & Sliding Windows"
    ],
    "interviewStyle": "High aesthetic bar, product-first engineering craft, clean machine coding in IDE, and high-concurrency gamification/payments system design.",
    "sampleQuestions": [
      "Machine Coding: Design CRED Reward & Cashback Distribution Engine (Hard)",
      "Machine Coding: Design Credit Card Statement Parser & Bill Reminder Service (Medium)",
      "Design CRED Slot Machine & Real-Time Jackpot Reward Engine (Hard)",
      "Subarray Sum Equals K (Medium)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "CRED values beautiful, clean code. In Machine Coding, write modular classes with clean separation between reward calculation, inventory, and user balance.",
      "For System Design, master high-concurrency gamification: how to award millions of scratch cards/jackpots concurrently without race conditions.",
      "Demonstrate product empathy, design sensitivity, and architectural rigor."
    ],
    "systemDesignArchetypes": [
      "Design CRED High-Concurrency Reward & Gamification Engine",
      "Design Credit Card Bill Payment & Settlement Pipeline (BBPS)",
      "Design Real-Time Financial Statement Ingestion & Notification Engine"
    ],
    "culturalValues": [
      "Obsession with High Trust & Design Elegance",
      "High Agency, Speed and Uncompromising Quality",
      "Audacity to Build for the Top Tier of Trust"
    ],
    "communityInsights": [
      {
        "title": "Gamification Scale",
        "detail": "CRED loves asking about real-time gamification (Spin the Wheel, Jackpot) during IPL campaigns with millions of concurrent users."
      },
      {
        "title": "Clean Code & Naming",
        "detail": "Poor variable naming or messy class structures in Round 1 Machine Coding will severely hurt your evaluation."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Reward Engine Architecture",
          "target": "Build reward evaluators, slot machines, and statement parsers in your IDE.",
          "topics": [
            "Machine Coding Structure",
            "Strategy Pattern for Rewards",
            "Clean In-Memory Repositories",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Sliding Windows & Hash Maps",
          "target": "Master two pointers, hash lookups, and interval scheduling.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Topological Sort",
          "target": "Master dependency DAGs, LCA, and shortest route optimization.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Word Ladder",
            "Alien Dictionary"
          ],
          "deliverable": "Solve 20 graph/tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Probability",
          "target": "Master sequence matching, knapsack variations, and reward probabilities.",
          "topics": [
            "Coin Change",
            "Knight Probability in Chessboard",
            "Word Break",
            "Edit Distance"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Gamification & Payment System Design",
          "target": "Design CRED gamification engine, credit card payment pipelines, and statement ingestion.",
          "topics": [
            "Design CRED Jackpot Engine",
            "Design Credit Card Bill Payment",
            "Design Notification Bus"
          ],
          "deliverable": "Draft 3 complete system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "CRED Culture & Live Mock Loop",
          "target": "Rehearse product design empathy, high agency, and full mock interview loops.",
          "topics": [
            "CRED Culture Values",
            "Handling High-Concurrency Surges",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior CRED Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Gamification Concurrency",
          "detail": "Use Redis atomic counters and Lua scripts for reward bucket quota management to prevent over-allocation."
        },
        {
          "title": "Clean OOP Architecture",
          "detail": "Structure machine coding classes with clear interfaces, Strategy pattern, and 100% test coverage."
        },
        {
          "title": "Idempotent Bill Pay",
          "detail": "Enforce strict idempotency on credit card bill payments via Bharat Bill Payment System (BBPS)."
        }
      ]
    }
  },
  {
    "id": "paytm",
    "name": "Paytm",
    "category": "fintech",
    "region": "Noida / Bengaluru, India",
    "hiringProcess": [
      "Round 01: Online Coding Assessment on HackerEarth (2-3 DSA problems, 90 mins)",
      "Round 02: Technical Interview 1 — Core DSA, Trees & Graphs (60 mins)",
      "Round 03: Technical Interview 2 — Concurrency, Multithreading & Database Internals (60 mins)",
      "Round 04: High-Level System Design (UPI, Wallet & Soundbox IoT Scale, 60 mins)",
      "Round 05: Techno-Managerial & Leadership Fit (60 mins)"
    ],
    "pyqTopics": [
      "Soundbox IoT Real-Time Audio Broadcast (MQTT / WebSockets)",
      "Digital Wallet Balance Updates & Transaction Ledgers",
      "High-Throughput UPI Payment Gateway",
      "Java Multi-Threading & Thread Pool Tuning",
      "Distributed Caching (Redis) & Database Sharding (MySQL / TiDB)",
      "Dynamic Programming & Graph Traversals"
    ],
    "interviewStyle": "Tests strong Java backend foundations, multi-threading and concurrency, real-time IoT scale (Paytm Soundbox audio notifications), and high-volume digital wallet architectures.",
    "sampleQuestions": [
      "Design Paytm Soundbox Real-Time Payment Audio Broadcast Engine (Hard)",
      "Design Digital Wallet with Concurrency Safe Balance Deduction (Hard)",
      "Course Schedule II (Medium)",
      "LRU Cache with Custom In-Memory Storage (Medium)",
      "Subarray Sum Equals K (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Paytm Soundbox IoT architecture: MQTT lightweight messaging, connection pooling for millions of connected IoT devices, and sub-second payment confirmation broadcasts.",
      "Master Java concurrency: ReentrantLock, synchronized blocks, CAS atomics, and deadlock prevention.",
      "Prepare for high-volume database sharding and distributed transaction reconciliation."
    ],
    "systemDesignArchetypes": [
      "Design Paytm Soundbox Real-Time Audio Broadcast Engine (Millions of IoT devices)",
      "Design Digital Wallet Balance & Reconciliation Engine",
      "Design High-Throughput UPI Merchant Payment Switch"
    ],
    "culturalValues": [
      "Speed of Execution & Grassroots Innovation",
      "Customer and Merchant Obsession across India",
      "Tenacity and Resilience in High-Scale Operations"
    ],
    "communityInsights": [
      {
        "title": "Soundbox IoT Architecture",
        "detail": "Paytm interviewers frequently ask how to broadcast payment confirmation audio to millions of hardware Soundboxes within 500ms using MQTT."
      },
      {
        "title": "Java & Concurrency Bar",
        "detail": "Expect deep questions on JVM memory, thread pool exhaustion, and database isolation levels."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and hash lookups.",
          "topics": [
            "Subarray Sum Equals K",
            "LRU Cache",
            "Trapping Rain Water",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 2",
          "focus": "Java Concurrency & Multi-Threading",
          "target": "Implement safe balance deductions, thread-safe queues, and deadlock avoidance.",
          "topics": [
            "Thread-Safe Wallet Balance",
            "Deadlock Detection",
            "ExecutorService Thread Pools",
            "Atomic CAS Operations"
          ],
          "deliverable": "Implement a concurrent wallet transfer simulator."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Caching",
          "target": "Master 1D/2D DP, knapsack variations, and Redis caching.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "Word Break",
            "Redis Cache Invalidation"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "IoT Scale & Payment System Design",
          "target": "Design Paytm Soundbox MQTT broadcast, wallet ledgers, and UPI merchant switches.",
          "topics": [
            "Design Soundbox Broadcast Engine",
            "Design Digital Wallet Ledger",
            "Design UPI Merchant Switch"
          ],
          "deliverable": "Draft 3 complete financial & IoT system blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Paytm Leadership Calibration & Full Simulation",
          "target": "Rehearse high-urgency execution, handling outages, and full mock interview loops.",
          "topics": [
            "Paytm Values Framework",
            "Handling Massive Festival Traffic",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Paytm Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "MQTT for Soundbox",
          "detail": "Use MQTT QoS 1 with persistent sessions to ensure audio payment notifications are never dropped."
        },
        {
          "title": "Optimistic Concurrency",
          "detail": "Use version-based optimistic locking (WHERE balance >= amount AND version = current_version) for wallet balance deductions."
        },
        {
          "title": "High-Throughput Sharding",
          "detail": "Shard transaction databases by user_id and merchant_id with distributed global read replicas."
        }
      ]
    }
  },
  {
    "id": "meesho",
    "name": "Meesho",
    "category": "high-growth",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding Round (90 mins in IDE — clean OOP & design patterns)",
      "Round 02: Data Structures & Problem Solving (60 mins DSA)",
      "Round 03: High-Level System Design (E-Commerce Scale for Tier 2/3 India, 60 mins)",
      "Round 04: Hiring Manager / Culture & High-Ownership Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Low-Bandwidth Mobile Optimization & Image Compression",
      "High-Throughput Zero-Commission Marketplace Architecture",
      "Machine Coding: Reseller Commission & Order Management",
      "Catalog Search & Tier 2/3 Vernacular Discovery",
      "Distributed Caching & High-Volume Order Placement",
      "Graph Traversals & Dynamic Programming"
    ],
    "interviewStyle": "Combines rigorous Machine Coding LLD in Round 1 with deep system design questions tailored for massive Tier 2/3 Indian e-commerce scale and low-cost cloud infrastructure.",
    "sampleQuestions": [
      "Machine Coding: Design Reseller Commission & Order Management Engine (Hard)",
      "Design Meesho High-Scale E-Commerce Product Discovery & Catalog Search (Hard)",
      "Rotting Oranges (Medium)",
      "Design Distributed Order Ingestion Engine for Flash Sales (Hard)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Meesho unique scale: 0% commission marketplace, millions of small sellers, optimized for low-end mobile devices and Tier 2/3 networks.",
      "Write clean, modular OOP code in the Machine Coding round with test cases.",
      "Demonstrate cost-effective cloud engineering: optimizing cloud compute, Redis caching, and database read/write ratios."
    ],
    "systemDesignArchetypes": [
      "Design Meesho High-Scale Product Catalog & Vernacular Search Engine",
      "Design Flash Sale Order Ingestion & Inventory Reservation Engine",
      "Design Reseller Network & Social Commerce Referral Pipeline"
    ],
    "culturalValues": [
      "User First & Act with Speed and Agility",
      "Think 10X & Frugality in Engineering",
      "Empower Small Businesses across Bharat"
    ],
    "communityInsights": [
      {
        "title": "Machine Coding Filter",
        "detail": "Round 1 Machine Coding is strictly evaluated for OOP design patterns and clean code structure."
      },
      {
        "title": "Cost & Scale Sensitivity",
        "detail": "Meesho interviewers love when candidates discuss cost-efficient architectural trade-offs alongside raw scale."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Reseller Architecture",
          "target": "Build order management, commission calculators, and cart services in your IDE.",
          "topics": [
            "Machine Coding Structure",
            "Strategy Pattern for Pricing",
            "Clean Repositories",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and hash lookups.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Rotting Oranges",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Caching",
          "target": "Master 1D/2D DP, knapsack variations, and caching strategies.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "Word Break",
            "Redis Cache Invalidation"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale E-Commerce System Design",
          "target": "Design Meesho catalog search, flash sale order ingestion, and social sharing feeds.",
          "topics": [
            "Design Meesho Catalog Search",
            "Design Flash Sale Order Pipeline",
            "Design Social Commerce Referral Engine"
          ],
          "deliverable": "Draft 3 complete e-commerce system blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Meesho Culture & Live Mock Loop",
          "target": "Rehearse user-first thinking, 10X scale mindset, and full mock interview loops.",
          "topics": [
            "Meesho Culture Values",
            "Frugality & Cost-Effective Architecture",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Meesho Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Frugal Architecture",
          "detail": "Optimize memory and compute usage by using read replicas, compact JSON payloads, and image CDNs."
        },
        {
          "title": "Machine Coding Modularity",
          "detail": "Write clean classes with clear separation between business logic and database interfaces."
        },
        {
          "title": "Vernacular Search",
          "detail": "Explain tokenization, phonetic matching, and fuzzy search for multilingual Indian users."
        }
      ]
    }
  },
  {
    "id": "ola",
    "name": "Ola",
    "category": "high-growth",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Problem Solving Round (90 mins in IDE)",
      "Round 02: Data Structures & Core Algorithms (60 mins DSA)",
      "Round 03: High-Level System Design (Ride Dispatch, EV Telemetry & Geospatial Routing, 60 mins)",
      "Round 04: Engineering Manager / Culture & Agility Fit (60 mins)"
    ],
    "pyqTopics": [
      "Geospatial Ride Matching & Driver Allocation",
      "Real-Time Vehicle Telemetry Ingestion (Ola Electric / Scooters)",
      "Machine Coding LLD: Ride Sharing & Surge Pricing Engine",
      "Dynamic Pricing & High-Concurrency Booking",
      "Distributed Caching & High-Throughput Location Ingestion",
      "Graph Shortest Paths & Priority Queues"
    ],
    "interviewStyle": "Tests real-time mobility algorithms, geospatial indexing, Machine Coding LLD, EV battery telemetry ingestion at scale, and high-speed execution.",
    "sampleQuestions": [
      "Machine Coding: Design Ride Matching & Driver Allocation Engine (Hard)",
      "Design Ola Real-Time Cab Location Ingestion & Dispatch Engine (Hard)",
      "Design Ola Electric IoT Telemetry Ingestion for 1M Scooters (Hard)",
      "Bus Routes: Minimum vehicle transfers (Hard)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Ola geospatial mobility architecture: Geohash spatial bucketing, driver dispatch algorithms, and surge pricing.",
      "For Ola Electric, understand IoT telemetry ingestion: MQTT/Kafka, battery telemetry metrics, and real-time charging station locators.",
      "In Machine Coding, write clean, compilable OOP code with unit tests."
    ],
    "systemDesignArchetypes": [
      "Design Ola Real-Time Cab Dispatch & Surge Pricing Engine",
      "Design Ola Electric Telemetry & Battery Health Ingestion Pipeline",
      "Design Navigation & Shortest Path Routing Service with Live Traffic"
    ],
    "culturalValues": [
      "Mission-Driven Agility & High Execution Speed",
      "Building World-Class Mobility for Emerging Markets",
      "Extreme Ownership and Hustle"
    ],
    "communityInsights": [
      {
        "title": "Mobility & EV Questions",
        "detail": "Ola frequently asks about geospatial driver dispatch and high-frequency IoT telemetry ingestion from Ola Electric scooters."
      },
      {
        "title": "Machine Coding Speed",
        "detail": "You must implement working driver-rider matching with unit tests within 90 minutes."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Mobility Domain Modeling",
          "target": "Implement ride matching, driver allocation, and surge calculator in your IDE.",
          "topics": [
            "Machine Coding Structure",
            "Strategy Pattern for Dispatch",
            "Clean In-Memory Repositories",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Geospatial Indexing & Graphs",
          "target": "Master Geohash, QuadTrees, Dijkstra shortest paths, and priority queues.",
          "topics": [
            "Bus Routes",
            "Meeting Rooms II",
            "Network Delay Time",
            "Geohash Spatial Clustering"
          ],
          "deliverable": "Solve 20 spatial and graph routing problems."
        },
        {
          "label": "Week 3",
          "focus": "Dynamic Programming & Optimization",
          "target": "Master route optimization, knapsack variations, and travel cost DP.",
          "topics": [
            "Trapping Rain Water",
            "Word Break II",
            "Coin Change",
            "Longest Increasing Subsequence"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 4",
          "focus": "Concurrency & IoT Telemetry Pipelines",
          "target": "Master thread-safe queues, MQTT ingestion, and location streaming.",
          "topics": [
            "Thread-Safe Dispatch Queue",
            "MQTT Telemetry Ingestion",
            "WebSocket Location Broadcast",
            "Kafka Partitioning"
          ],
          "deliverable": "Implement a real-time vehicle location tracking simulator."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Mobility System Design",
          "target": "Design Ola cab dispatch, EV telemetry pipelines, and navigation routing engines.",
          "topics": [
            "Design Ola Cab Dispatch",
            "Design EV Telemetry Ingestion",
            "Design Live Navigation & Traffic"
          ],
          "deliverable": "Draft 3 complete mobility system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Ola Culture & Live Mock Loop",
          "target": "Rehearse high-urgency execution, dealing with outages, and full mock interview loops.",
          "topics": [
            "Ola Values Framework",
            "Handling Scale Bottlenecks in Mobility",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Ola Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Geospatial Grids",
          "detail": "Use Geohash or H3 hexagon cells for fast spatial proximity searches."
        },
        {
          "title": "IoT Telemetry Streaming",
          "detail": "Buffer scooter telemetry in Kafka and write to Time-Series Databases (InfluxDB / TimescaleDB)."
        },
        {
          "title": "Locking Mechanisms",
          "detail": "Prevent double driver assignment using Redis distributed locks."
        }
      ]
    }
  },
  {
    "id": "inmobi",
    "name": "InMobi",
    "category": "high-growth",
    "region": "Bengaluru, India / Global",
    "hiringProcess": [
      "Round 01: HackerEarth Online Assessment (3 algorithmic problems, 90 mins)",
      "Round 02: Technical Interview 1 — Advanced Data Structures & Tree/Graph Theory (60 mins)",
      "Round 03: Technical Interview 2 — Concurrency, Multithreading & Low Latency Systems (60 mins)",
      "Round 04: High-Level System Design (Real-Time Bidding (RTB), Ad Server & Data Pipelines, 60 mins)",
      "Round 05: Engineering Leadership & Cultural Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Real-Time Bidding (RTB) under 50ms SLA",
      "High-Throughput Ad Server Architecture (1M+ QPS)",
      "Probabilistic Data Structures (HyperLogLog, Bloom Filters, Count-Min Sketch)",
      "Distributed Stream Processing (Kafka, Flink, Spark Streaming)",
      "Java / C++ Concurrency & Lock-Free Data Structures",
      "Graph Traversals & Dynamic Programming"
    ],
    "interviewStyle": "Heavy emphasis on ultra-low latency ad serving (sub-50ms Real-Time Bidding auctions), probabilistic data structures (Bloom filters, HyperLogLog for unique user counting), and massive-scale data streaming.",
    "sampleQuestions": [
      "Design Real-Time Bidding (RTB) Ad Auction Engine (sub-50ms p99 latency) (Hard)",
      "Design Unique Ad Impression Counter using HyperLogLog & Redis (Medium)",
      "Implement Thread-Safe Lock-Free Ring Buffer for Ad Bid Streams (Hard)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)",
      "LRU Cache with TTL (Medium)"
    ],
    "prepNotes": [
      "Master Probabilistic Data Structures: HyperLogLog for cardinality estimation (unique viewers), Bloom Filters for frequency capping, and Count-Min Sketch for top ads.",
      "Understand Real-Time Bidding (RTB) protocol: DSP (Demand Side Platform), SSP (Supply Side Platform), and Ad Exchange auction mechanics.",
      "Demonstrate deep knowledge of high-throughput Java/C++ concurrency, lock-free queues, and memory optimization."
    ],
    "systemDesignArchetypes": [
      "Design Real-Time Bidding (RTB) Ad Exchange (1M QPS, <50ms SLA)",
      "Design Distributed Ad Impression Tracking & Fraud Detection Pipeline",
      "Design User Demographic Profile & Targeted Ad Serving Engine"
    ],
    "culturalValues": [
      "Thinking Big and Disrupting Global Mobile Advertising",
      "Freedom with Responsibility and High Passion",
      "Uncompromising Technical Excellence"
    ],
    "communityInsights": [
      {
        "title": "Probabilistic Data Structures",
        "detail": "InMobi interviewers love asking how to count unique users and enforce ad frequency caps across billions of impressions using Bloom filters and HyperLogLog."
      },
      {
        "title": "Sub-50ms Latency SLA",
        "detail": "In System Design, you must show how an ad auction completes within 50ms including network transport and DSP response times."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Probabilistic Data Structures & Hashing",
          "target": "Master Bloom Filters, HyperLogLog, sliding window counters, and custom hash tables.",
          "topics": [
            "Bloom Filter Implementation",
            "HyperLogLog Cardinality Math",
            "LRU Cache",
            "Subarray Sum Equals K"
          ],
          "deliverable": "Implement a working Bloom Filter and unique impression tracker."
        },
        {
          "label": "Week 2",
          "focus": "Concurrency, Low Latency & Lock-Free Data Structures",
          "target": "Master lock-free ring buffers, thread-safe memory caches, and non-blocking IO.",
          "topics": [
            "Lock-Free Ring Buffer",
            "Disruptor Pattern",
            "Atomic CAS Operations",
            "Producer-Consumer Sync"
          ],
          "deliverable": "Implement a high-throughput lock-free auction queue in code."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Search Algorithms",
          "target": "Master topological sorting, LCA in binary trees, and dependency graphs.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Optimization",
          "target": "Master sequence matching, knapsack variations, and budget optimization DP.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "Trapping Rain Water",
            "Word Break"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "Real-Time AdTech System Design",
          "target": "Design RTB ad exchanges, impression tracking pipelines, and user profiling engines.",
          "topics": [
            "Design RTB Ad Exchange (<50ms)",
            "Design Ad Impression Pipeline",
            "Design Ad Frequency Capping Service"
          ],
          "deliverable": "Draft 3 complete AdTech system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "InMobi Culture & Live Mock Loop",
          "target": "Rehearse latency optimization, handling ad fraud, and full mock interview loops.",
          "topics": [
            "InMobi Values Framework",
            "Handling Latency Spikes in Ad Auctions",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior InMobi Architects."
        }
      ],
      "curatedPrep": [
        {
          "title": "RTB Auction Latency",
          "detail": "Set strict 30ms timeouts for outbound DSP bid requests; proceed with available bids to meet 50ms SLA."
        },
        {
          "title": "Frequency Capping",
          "detail": "Use Redis sliding window bitsets or Bloom filters to ensure a user never sees the same ad more than N times a day."
        },
        {
          "title": "Stream Ingestion",
          "detail": "Ingest click and impression telemetry through Kafka partitions grouped by campaign_id."
        }
      ]
    }
  },
  {
    "id": "postman",
    "name": "Postman",
    "category": "enterprise",
    "region": "San Francisco, CA / Bengaluru, India",
    "hiringProcess": [
      "Round 01: Practical Take-Home Coding Challenge or Live Screen on CoderPad (60-90 mins)",
      "Round 02: Technical Interview 1 — Data Structures & Problem Solving (60 mins)",
      "Round 03: Technical Interview 2 — API Design, Web Protocols & Async Architecture (60 mins)",
      "Round 04: High-Level System Design (Collaborative Workspace Sync, API Platform, 60 mins)",
      "Round 05: Engineering Leadership & Developer Empathy Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Real-Time Collaborative API Workspace Sync (CRDT / WebSockets)",
      "API Gateway Architecture & Request Interceptors",
      "HTTP/2, HTTP/3, gRPC & WebSocket Protocol Internals",
      "Distributed Mock Server & API Monitoring Pipelines",
      "Trees, Graphs & Prefix Tries",
      "Developer Experience (DX) & Extensibility"
    ],
    "interviewStyle": "Focuses on deep networking/HTTP protocols, real-time collaboration architecture (WebSockets, CRDTs), clean API design, and passionate empathy for developer experience.",
    "sampleQuestions": [
      "Design Collaborative API Workspace Sync with Real-Time Multi-User Editing (Hard)",
      "Design High-Throughput API Mocking & Monitoring Service at Scale (Hard)",
      "Implement HTTP Request Parser & Route Matcher with Path Variables (Medium)",
      "Implement Trie (Prefix Tree) for API Endpoint Autocompletion (Medium)",
      "Course Schedule II: API dependency resolution (Medium)",
      "LRU Cache with Custom In-Memory Storage (Medium)"
    ],
    "prepNotes": [
      "Deep dive into Web Protocols: HTTP/1.1 vs HTTP/2 multiplexing, HTTP/3 QUIC, WebSocket handshakes, and gRPC streaming.",
      "Understand Real-Time Collaboration: Conflict-Free Replicated Data Types (CRDTs) vs Operational Transformation (OT) for syncing API collections.",
      "Demonstrate immense empathy for developer experience, SDK usability, and clean API design."
    ],
    "systemDesignArchetypes": [
      "Design Postman Real-Time Collaborative API Workspace Sync",
      "Design Global API Monitoring & Automated Test Runner Pipeline",
      "Design High-Scale Distributed API Mock Server"
    ],
    "culturalValues": [
      "Developer First & Relentless Focus on Great API Design",
      "Curiosity, Openness and Global Collaboration",
      "Continuous Innovation in API Platform Ecosystems"
    ],
    "communityInsights": [
      {
        "title": "Deep Protocol Knowledge",
        "detail": "Postman interviewers will ask detailed questions about HTTP headers, CORS, TLS handshakes, and WebSocket frame protocols."
      },
      {
        "title": "API Design Excellence",
        "detail": "Design clean, RESTful and GraphQL APIs with proper status codes, pagination, and error contracts."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "API Parsing, Tries & String Processing",
          "target": "Master Prefix Tries, route matching with wildcards, and JSON payload parsers.",
          "topics": [
            "Implement Trie",
            "HTTP Route Matcher",
            "LRU Cache",
            "Subarray Sum Equals K"
          ],
          "deliverable": "Implement an in-memory API router with wildcard and prefix matching."
        },
        {
          "label": "Week 2",
          "focus": "Web Protocols & WebSocket Concurrency",
          "target": "Master WebSocket gateways, async event loops, and bidirectional streaming.",
          "topics": [
            "WebSocket Connection Manager",
            "HTTP/2 Multiplexing Internals",
            "Async Event Loop",
            "Rate Limiter"
          ],
          "deliverable": "Build a multi-client WebSocket broadcast server."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Dependency Resolution",
          "target": "Master DAG dependency resolution for API test collections, LCA, and topological sort.",
          "topics": [
            "Course Schedule I & II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Collaborative Sync & CRDT Mechanics",
          "target": "Master Conflict-Free Replicated Data Types (CRDT) for multi-user document syncing.",
          "topics": [
            "CRDT State-Based vs Operation-Based",
            "Vector Clocks",
            "LWW-Element-Set",
            "Collaborative State Sync"
          ],
          "deliverable": "Implement a simple text-based CRDT collaborative editor simulator."
        },
        {
          "label": "Week 5",
          "focus": "Developer Platform System Design",
          "target": "Design Postman collaborative workspaces, API mock servers, and automated test runners.",
          "topics": [
            "Design Postman Workspace Sync",
            "Design Global API Mock Server",
            "Design API Monitoring Pipeline"
          ],
          "deliverable": "Draft 3 complete developer platform architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Postman Culture & Live Mock Loop",
          "target": "Rehearse developer empathy, API design philosophy, and full mock interview loops.",
          "topics": [
            "Developer Experience Philosophy",
            "Handling Large Scale Platform Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Postman Platform Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "CRDT Collaboration",
          "detail": "Use State-based CRDTs with vector clocks to resolve concurrent API collection edits without central locks."
        },
        {
          "title": "Mock Server Caching",
          "detail": "Cache mock responses at edge CDN locations with regex-based URL pattern matching."
        },
        {
          "title": "API Design Contracts",
          "detail": "Design idempotent PUT/DELETE endpoints with comprehensive JSON schema validation."
        }
      ]
    }
  },
  {
    "id": "browserstack",
    "name": "BrowserStack",
    "category": "enterprise",
    "region": "Dublin, Ireland / Mumbai / Bengaluru, India",
    "hiringProcess": [
      "Round 01: Online Coding Assessment on HackerEarth (2-3 DSA problems, 90 mins)",
      "Round 02: Technical Interview 1 — Core Data Structures & Systems Programming (60 mins)",
      "Round 03: Technical Interview 2 — Concurrency, OS Internals & Networking (60 mins)",
      "Round 04: High-Level System Design (Cloud Device Grid, Remote Browser Streaming & WebRTC, 60 mins)",
      "Round 05: Engineering Leadership & Culture Fit (60 mins)"
    ],
    "pyqTopics": [
      "Real-Time Video Streaming & Remote Browser Control (WebRTC, VNC)",
      "Cloud Mobile & Desktop Device Farm Scheduling",
      "OS Internals, Virtualization & Container Isolation (Docker, KVM)",
      "Multi-Threading, Concurrency & WebSocket Management",
      "Trees, Graphs & Dynamic Programming",
      "High-Throughput Log Ingestion & Session Recording"
    ],
    "interviewStyle": "Strong focus on systems programming, operating system virtualization, remote desktop/browser streaming (WebRTC, WebSocket), real-time device allocation, and core DSA.",
    "sampleQuestions": [
      "Design Cloud Device Farm Allocation & Session Scheduling Engine (Hard)",
      "Design Low-Latency WebRTC Remote Browser Screen Streaming Pipeline (Hard)",
      "Implement Thread-Safe Device Pool Manager with Lease Expiration (Medium)",
      "Course Schedule II (Medium)",
      "LRU Cache with Custom In-Memory Storage (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand BrowserStack core technology: real device farms (iOS/Android), desktop browser virtualization, WebRTC sub-100ms video streaming, and Selenium/Appium test grid orchestration.",
      "Master OS concepts: process isolation, containerization, memory virtual memory, and thread scheduling.",
      "Demonstrate strong multi-threading and concurrency mastery in Java, C++, or Node.js."
    ],
    "systemDesignArchetypes": [
      "Design BrowserStack Cloud Real Device Farm & Test Scheduling Engine",
      "Design Low-Latency WebRTC Remote Screen Streaming Pipeline",
      "Design High-Throughput Selenium / Appium Test Execution Grid"
    ],
    "culturalValues": [
      "Engineering Craftsmanship & Product Excellence",
      "Speed of Innovation & Customer Centricity",
      "Empowering Millions of Developers Worldwide"
    ],
    "communityInsights": [
      {
        "title": "Virtualization & Video Streaming",
        "detail": "BrowserStack interviewers frequently ask how to stream a remote mobile/desktop screen to a web browser with sub-100ms latency."
      },
      {
        "title": "Device Allocation Scheduler",
        "detail": "Be ready to design a fair-share priority scheduler that assigns physical mobile devices to concurrent automated test suites."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and custom cache implementations.",
          "topics": [
            "LRU Cache",
            "Subarray Sum Equals K",
            "Two Sum",
            "Trapping Rain Water"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 2",
          "focus": "Concurrency, Thread Pools & Device Allocators",
          "target": "Implement thread-safe device pools, lease timeouts, and worker queues.",
          "topics": [
            "Thread-Safe Device Pool Manager",
            "ExecutorService Sizing",
            "Deadlock Prevention",
            "Atomic Leases"
          ],
          "deliverable": "Build a simulated device allocation scheduler in code."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG test dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule I & II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "OS Internals & Streaming Protocols",
          "target": "Master WebRTC, video streaming buffers, WebSockets, and process virtualization.",
          "topics": [
            "WebRTC Streaming Protocol",
            "WebSocket Gateway",
            "Docker Container Isolation",
            "Memory Mapped Buffers"
          ],
          "deliverable": "Build a low-latency WebSocket screen streaming server simulator."
        },
        {
          "label": "Week 5",
          "focus": "Cloud Device Farm System Design",
          "target": "Design BrowserStack device farms, WebRTC video pipelines, and Selenium grids.",
          "topics": [
            "Design Cloud Device Farm",
            "Design WebRTC Remote Browser Stream",
            "Design Automated Test Grid"
          ],
          "deliverable": "Draft 3 complete cloud testing infrastructure blueprints."
        },
        {
          "label": "Week 6",
          "focus": "BrowserStack Culture & Live Mock Loop",
          "target": "Rehearse developer empathy, systems debugging, and full mock interview loops.",
          "topics": [
            "BrowserStack Values Framework",
            "Handling Device Allocation Deadlocks",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior BrowserStack Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Device Allocation Locks",
          "detail": "Use distributed leases with TTL heartbeats to ensure crashed test jobs release physical devices automatically."
        },
        {
          "title": "WebRTC Video Pipeline",
          "detail": "Encode screen frames with H.264 / VP8 hardware encoders and stream over WebRTC UDP for sub-100ms interaction."
        },
        {
          "title": "Clean Concurrency",
          "detail": "Avoid synchronized bottlenecks by using lock-free ring buffers and concurrent worker queues."
        }
      ]
    }
  },
  {
    "id": "groww",
    "name": "Groww",
    "category": "fintech",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Problem Solving Round (90 mins in IDE)",
      "Round 02: Data Structures & Core Algorithms (60 mins DSA)",
      "Round 03: High-Level System Design (Stock Market Trading, Real-Time Tick Feeds & Mutual Funds, 60 mins)",
      "Round 04: Engineering Manager / Cultural Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Stock Exchange Order Routing & Market Ticker Feeds (NSE/BSE)",
      "Machine Coding LLD: Stock Brokerage & Portfolio Tracker",
      "Real-Time Stock Price Broadcast with WebSockets",
      "High-Concurrency Order Placement & Fund Locking",
      "Distributed Caching (Redis) & Audit Ledgers",
      "Trees, Graphs & Dynamic Programming"
    ],
    "interviewStyle": "Tests clean machine coding LLD in Round 1, strong DSA foundations, and scalable stock brokerage / mutual fund system design (handling 9:15 AM market opening spikes).",
    "sampleQuestions": [
      "Machine Coding: Design Stock Brokerage Order Placement & Portfolio Management System (Hard)",
      "Design Real-Time Stock Market Tick Ingestion & WebSocket Broadcast Engine (Hard)",
      "Design Stock Order Matching & Fund Reservation Engine (Hard)",
      "Subarray Sum Equals K (Medium)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand stock market mechanics: NSE/BSE order types (Market, Limit, SL), trading hours market opening 9:15 AM traffic spikes, and Demat account integrations.",
      "Write clean, modular OOP code in the Machine Coding round with unit test cases.",
      "Emphasize zero data loss, strict transaction ordering, and low-latency price broadcast."
    ],
    "systemDesignArchetypes": [
      "Design Groww Real-Time Stock Price Feed & WebSocket Broadcast Engine",
      "Design Stock Order Placement & Pre-Trade Fund Verification Engine",
      "Design Mutual Fund SIP Execution & Portfolio Valuation Pipeline"
    ],
    "culturalValues": [
      "Simplicity & Transparency for Indian Retail Investors",
      "Extreme Customer Focus and Reliability",
      "Ownership, Speed and High Integrity"
    ],
    "communityInsights": [
      {
        "title": "9:15 AM Market Open Scale",
        "detail": "Groww frequently asks how to handle the massive 9:15 AM stock market opening spike where millions of users check live prices simultaneously."
      },
      {
        "title": "Machine Coding Filter",
        "detail": "Clean class design, proper design patterns (Strategy, Factory), and working code are mandatory in Round 1."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Brokerage Modeling",
          "target": "Build order placement, portfolio valuation, and stock ticker models in your IDE.",
          "topics": [
            "Machine Coding Structure",
            "Strategy Pattern for Order Types",
            "In-Memory Repositories",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and hash lookups.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Concurrency & Real-Time Price Broadcast",
          "target": "Master thread-safe queues, WebSocket connection pooling, and atomic balance deductions.",
          "topics": [
            "Thread-Safe Portfolio Updates",
            "WebSocket Connection Manager",
            "Atomic Balance Locking",
            "CAS Operations"
          ],
          "deliverable": "Build a real-time stock price broadcast simulator."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Stock Trading System Design",
          "target": "Design Groww live tick broadcast, order placement engines, and mutual fund SIP schedulers.",
          "topics": [
            "Design Groww Live Price Feed",
            "Design Stock Order Placement",
            "Design SIP Execution Scheduler"
          ],
          "deliverable": "Draft 3 complete financial system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Groww Culture & Live Mock Loop",
          "target": "Rehearse customer simplicity, dealing with high market volatility, and full mock interview loops.",
          "topics": [
            "Groww Values Framework",
            "Handling 9:15 AM Market Spikes",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Groww Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "WebSocket Gateway Scaling",
          "detail": "Use edge WebSocket gateways connected to Kafka price topics to fan out live prices to 5M+ concurrent users."
        },
        {
          "title": "Pre-Trade Margin Verification",
          "detail": "Lock funds in Redis atomically before dispatching order requests to exchange brokers."
        },
        {
          "title": "Machine Coding Modularity",
          "detail": "Separate order validation, portfolio execution, and storage layers into distinct classes."
        }
      ]
    }
  },
  {
    "id": "cashfree",
    "name": "Cashfree",
    "category": "fintech",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Practical Coding Round (90 mins in IDE)",
      "Round 02: Data Structures & Core Algorithms (60 mins DSA)",
      "Round 03: High-Level System Design (Bulk Payouts, Multi-Bank Routing & Webhooks, 60 mins)",
      "Round 04: Engineering Manager / Culture Fit (60 mins)"
    ],
    "pyqTopics": [
      "High-Volume Bulk Payout Engine (Instant Bank & UPI Transfers)",
      "Auto-Collect & Virtual Account Generation",
      "Idempotency & Double-Entry Financial Accounting",
      "Machine Coding: Payment Routing & Reconciliation",
      "Distributed Caching (Redis) & Message Queues (Kafka)",
      "Dynamic Programming & Graph Traversals"
    ],
    "interviewStyle": "Tests clean Machine Coding in Round 1, strong DSA foundations, and robust payment gateway/bulk payout infrastructure design.",
    "sampleQuestions": [
      "Machine Coding: Design Bulk Payout Processing Engine with Multi-Bank Failover (Hard)",
      "Design Cashfree Bulk Payout & Instant UPI Transfer Engine (Hard)",
      "Design Virtual Account Auto-Collect Reconciliation Engine (Medium)",
      "Subarray Sum Equals K (Medium)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Cashfree products: Payouts (bulk salary/vendor disbursals), Payment Gateway, Auto-Collect (virtual bank accounts), and Verification Suite.",
      "Write clean, modular OOP code with unit test cases during Machine Coding.",
      "Emphasize transactional integrity, idempotency, and automated bank reconciliation."
    ],
    "systemDesignArchetypes": [
      "Design Cashfree Bulk Payout Engine with Instant Bank Routing",
      "Design Virtual Account Ingestion & Auto-Reconciliation System",
      "Design High-Throughput Merchant Payment Gateway"
    ],
    "culturalValues": [
      "Ownership and Agility in Fintech Infrastructure",
      "Relentless Focus on Merchant Success and Reliability",
      "Engineering Excellence and High Integrity"
    ],
    "communityInsights": [
      {
        "title": "Bulk Payouts Focus",
        "detail": "Cashfree interviewers frequently ask how to process 50,000 vendor payouts in parallel while handling bank rate limits and timeouts."
      },
      {
        "title": "Virtual Account Mechanics",
        "detail": "Be ready to explain how dynamic virtual accounts map customer deposits to merchants automatically."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Payout Modeling",
          "target": "Build bulk payout processors, virtual account routers, and rate limiters in IDE.",
          "topics": [
            "Machine Coding Structure",
            "Strategy Pattern for Payouts",
            "Clean Repositories",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and hash lookups.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Concurrency & Idempotent Financial Transfers",
          "target": "Master thread-safe payout queues, idempotency filters, and distributed locks.",
          "topics": [
            "Thread-Safe Payout Queue",
            "Idempotency Key Middleware",
            "Distributed Locks",
            "Atomic CAS Operations"
          ],
          "deliverable": "Implement an idempotent bulk payout simulator."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Payout & Fintech System Design",
          "target": "Design Cashfree bulk payout engine, virtual account reconciliation, and payment gateways.",
          "topics": [
            "Design Cashfree Bulk Payout Engine",
            "Design Virtual Account Auto-Collect",
            "Design Payment Gateway"
          ],
          "deliverable": "Draft 3 complete payment system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Cashfree Culture & Live Mock Loop",
          "target": "Rehearse merchant empathy, dealing with bank downtimes, and full mock interview loops.",
          "topics": [
            "Cashfree Values Framework",
            "Handling Bank Network Outages",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Cashfree Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Bulk Payout Parallelism",
          "detail": "Use partitioned worker pools with token bucket rate limiters per downstream banking partner."
        },
        {
          "title": "Idempotent Disbursals",
          "detail": "Enforce database unique constraints on payout reference IDs to prevent duplicate money transfers."
        },
        {
          "title": "Machine Coding Modularity",
          "detail": "Write clean, decoupled classes with clear interfaces and 100% test coverage."
        }
      ]
    }
  },
  {
    "id": "policybazaar",
    "name": "PolicyBazaar",
    "category": "fintech",
    "region": "Gurugram, India",
    "hiringProcess": [
      "Round 01: Online Coding Assessment (2-3 DSA problems, 90 mins)",
      "Round 02: Technical Interview 1 — Data Structures & Problem Solving (60 mins)",
      "Round 03: Technical Interview 2 — Object Oriented Design & Concurrency (60 mins)",
      "Round 04: High-Level System Design (Insurance Quote Aggregation & Telephony Pipeline, 60 mins)",
      "Round 05: Engineering Leadership & Managerial Fit (60 mins)"
    ],
    "pyqTopics": [
      "Multi-Insurer Quote Aggregation Engine with Parallel Async Requests",
      "High-Volume Lead Distribution & Telephony Engine (IVR/WebRTC)",
      "Rule Engine for Policy Premium & Eligibility Calculation",
      "Distributed Caching (Redis) & Search Filtering",
      "Trees, Graphs & Dynamic Programming",
      "Microservices Architecture & Resilience"
    ],
    "interviewStyle": "Tests real-time aggregation patterns, multi-insurer async API integration, high-volume lead distribution, rule engines, and solid DSA fundamentals.",
    "sampleQuestions": [
      "Design Insurance Quote Comparison & Aggregation Engine (30+ Insurer APIs in parallel) (Hard)",
      "Design Real-Time In-Bound Telephony Lead Distribution Engine (Hard)",
      "Subarray Sum Equals K (Medium)",
      "Course Schedule II (Medium)",
      "LRU Cache with Custom In-Memory Storage (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand quote aggregation challenges: querying 30+ insurance APIs asynchronously, handling slow/failing insurer endpoints, and merging quotes under 3 seconds.",
      "Master parallel async programming: CompletableFuture (Java), async/await (Python/Node.js), circuit breakers, and thread pools.",
      "Write clean, modular code with clear time and space complexity explanations."
    ],
    "systemDesignArchetypes": [
      "Design PolicyBazaar Real-Time Insurance Quote Aggregator Engine",
      "Design High-Volume Telephony & Customer Lead Assignment System",
      "Design Insurance Policy Lifecycle & Renewal Notification Engine"
    ],
    "culturalValues": [
      "Customer First & Transparent Financial Protection",
      "Agility, Execution Speed and High Integrity",
      "Continuous Innovation in Indian InsurTech"
    ],
    "communityInsights": [
      {
        "title": "Quote Aggregator Fan-Out",
        "detail": "PolicyBazaar frequently asks how to query 30 insurance company APIs in parallel with a 3-second hard timeout and graceful degradation."
      },
      {
        "title": "Lead Distribution Mechanics",
        "detail": "Be ready to design a real-time lead assignment system based on advisor skill, availability, and conversion probability."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and custom caches.",
          "topics": [
            "LRU Cache",
            "Subarray Sum Equals K",
            "Two Sum",
            "Trapping Rain Water"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 2",
          "focus": "Async Parallelism & Thread Pools",
          "target": "Master CompletableFuture, async fan-out, and timeout handling.",
          "topics": [
            "Async API Aggregation Engine",
            "ExecutorService Sizing",
            "Circuit Breakers (Resilience4j)",
            "Timeout Fallbacks"
          ],
          "deliverable": "Build a simulated multi-API async quote aggregator."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Rule Engines",
          "target": "Master rule engine evaluations, knapsack variations, and DP.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "Word Break",
            "Insurance Rule Evaluator"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "InsurTech High-Scale System Design",
          "target": "Design quote comparison engines, lead distribution systems, and renewal pipelines.",
          "topics": [
            "Design Quote Aggregation Engine",
            "Design Telephony Lead Distributor",
            "Design Policy Renewal Pipeline"
          ],
          "deliverable": "Draft 3 complete InsurTech system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "PolicyBazaar Culture & Live Mock Loop",
          "target": "Rehearse customer transparency, handling third-party insurer outages, and full mock interview loops.",
          "topics": [
            "PolicyBazaar Values Framework",
            "Handling Insurer API Failures",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior PolicyBazaar Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Async Fan-Out Architecture",
          "detail": "Use CompletableFuture.allOf() with custom thread pools and 3-second timeouts for parallel quote aggregation."
        },
        {
          "title": "Circuit Breakers",
          "detail": "Open circuit breakers for failing insurer endpoints to protect overall search response latency."
        },
        {
          "title": "Lead Assignment Invariants",
          "detail": "Use Redis priority queues to route high-intent leads to available advisors in real time."
        }
      ]
    }
  },
  {
    "id": "dream11",
    "name": "Dream11",
    "category": "high-growth",
    "region": "Mumbai, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Problem Solving Round (90 mins in IDE)",
      "Round 02: Data Structures & Core Algorithms (60 mins DSA)",
      "Round 03: High-Level System Design (IPL Flash Traffic 10.5M+ Concurrent Users, Real-Time Leaderboards, 60 mins)",
      "Round 04: Engineering Leadership & Cultural Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Real-Time Live Leaderboard Engine (10.5M+ Concurrent Users, Redis Sorted Sets)",
      "Match Deadline Flash Concurrency (500K+ Team Creations/sec during Toss)",
      "Machine Coding LLD: Fantasy Contest & Team Validator",
      "Distributed Caching (Aerospike, Redis Cluster) & Kafka Event Ingestion",
      "High-Throughput Wallet Deduction & Contest Join Invariants",
      "Dynamic Programming & Graph Traversals"
    ],
    "interviewStyle": "Tests extreme flash traffic engineering (during IPL match toss time when 10.5M concurrent users join contests in 15 minutes), real-time leaderboards, clean Machine Coding in IDE, and high-concurrency wallet transactions.",
    "sampleQuestions": [
      "Design Real-Time Fantasy Leaderboard for 100M Users with Sub-Second Score Updates (Hard - Dream11 Signature)",
      "Design Flash Contest Joining Engine for 500K Requests/sec during IPL Match Toss (Hard)",
      "Machine Coding: Design Fantasy Sports Contest & Team Creation Engine (Hard)",
      "Subarray Sum Equals K (Medium)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Dream11 scale during IPL: 10.5M+ concurrent users, 500K+ requests/sec at match toss, and live point updates every ball.",
      "Master Real-Time Leaderboard architecture: Redis Sorted Sets (ZADD, ZREVRANK), chunked leaderboard sharding, and WebSockets.",
      "In Machine Coding, write clean, modular code with team validation rules (max 7 players per team, credit constraints)."
    ],
    "systemDesignArchetypes": [
      "Design Dream11 Real-Time Live Fantasy Leaderboard Engine (10.5M Concurrent)",
      "Design High-Throughput Contest Join & Wallet Deduction Pipeline",
      "Design Ball-by-Ball Score Calculation & Rank Broadcast Engine"
    ],
    "culturalValues": [
      "User First & Extreme Passion for Sports & Tech",
      "Data-Driven Decision Making & 100X Scale Thinking",
      "High Ownership and Fearless Innovation"
    ],
    "communityInsights": [
      {
        "title": "IPL Flash Traffic Signature",
        "detail": "Dream11 is legendary for its 15-minute IPL match toss flash traffic. You must design architectures that scale instantly from 0 to 500K RPS."
      },
      {
        "title": "Leaderboard Sharding",
        "detail": "Be ready to explain how to shard Redis sorted sets across thousands of contests without hitting memory or CPU limits."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & Fantasy Sports Modeling",
          "target": "Build fantasy team creation, credit validators, and contest joiners in IDE.",
          "topics": [
            "Machine Coding Structure",
            "Team Validation Rules",
            "In-Memory Repositories",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and hash lookups.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Concurrency & Real-Time Leaderboards",
          "target": "Master Redis Sorted Sets, atomic ranking updates, and WebSocket broadcasts.",
          "topics": [
            "Redis Sorted Sets (ZSet) Internals",
            "Chunked Leaderboard Sharding",
            "WebSocket Gateway Fan-Out",
            "Atomic Balance Locking"
          ],
          "deliverable": "Build a real-time leaderboard ranking simulator in code."
        },
        {
          "label": "Week 5",
          "focus": "High-Scale Fantasy Sports System Design",
          "target": "Design Dream11 live leaderboards, match toss contest joining, and ball-by-ball score engines.",
          "topics": [
            "Design Dream11 Real-Time Leaderboard",
            "Design Flash Contest Join Engine",
            "Design Live Score Engine"
          ],
          "deliverable": "Draft 3 complete high-scale sports gaming blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Dream11 Culture & Live Mock Loop",
          "target": "Rehearse 100X scale thinking, handling IPL flash traffic surges, and full mock interview loops.",
          "topics": [
            "Dream11 Values Framework",
            "Handling IPL Match Toss Surges",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Dream11 Architects."
        }
      ],
      "curatedPrep": [
        {
          "title": "Redis ZSet Leaderboards",
          "detail": "Use Redis ZADD / ZREVRANGE for sub-millisecond ranking queries; shard by contest_id."
        },
        {
          "title": "Flash Contest Ingestion",
          "detail": "Buffer contest join requests in Kafka and process asynchronous balance deductions to decouple API gateway from database."
        },
        {
          "title": "Machine Coding Validation",
          "detail": "Enforce team composition rules: 100 credit limit, 1-4 wicket keepers, 3-6 batsmen, 1-4 all-rounders, 3-6 bowlers."
        }
      ]
    }
  },
  {
    "id": "sharechat",
    "name": "ShareChat",
    "category": "high-growth",
    "region": "Bengaluru, India",
    "hiringProcess": [
      "Round 01: Online Coding Assessment on HackerEarth (2-3 DSA problems, 90 mins)",
      "Round 02: Technical Interview 1 — Data Structures & Problem Solving (60 mins)",
      "Round 03: Technical Interview 2 — Concurrency, Caching & Distributed Data (60 mins)",
      "Round 04: High-Level System Design (Vernacular Social Feed, Video Ingestion & Live Streaming, 60 mins)",
      "Round 05: Engineering Leadership & Cultural Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Vernacular Content Feed Ranking & Recommendation Pipeline",
      "Short Video Ingestion, Transcoding & CDN Delivery (Moj / ShareChat)",
      "Live Audio Chatroom Streaming (WebRTC / RTMP)",
      "Distributed Caching (Redis Cluster) & User Graph Sharding",
      "Trees, Graphs & Dynamic Programming",
      "Real-Time Content Moderation & AI Tagging"
    ],
    "interviewStyle": "Tests high-throughput social media feed generation, video/audio streaming, low-bandwidth mobile optimization, and solid DSA foundations.",
    "sampleQuestions": [
      "Design Vernacular Social Feed with Multi-Language AI Recommendations (Hard)",
      "Design Short Video Ingestion & Transcoding Pipeline for 50M Active Users (Hard)",
      "Design Live Audio Chatroom Streaming Service (ShareChat Audio Spaces) (Hard)",
      "Subarray Sum Equals K (Medium)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand ShareChat scale: 15+ Indian languages, millions of vernacular users, video upload/streaming infrastructure (Moj), and live audio chatrooms.",
      "Master feed architecture: fanout-on-write vs fanout-on-read, content moderation pipelines, and Redis caching.",
      "Write clean, modular code with clear time and space complexity explanations."
    ],
    "systemDesignArchetypes": [
      "Design ShareChat Personalized Vernacular Social Feed",
      "Design Short Video Upload, Transcoding & CDN Delivery Pipeline",
      "Design Real-Time Live Audio Chatroom Infrastructure"
    ],
    "culturalValues": [
      "User First for Bharat & Vernacular Focus",
      "High Ownership, Speed and Innovation",
      "Continuous Learning & Technical Excellence"
    ],
    "communityInsights": [
      {
        "title": "Vernacular Feed Ranking",
        "detail": "ShareChat frequently asks how to generate personalized feeds across 15+ languages with low-latency Redis caching."
      },
      {
        "title": "Video & Audio Streaming",
        "detail": "Be ready to explain video chunk transcoding pipelines and real-time audio chatroom synchronization."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and custom cache implementations.",
          "topics": [
            "LRU Cache",
            "Subarray Sum Equals K",
            "Two Sum",
            "Trapping Rain Water"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 2",
          "focus": "Feed Generation & Caching Architecture",
          "target": "Master fanout queues, feed ranking, and Redis caching layers.",
          "topics": [
            "Fanout on Write vs Read",
            "Redis Feed Caching",
            "Feed Pagination & Ranking",
            "Kafka Ingestion"
          ],
          "deliverable": "Build a simulated feed ranking and fanout service."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Media Processing",
          "target": "Master sequence matching, knapsack variations, and video chunking DP.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "Word Break",
            "Video Chunk Transcoding"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "Social & Media High-Scale System Design",
          "target": "Design vernacular feeds, short video transcoding pipelines, and live audio chatrooms.",
          "topics": [
            "Design ShareChat Vernacular Feed",
            "Design Short Video Pipeline",
            "Design Live Audio Chatroom"
          ],
          "deliverable": "Draft 3 complete social media system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "ShareChat Culture & Live Mock Loop",
          "target": "Rehearse vernacular user empathy, dealing with media outages, and full mock interview loops.",
          "topics": [
            "ShareChat Values Framework",
            "Handling Viral Content Surges",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior ShareChat Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Hybrid Feed Fanout",
          "detail": "Use fanout-on-write for normal creators and fanout-on-read for celebrity accounts with millions of followers."
        },
        {
          "title": "Video Chunk Transcoding",
          "detail": "Split uploaded videos into 5-second chunks and process parallel transcoding into multiple resolutions."
        },
        {
          "title": "Low Bandwidth Optimization",
          "detail": "Optimize feed thumbnails with WebP compression and adaptive bitrate video playback."
        }
      ]
    }
  },
  {
    "id": "nykaa",
    "name": "Nykaa",
    "category": "high-growth",
    "region": "Mumbai / Gurugram, India",
    "hiringProcess": [
      "Round 01: Machine Coding / Problem Solving Round (90 mins in IDE)",
      "Round 02: Data Structures & Core Algorithms (60 mins DSA)",
      "Round 03: High-Level System Design (Omnichannel Beauty E-Commerce & Flash Sales, 60 mins)",
      "Round 04: Engineering Manager / Culture & Product Fit (60 mins)"
    ],
    "pyqTopics": [
      "Omnichannel Inventory Management (Online + 150+ Offline Stores)",
      "Flash Sale & Beauty Fest High-Concurrency Ordering",
      "Machine Coding LLD: Cart, Discount & Coupon Rules Engine",
      "Distributed Caching (Redis) & Catalog Search",
      "Trees, Graphs & Dynamic Programming",
      "Order Fulfillment & Last-Mile Delivery Pipelines"
    ],
    "interviewStyle": "Tests clean Machine Coding in Round 1, strong DSA foundations, and omnichannel e-commerce system design (syncing online orders with physical offline retail inventory).",
    "sampleQuestions": [
      "Machine Coding: Design E-Commerce Cart with Complex Coupon & Buy-X-Get-Y Discount Engine (Hard)",
      "Design Nykaa Omnichannel Inventory Sync Engine across 150+ Retail Stores & Online Warehouses (Hard)",
      "Design Nykaa Pink Friday Sale Flash Order Placement Engine (Hard)",
      "Subarray Sum Equals K (Medium)",
      "Course Schedule II (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Nykaa omnichannel model: unified inventory across e-commerce warehouses and 150+ physical stores (Nykaa Luxe, Nykaa On Trend).",
      "In Machine Coding, write clean, modular OOP code with rules engines for coupons and discounts.",
      "Emphasize zero overselling, accurate stock reservation, and low-latency catalog search."
    ],
    "systemDesignArchetypes": [
      "Design Nykaa Omnichannel Real-Time Inventory Sync Engine",
      "Design Pink Friday High-Concurrency Flash Sale Order Pipeline",
      "Design Personalized Beauty Recommendation & Shade Finder Engine"
    ],
    "culturalValues": [
      "Customer Delight & Curated Beauty Discovery",
      "Excellence in Execution & High Agility",
      "Ownership and Sustainable Growth"
    ],
    "communityInsights": [
      {
        "title": "Omnichannel Inventory Sync",
        "detail": "Nykaa frequently asks how to prevent selling a physical lipstick in an offline store if an online customer just reserved it in their cart."
      },
      {
        "title": "Machine Coding Coupons",
        "detail": "Be ready to code a flexible coupon engine supporting percentage, flat, and Buy-X-Get-Y rules using Strategy pattern."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Machine Coding & E-Commerce Cart Modeling",
          "target": "Build cart services, coupon engines, and inventory reservations in IDE.",
          "topics": [
            "Machine Coding Structure",
            "Strategy Pattern for Discounts",
            "Clean Repositories",
            "Unit Testing"
          ],
          "deliverable": "Complete 4 timed machine coding projects in IDE."
        },
        {
          "label": "Week 2",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and hash lookups.",
          "topics": [
            "Subarray Sum Equals K",
            "Trapping Rain Water",
            "LRU Cache",
            "Two Sum"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Inventory Locks",
          "target": "Master knapsack variations, sequence matching, and distributed locking.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "Word Break",
            "Redis Distributed Locks"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "Omnichannel E-Commerce System Design",
          "target": "Design Nykaa omnichannel inventory sync, Pink Friday flash sales, and catalog search.",
          "topics": [
            "Design Omnichannel Inventory Sync",
            "Design Pink Friday Flash Sale",
            "Design Beauty Recommendation Engine"
          ],
          "deliverable": "Draft 3 complete e-commerce system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Nykaa Culture & Live Mock Loop",
          "target": "Rehearse customer delight, dealing with festival traffic spikes, and full mock interview loops.",
          "topics": [
            "Nykaa Values Framework",
            "Handling Retail & Online Inventory Contention",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Nykaa Engineers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Omnichannel Invariants",
          "detail": "Use distributed 2-phase locks between POS store systems and online inventory databases to prevent double allocation."
        },
        {
          "title": "Machine Coding Discounts",
          "detail": "Use Strategy & Decorator patterns to chain multiple promotional discounts on shopping carts."
        },
        {
          "title": "Flash Sale Resiliency",
          "detail": "Implement queue-based asynchronous order ingestion with circuit breakers."
        }
      ]
    }
  },
  {
    "id": "zoho",
    "name": "Zoho",
    "category": "enterprise",
    "region": "Chennai / Tenkasi, India / Global",
    "hiringProcess": [
      "Round 01: Basic Programming & Syntax Evaluation (C / C++ / Java, 10-15 coding snippets, 90 mins)",
      "Round 02: Advanced Programming Round / Problem Solving (Complex logic, recursion, matrix/string manipulation without library functions, 120 mins)",
      "Round 03: Low-Level Design / System Design Round (OOP Modeling, CLI Applications, 90 mins)",
      "Round 04: Technical Interview with Senior Lead (Deep CS fundamentals, Java memory, DB queries, 60 mins)",
      "Round 05: HR & Values Interview (Cultural alignment with Zoho bootstrapped philosophy, 45 mins)"
    ],
    "pyqTopics": [
      "Pure String & Matrix Manipulations without Built-in Library Functions",
      "Recursion, Backtracking & Pattern Printing",
      "Low-Level Object Oriented Design (CLI Apps: Railway Reservation, Snake Game, Taxi Booking)",
      "Java Memory Management, Collections Internals & Custom Data Structures",
      "Database Schema Design, Normalization & SQL Queries",
      "Bootstrapped SaaS Suite Architecture"
    ],
    "interviewStyle": "Zoho's hiring process is unique: Round 1 & 2 test pure coding logic without using library helper functions (e.g. implementing string manipulation, pattern formatting, and recursion from scratch in C/Java). Round 3 tests building complete CLI applications (Railway Reservation, Taxi Booking).",
    "sampleQuestions": [
      "Round 2: Print Matrix in Spiral Order without extra space (Medium)",
      "Round 2: Look and Say Sequence / Pattern Printing (Medium)",
      "Round 3 LLD: Design Complete CLI Railway Reservation System with RAC & Waiting List (Hard - Zoho Signature)",
      "Round 3 LLD: Design Call Taxi Booking Application with Distance & Earnings Calculation (Hard - Zoho Signature)",
      "Round 3 LLD: Design Snake Game in Terminal (Medium)",
      "Round 2: Word Search in 2D Character Matrix (Medium)"
    ],
    "prepNotes": [
      "Practice coding in pure C/Java without using convenience libraries (e.g. no Arrays.sort(), no string helper functions — write your own algorithms).",
      "Master classic Zoho CLI LLD questions: Railway Reservation System (berths, RAC, waiting list, cancellation refunds), Taxi Booking System (taxi locations, minimum fare, shortest distance), and Snake Game.",
      "Understand Zoho's bootstrapped culture: high pride in indigenous software, long-term employee retention, and building software from first principles."
    ],
    "systemDesignArchetypes": [
      "Design CLI Railway Ticket Reservation System with RAC/Waiting List & Auto-Upgradation",
      "Design CLI Call Taxi Booking System with Multi-Vehicle Distance Routing & Accounting",
      "Design Multi-Tenant Zoho CRM Data Storage & Custom Field Engine"
    ],
    "culturalValues": [
      "First-Principles Engineering: Build everything in-house",
      "Bootstrapped Resilience & Long-Term Craftsmanship",
      "Humility, Rural Tech Development and Community Empowerment"
    ],
    "communityInsights": [
      {
        "title": "No Built-In Functions Rule",
        "detail": "Zoho interviewers frequently disallow built-in string/array functions. You must write your own strlen, strcpy, substring, and custom sorting algorithms."
      },
      {
        "title": "Railway & Taxi Booking Regulars",
        "detail": "The Railway Reservation and Taxi Booking CLI application problems have been asked continuously for over 10 years at Zoho."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Pure String & Matrix Manipulation (No Library Functions)",
          "target": "Implement string searching, pattern printing, matrix rotations, and conversions from scratch.",
          "topics": [
            "Custom String Functions from Scratch",
            "Spiral Matrix Printing",
            "Pattern Printing & Recursion",
            "In-Place Matrix Transformations"
          ],
          "deliverable": "Solve 25 classic Zoho Round 1 & 2 programming questions without built-in libraries."
        },
        {
          "label": "Week 2",
          "focus": "Zoho Signature LLD: Railway Reservation System",
          "target": "Implement complete CLI Railway Reservation System with Berths (Lower/Middle/Upper), RAC, Waiting List, and Cancellation.",
          "topics": [
            "Railway Reservation State Machine",
            "RAC to Confirmed Transition",
            "Waiting List Queue",
            "Ticket Cancellation & Refunds"
          ],
          "deliverable": "Build fully working CLI Railway Reservation System with interactive menu."
        },
        {
          "label": "Week 3",
          "focus": "Zoho Signature LLD: Taxi Booking & Snake Game",
          "target": "Implement Call Taxi Booking System with distance, earnings tracking, and Snake Game in terminal.",
          "topics": [
            "Taxi Allocation by Distance",
            "Earnings Calculation & Trip History",
            "Snake Game Movement & Collision",
            "Toll Gate Management"
          ],
          "deliverable": "Build fully working Call Taxi Booking System and Snake Game."
        },
        {
          "label": "Week 4",
          "focus": "Recursion, Backtracking & Custom Data Structures",
          "target": "Master Sudoku Solver, N-Queens, custom ArrayList/LinkedList implementation, and recursive permutations.",
          "topics": [
            "Sudoku Solver",
            "N-Queens",
            "Custom Doubly Linked List from Scratch",
            "Word Search 2D"
          ],
          "deliverable": "Solve 20 advanced recursion and backtracking problems."
        },
        {
          "label": "Week 5",
          "focus": "Database Schema Design & SaaS Architecture",
          "target": "Design normalized SQL schemas, custom fields for CRM, and multi-tenant database architectures.",
          "topics": [
            "Relational Schema Normalization",
            "Custom Dynamic Fields in SQL",
            "Design Zoho Mail Backend",
            "Design Zoho CRM Engine"
          ],
          "deliverable": "Draft 3 complete database schemas with complex SQL join queries."
        },
        {
          "label": "Week 6",
          "focus": "Zoho Culture & Live Mock Loop",
          "target": "Rehearse bootstrapped tech philosophy, first-principles reasoning, and full mock interview loops.",
          "topics": [
            "Zoho Bootstrapped Philosophy",
            "First-Principles In-House Software",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Zoho Technical Leads."
        }
      ],
      "curatedPrep": [
        {
          "title": "No Built-In Libraries",
          "detail": "Write all character parsing, conversions, and substring matching manually using primitive loops and pointers."
        },
        {
          "title": "Railway State Transitions",
          "detail": "When a confirmed ticket cancels, promote RAC 1 to Confirmed, and Waiting List 1 to RAC 1 automatically."
        },
        {
          "title": "Zoho Philosophy",
          "detail": "Emphasize passion for fundamental software craftsmanship rather than chasing trendy frameworks."
        }
      ]
    }
  },
  {
    "id": "freshworks",
    "name": "Freshworks",
    "category": "enterprise",
    "region": "San Mateo, CA / Chennai, India / Global",
    "hiringProcess": [
      "Round 01: Online Coding Assessment on HackerEarth (2-3 DSA problems, 90 mins)",
      "Round 02: Technical Interview 1 — Problem Solving & Data Structures (60 mins)",
      "Round 03: Technical Interview 2 — Low-Level Design & Object Oriented Modeling (60 mins)",
      "Round 04: High-Level System Design (Multi-Tenant SaaS CRM / Freshdesk Ticketing, 60 mins)",
      "Round 05: Engineering Leadership & Cultural Calibration (60 mins)"
    ],
    "pyqTopics": [
      "Multi-Tenant Customer Engagement Platform (Freshdesk / Freshsales)",
      "Real-Time Ticket Routing & SLA Escalation Engine",
      "Low-Level Object Oriented Design (SOLID, Extensible Plugins)",
      "Distributed Caching (Redis) & High-Throughput Webhook Ingestion",
      "Trees, Graphs & Dynamic Programming",
      "Elasticsearch Multi-Tenant Indexing & Search"
    ],
    "interviewStyle": "Emphasizes clean object-oriented design, multi-tenant SaaS architecture (Freshdesk, Freshsales), SLA escalation state machines, and strong DSA fundamentals.",
    "sampleQuestions": [
      "Design Multi-Tenant Customer Support Ticketing Engine with Dynamic SLA Escalation (Hard)",
      "Design In-Memory File System with Role-Based Access Control (Medium)",
      "Design Distributed Rate Limiter with Per-Tenant Quotas (Medium)",
      "Course Schedule II (Medium)",
      "Subarray Sum Equals K (Medium)",
      "Trapping Rain Water (Hard)"
    ],
    "prepNotes": [
      "Understand Freshworks core SaaS platform: multi-tenancy, dynamic custom fields, SLA escalation workers, and omni-channel customer ticket routing (email, chat, social).",
      "In LLD rounds, write clean, maintainable code with design patterns (Observer, Strategy, Factory).",
      "Demonstrate understanding of Elasticsearch multi-tenant indexing and background job queues (Sidekiq/Kafka)."
    ],
    "systemDesignArchetypes": [
      "Design Freshdesk Multi-Tenant Customer Support & Ticket Routing Engine",
      "Design Real-Time SLA Escalation & On-Call Alerting Worker Pipeline",
      "Design Omni-Channel Customer Conversation Streaming Gateway"
    ],
    "culturalValues": [
      "Craftsmanship, Customer Delight & Global SaaS Scale",
      "Inclusivity, Collaboration and High Agility",
      "Empowering Businesses of All Sizes"
    ],
    "communityInsights": [
      {
        "title": "SLA Escalation Engine",
        "detail": "Freshworks frequently asks how to model and execute ticket SLA timers that alert managers when support responses are delayed."
      },
      {
        "title": "Clean OOP Design",
        "detail": "Expect deep questions on clean design patterns, separation of concerns, and dependency injection in LLD rounds."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Hash Tables",
          "target": "Master two pointers, sliding windows, and custom caches.",
          "topics": [
            "LRU Cache",
            "Subarray Sum Equals K",
            "Two Sum",
            "Trapping Rain Water"
          ],
          "deliverable": "Solve 25 array and hashing problems."
        },
        {
          "label": "Week 2",
          "focus": "Low-Level Design & SaaS Modeling",
          "target": "Build ticket routing engines, multi-tenant rate limiters, and SLA timers in your IDE.",
          "topics": [
            "Design Support Ticketing Engine",
            "Design Multi-Tenant Rate Limiter",
            "Observer Pattern for SLA Escalation",
            "Unit Testing"
          ],
          "deliverable": "Implement 3 complete OOP designs with comprehensive unit tests."
        },
        {
          "label": "Week 3",
          "focus": "Graphs, Trees & Pathfinding",
          "target": "Master DAG dependency resolution, LCA, and shortest routes.",
          "topics": [
            "Course Schedule II",
            "Lowest Common Ancestor",
            "Alien Dictionary",
            "Word Ladder"
          ],
          "deliverable": "Solve 20 graph and tree problems."
        },
        {
          "label": "Week 4",
          "focus": "Dynamic Programming & Caching",
          "target": "Master 1D/2D DP, knapsack variations, and Redis caching.",
          "topics": [
            "Coin Change",
            "Edit Distance",
            "Word Break",
            "Redis Multi-Tenant Caching"
          ],
          "deliverable": "Solve 20 DP problems."
        },
        {
          "label": "Week 5",
          "focus": "Multi-Tenant SaaS System Design",
          "target": "Design Freshdesk ticketing platform, SLA escalation workers, and Elasticsearch search.",
          "topics": [
            "Design Freshdesk Ticketing Engine",
            "Design SLA Escalation Pipeline",
            "Design Multi-Tenant Elasticsearch Search"
          ],
          "deliverable": "Draft 3 complete SaaS system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Freshworks Culture & Live Mock Loop",
          "target": "Rehearse customer delight, SaaS scalability, and full mock interview loops.",
          "topics": [
            "Freshworks Values Framework",
            "Handling SaaS Tenant Resource Contention",
            "Full Loop Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Freshworks Architects."
        }
      ],
      "curatedPrep": [
        {
          "title": "Multi-Tenant Isolation",
          "detail": "Prefix tenant IDs in cache keys and database queries to ensure strict data separation."
        },
        {
          "title": "SLA Timer Architecture",
          "detail": "Use distributed delay queues (RabbitMQ / Redis Sorted Sets) to schedule and trigger SLA breach alerts."
        },
        {
          "title": "Clean OOP Interfaces",
          "detail": "Design modular, testable service classes with clean dependency injection."
        }
      ]
    }
  },
  {
    "id": "tcs",
    "name": "TCS (Tata Consultancy Services)",
    "category": "service-based",
    "region": "Mumbai, India / Global (Ninja / Digital / Prime / Innovator Tracks)",
    "hiringProcess": [
      "Round 01: TCS NQT (National Qualifier Test) — Numerical, Verbal, Reasoning & Foundational Coding (120 mins)",
      "Round 02: Advanced Coding Assessment (TCS Digital / Prime / Innovator / HackQuest / CodeVita — 2-3 complex DSA problems, 90 mins)",
      "Round 03: Technical Interview (Core CS fundamentals: Java/C++, OOP, DBMS, OS, Computer Networks & Live Coding, 45-60 mins)",
      "Round 04: Managerial & HR Round (Behavioral, Project discussion, relocation willingness & Tata Values, 30 mins)"
    ],
    "pyqTopics": [
      "Arrays, Matrix Rotations & Mathematical Logic",
      "Core Java / C++ Memory, Pointers & OOP Concepts",
      "SQL Queries, Joins, Normalization & ACID Properties",
      "Dynamic Programming & Greedy Optimization (Digital / Prime / CodeVita)",
      "Operating Systems (Process vs Thread, Deadlocks, Paging, Virtual Memory)",
      "Computer Networks (OSI 7 Layers, TCP vs UDP, HTTP/HTTPS, DNS)"
    ],
    "interviewStyle": "Structured evaluation across technical tiers (Ninja for standard entry, Digital for product-track, Prime & Innovator for elite problem solvers). Emphasizes core CS fundamentals (OOP, DBMS, OS, Networks), clear problem-solving logic, and Tata leadership values.",
    "sampleQuestions": [
      "Prime / Innovator Track: Trapping Rain Water (Hard)",
      "Digital Track: Find Subarray with Given Sum / Subarray Sum Equals K (Medium)",
      "Ninja Track: Matrix Diagonal Sum & Spiral Printing (Easy/Medium)",
      "CodeVita: Minimum Coin Change / Knapsack Optimization (Medium)",
      "SQL: Find Second Highest Salary in Employee Table with Joins (Medium)",
      "Core CS: Explain Process Synchronization, Semaphores & Deadlock Invariants (Medium)"
    ],
    "prepNotes": [
      "For Ninja Track: Master foundational aptitude, basic C/Java syntax, array manipulation, and SQL queries.",
      "For Digital / Prime Track (Higher Package): Master DP, Graph BFS/DFS, Trees, and write clean, optimized code on HackQuest/CodeVita platforms.",
      "Know your final year engineering projects thoroughly; interviewers probe project architecture, database schemas, and your individual contribution."
    ],
    "systemDesignArchetypes": [
      "Design Scalable Banking Core Ledger & Transaction Reconciliation Engine",
      "Design Multi-Tenant Enterprise Employee Attendance & Payroll System",
      "Design Global Airline Ticket Reservation & Baggage Tracking System"
    ],
    "culturalValues": [
      "Tata Values: Integrity, Responsibility, Excellence, Pioneering & Unity",
      "Customer Commitment & Long-Term Enterprise Partnership",
      "Lifelong Learning, Adaptability & Professional Ethics"
    ],
    "communityInsights": [
      {
        "title": "TCS Digital / Prime Upgradation",
        "detail": "Candidates scoring in the top percentile on TCS NQT or CodeVita get direct invites to the TCS Digital/Prime interview loop offering 2x-3x higher compensation packages."
      },
      {
        "title": "Core CS Questions are Essential",
        "detail": "Expect standard CS fundamental questions: 4 Pillars of OOP, Normal Forms (1NF to BCNF), Primary vs Foreign Keys, and TCP 3-Way Handshake."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Aptitude & Foundational Arrays/Strings (NQT Ninja)",
          "target": "Master NQT aptitude, array conversions, string reversals, and basic number theory.",
          "topics": [
            "Array Rotations & Second Largest",
            "String Palindrome & Anagrams",
            "Prime Sieve & GCD",
            "Basic Pattern Printing"
          ],
          "deliverable": "Solve 30 foundational TCS NQT coding snippets."
        },
        {
          "label": "Week 2",
          "focus": "Core CS Fundamentals: OOP, DBMS & SQL",
          "target": "Master Polymorphism, Inheritance, Encapsulation, SQL Joins, Indexing, and ACID transactions.",
          "topics": [
            "4 Pillars of OOP in Java/C++",
            "SQL Complex Joins & Subqueries",
            "Database Normalization (1NF to 3NF)",
            "ACID Properties"
          ],
          "deliverable": "Write and execute 20 complex SQL queries."
        },
        {
          "label": "Week 3",
          "focus": "Operating Systems & Computer Networks",
          "target": "Master process scheduling, deadlocks, virtual memory, OSI layers, and TCP/IP.",
          "topics": [
            "Process vs Thread & Context Switching",
            "Deadlock 4 Coffman Conditions",
            "OSI 7 Layers & TCP 3-Way Handshake",
            "HTTP vs HTTPS & DNS"
          ],
          "deliverable": "Complete comprehensive CS fundamentals flashcard review."
        },
        {
          "label": "Week 4",
          "focus": "Digital & Prime Track: Dynamic Programming & Greedy",
          "target": "Master Digital/Prime coding: 0/1 Knapsack, Coin Change, LIS, and Greedy interval scheduling.",
          "topics": [
            "Coin Change",
            "Longest Increasing Subsequence",
            "Subarray Sum Equals K",
            "Trapping Rain Water"
          ],
          "deliverable": "Solve 20 TCS Digital / Prime level coding challenges."
        },
        {
          "label": "Week 5",
          "focus": "Digital & Prime Track: Graphs, Trees & LLD",
          "target": "Master Binary Tree traversals, LCA, BFS/DFS, and basic object-oriented design.",
          "topics": [
            "Lowest Common Ancestor",
            "Binary Tree Level Order",
            "Course Schedule II",
            "Design Library Management System"
          ],
          "deliverable": "Solve 20 tree/graph questions with clean code."
        },
        {
          "label": "Week 6",
          "focus": "Project Deep-Dive, Tata Values & HR Simulation",
          "target": "Prepare project architecture explanations, Tata cultural values, and HR behavioral questions.",
          "topics": [
            "Final Year Project Architecture",
            "Tata Group Ethical Principles",
            "HR Mock Interview"
          ],
          "deliverable": "Pass 3 comprehensive mock interviews with Senior Technical Interviewers."
        }
      ],
      "curatedPrep": [
        {
          "title": "Project Explanations",
          "detail": "Be ready to draw your project's database schema, technology stack choices, and explain your individual module code."
        },
        {
          "title": "SQL Mastery",
          "detail": "Master queries with GROUP BY, HAVING, INNER/LEFT/RIGHT JOINs, and window functions like DENSE_RANK()."
        },
        {
          "title": "Tata Values Alignment",
          "detail": "Demonstrate high integrity, strong team collaboration, and willingness to continuously learn new technologies."
        }
      ]
    }
  },
  {
    "id": "infosys",
    "name": "Infosys",
    "category": "service-based",
    "region": "Bengaluru, India / Global (Specialist Programmer / Power Programmer / DSE / SE Tracks)",
    "hiringProcess": [
      "Round 01: Infosys Online Test / InfyTQ / HackWithInfy (Aptitude + Technical + Advanced Coding, 100-180 mins)",
      "Round 02: Advanced Coding Hackathon (For Specialist Programmer / Power Programmer roles — 3 hard DSA/Graph/DP problems, 180 mins)",
      "Round 03: Technical Interview (DSA Problem Solving, Java/Python, DBMS, OS, Networks, Project deep dive, 45-60 mins)",
      "Round 04: HR & Behavioral Interview (Communication, Learning agility & Cultural alignment, 30 mins)"
    ],
    "pyqTopics": [
      "Specialist Programmer (SP): Dynamic Programming, Graph Shortest Paths & Segment Trees",
      "InfyTQ / HackWithInfy Algorithmic Problem Solving",
      "Core Java / Python OOP Concepts, Collections & Exception Handling",
      "SQL Queries, Joins, Triggers & Stored Procedures",
      "Operating Systems (Paging, Semaphores, Multithreading)",
      "Full Stack Web Fundamentals (REST APIs, Microservices, Spring Boot)"
    ],
    "interviewStyle": "Rigorous tiered evaluation: HackWithInfy and InfyTQ offer fast-track access to elite Specialist Programmer (SP / Power Programmer) roles. Evaluates algorithmic problem-solving speed, clean Java/Python code, database mastery, and project architecture.",
    "sampleQuestions": [
      "Specialist Programmer: Segment Tree / Fenwick Tree Range Sum Queries (Hard)",
      "HackWithInfy: Dynamic Programming on Trees / Subtree Maximum Weight (Hard)",
      "DSE Track: Alien Dictionary / Topological Sort (Medium/Hard)",
      "SE Track: Longest Substring Without Repeating Characters (Medium)",
      "SQL: Write query to find all employees with higher salary than their managers (Medium)",
      "Core CS: Explain Java Garbage Collection algorithms and Memory Leaks (Medium)"
    ],
    "prepNotes": [
      "To target the Specialist Programmer (SP) package (9.5+ LPA), master advanced DP, Graph algorithms, Trie, and Segment Trees through HackWithInfy.",
      "For Systems Engineer / DSE roles: Focus on clean Java/Python OOP, Collections framework, SQL queries, and core CS fundamentals.",
      "Be prepared to code live on screen and explain step-by-step logic and time complexity."
    ],
    "systemDesignArchetypes": [
      "Design Global Core Banking Transformation Platform (Finacle Architecture)",
      "Design Enterprise Cloud Migration & Microservices Gateway",
      "Design Real-Time Supply Chain Inventory Tracking Platform"
    ],
    "culturalValues": [
      "C-LIFE: Customer Delight, Leadership by Example, Integrity & Transparency, Fairness, Pursuit of Excellence",
      "Learnability: The ability to learn and adapt continuously",
      "Pioneering Digital Transformation across Global Enterprises"
    ],
    "communityInsights": [
      {
        "title": "HackWithInfy & InfyTQ Advantage",
        "detail": "Participating in HackWithInfy is the fastest route to skip the generic aptitude test and land a direct Specialist Programmer (SP) interview."
      },
      {
        "title": "Java Collections Deep-Dive",
        "detail": "Infosys interviewers frequently ask how HashMap handles collisions, ArrayList vs LinkedList memory overhead, and equals/hashCode contracts."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & InfyTQ Foundational DSA",
          "target": "Master two pointers, sliding windows, string parsing, and frequency counting.",
          "topics": [
            "Longest Substring Without Repeating Characters",
            "Two Sum",
            "Subarray Sum Equals K",
            "Valid Parentheses"
          ],
          "deliverable": "Solve 25 classic Infosys interview coding problems."
        },
        {
          "label": "Week 2",
          "focus": "Core Java / Python & Collections Framework",
          "target": "Master HashMap internals, equals/hashCode, custom comparators, and exception hierarchies.",
          "topics": [
            "Java HashMap Internals & Bucketing",
            "Comparable vs Comparator",
            "Custom LinkedList Implementation",
            "Exception Handling"
          ],
          "deliverable": "Implement custom HashMap and LinkedList in code."
        },
        {
          "label": "Week 3",
          "focus": "DBMS, SQL & Operating Systems",
          "target": "Master complex SQL joins, indexing, normalization, process scheduling, and deadlocks.",
          "topics": [
            "Complex SQL Joins & Subqueries",
            "Indexing & Query Execution Plan",
            "Process vs Thread & Paging",
            "Deadlock Avoidance"
          ],
          "deliverable": "Write and test 25 SQL queries on real database schemas."
        },
        {
          "label": "Week 4",
          "focus": "HackWithInfy & Specialist Programmer: Advanced DP",
          "target": "Master 1D/2D DP, subset partition, knapsack variations, and DP on grids.",
          "topics": [
            "0/1 Knapsack",
            "Coin Change",
            "Edit Distance",
            "Longest Increasing Subsequence"
          ],
          "deliverable": "Solve 20 HackWithInfy-level dynamic programming challenges."
        },
        {
          "label": "Week 5",
          "focus": "HackWithInfy & SP Track: Graphs, Trees & Tries",
          "target": "Master Dijkstra, Topological Sort, LCA, and Prefix Tries.",
          "topics": [
            "Course Schedule II",
            "Alien Dictionary",
            "Lowest Common Ancestor",
            "Implement Trie"
          ],
          "deliverable": "Solve 20 advanced graph and tree problems."
        },
        {
          "label": "Week 6",
          "focus": "Project Deep-Dive, C-LIFE Values & HR Simulation",
          "target": "Rehearse project technical explanations, Infosys C-LIFE values, and HR behavioral questions.",
          "topics": [
            "Project Architecture & Code Review",
            "Infosys C-LIFE Values",
            "HR Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Infosys Technical Interviewers."
        }
      ],
      "curatedPrep": [
        {
          "title": "HashMap Internals",
          "detail": "Explain hashing function, bucket array, linked list to red-black tree conversion (Java 8 treeify threshold = 8)."
        },
        {
          "title": "HackWithInfy Strategies",
          "detail": "Focus on passing partial test cases in competitive programming rounds to maximize rank."
        },
        {
          "title": "Learnability Focus",
          "detail": "Demonstrate eagerness and proven track record of picking up new programming languages and cloud tools."
        }
      ]
    }
  },
  {
    "id": "wipro",
    "name": "Wipro",
    "category": "service-based",
    "region": "Bengaluru, India / Global (Elite / Turbo / Star Tracks)",
    "hiringProcess": [
      "Round 01: Wipro National Talent Hunt (NLTH) / Elite Online Assessment (Aptitude + English + Coding, 120 mins)",
      "Round 02: Wipro Turbo / Star Upgrade Coding Challenge (Advanced DSA, Graphs & DP for premium tracks, 90 mins)",
      "Round 03: Technical Interview (Core CS: OOP, Java/C++, SQL Queries, Data Structures & Project Review, 45 mins)",
      "Round 04: HR & Behavioral Round (Communication, Spirit of Wipro values, adaptability, 30 mins)"
    ],
    "pyqTopics": [
      "Array Manipulations, Matrix Traversals & String Parsing",
      "Object Oriented Programming (OOP) in Java / C++",
      "SQL Queries, Joins, Aggregations & Database Indexing",
      "Trees, Binary Search & Graph BFS/DFS (Turbo / Star Tracks)",
      "Operating Systems (Process Scheduling, Paging, Deadlocks)",
      "Computer Networks (OSI Model, TCP/IP, HTTP/HTTPS)"
    ],
    "interviewStyle": "Evaluates logical problem-solving ability, foundational coding in C++/Java, understanding of core computer science subjects (DBMS, OS, Networks), and commitment to the Spirit of Wipro cultural values.",
    "sampleQuestions": [
      "Turbo Track: Course Schedule II / Topological Sort (Medium)",
      "Elite Track: Subarray Sum Equals K (Medium)",
      "NLTH Track: Check if String is Palindrome / Anagram (Easy)",
      "NLTH Track: Matrix Spiral Traversal (Easy/Medium)",
      "SQL: Write SQL query to find department with highest average salary (Medium)",
      "Core CS: Difference between Abstract Class and Interface in Java (Medium)"
    ],
    "prepNotes": [
      "Master foundational coding: array operations, string manipulation, and standard search/sort algorithms.",
      "For Turbo & Star Tracks: Master Trees, Graph BFS/DFS, and Dynamic Programming.",
      "Be thoroughly prepared to explain every line of code in your resume projects."
    ],
    "systemDesignArchetypes": [
      "Design Enterprise Cloud Migration & Identity Management System",
      "Design Scalable Hospital Patient Record & Appointment Booking Engine",
      "Design Automated Warehouse Inventory & Delivery Tracking System"
    ],
    "culturalValues": [
      "Spirit of Wipro: Be passionate about clients' success, Treat each person with respect, Be global and responsible, Unyielding integrity",
      "Innovation, Continuous Learning and Empathy",
      "Commitment to Sustainability and Social Good"
    ],
    "communityInsights": [
      {
        "title": "Turbo & Star Upgrade",
        "detail": "Candidates selected in Elite NLTH can attempt the Turbo/Star coding challenge to double their compensation package before joining."
      },
      {
        "title": "Abstract Class vs Interface",
        "detail": "A classic Wipro question: explain when to use an abstract class vs an interface (especially with Java 8 default/static methods)."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Foundational NLTH Coding",
          "target": "Master array operations, string manipulation, pattern printing, and searching algorithms.",
          "topics": [
            "Array Reversal & Rotation",
            "String Palindrome & Anagrams",
            "Binary Search on Arrays",
            "Matrix Traversals"
          ],
          "deliverable": "Solve 25 foundational Wipro coding snippets."
        },
        {
          "label": "Week 2",
          "focus": "Core Java / C++ & OOP Concepts",
          "target": "Master Inheritance, Polymorphism, Encapsulation, Abstract Classes, Interfaces, and Exception Handling.",
          "topics": [
            "Abstract Class vs Interface",
            "Method Overloading vs Overriding",
            "Java Memory Stack vs Heap",
            "Exception Handling"
          ],
          "deliverable": "Complete comprehensive OOP implementation assignment in Java/C++."
        },
        {
          "label": "Week 3",
          "focus": "DBMS, SQL Queries & Operating Systems",
          "target": "Master SQL Joins, GROUP BY, HAVING, Normalization, Process scheduling, and Deadlocks.",
          "topics": [
            "SQL Joins & Group By",
            "Database Normalization (1NF to 3NF)",
            "Process Scheduling (FCFS, Round Robin)",
            "Deadlock Prevention"
          ],
          "deliverable": "Write and test 20 SQL queries."
        },
        {
          "label": "Week 4",
          "focus": "Turbo & Star Track: Trees & Binary Search",
          "target": "Master Binary Tree traversals, BST insertions, LCA, and Binary Search on complex predicates.",
          "topics": [
            "Lowest Common Ancestor",
            "Binary Tree Inorder/Preorder/Level Order",
            "Validate BST",
            "Search in Rotated Sorted Array"
          ],
          "deliverable": "Solve 20 Wipro Turbo level tree and search problems."
        },
        {
          "label": "Week 5",
          "focus": "Turbo & Star Track: Graphs, DP & Greedy",
          "target": "Master BFS/DFS on grids, Topological sort, and classic DP problems.",
          "topics": [
            "Course Schedule II",
            "Number of Islands",
            "Coin Change",
            "Longest Increasing Subsequence"
          ],
          "deliverable": "Solve 20 graph and dynamic programming challenges."
        },
        {
          "label": "Week 6",
          "focus": "Project Defense, Spirit of Wipro & HR Simulation",
          "target": "Prepare project deep-dives, Spirit of Wipro cultural values, and HR behavioral questions.",
          "topics": [
            "Final Year Project Explanation",
            "Spirit of Wipro Values",
            "HR Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Wipro Interviewers."
        }
      ],
      "curatedPrep": [
        {
          "title": "OOP Real-World Examples",
          "detail": "Always explain OOP concepts using real-world analogies (e.g. Vehicle hierarchy for inheritance, Payment gateway for polymorphism)."
        },
        {
          "title": "SQL Subqueries",
          "detail": "Master correlated subqueries, aggregate functions (COUNT, SUM, AVG), and duplicate row removal."
        },
        {
          "title": "Spirit of Wipro",
          "detail": "Demonstrate unyielding integrity and client-first passion in behavioral scenarios."
        }
      ]
    }
  },
  {
    "id": "hcl",
    "name": "HCL Technologies",
    "category": "service-based",
    "region": "Noida, India / Global",
    "hiringProcess": [
      "Round 01: HCL First Careers / Campus Assessment (Aptitude, Logical Reasoning & Foundational Coding, 90 mins)",
      "Round 02: Technical Interview 1 — Programming, Data Structures & Core CS Fundamentals (45-60 mins)",
      "Round 03: Technical Interview 2 / Product Engineering Round (C++/Java/Cloud/Networking specialization, 45 mins)",
      "Round 04: HR & Leadership Values Interview (30 mins)"
    ],
    "pyqTopics": [
      "Product Engineering & Systems Programming (C / C++ / Java / Python)",
      "Arrays, Linked Lists, Stacks & Queues",
      "SQL Queries, Joins, Triggers & Database Schema Design",
      "Operating Systems (Threads, Memory Management, Linux Commands)",
      "Cloud Infrastructure & Networking Fundamentals",
      "Trees & Basic Dynamic Programming"
    ],
    "interviewStyle": "Emphasizes product engineering foundations, C/C++/Java language fundamentals, database queries, operating system internals (Linux shell commands, process memory), and client empathy.",
    "sampleQuestions": [
      "Reverse a Linked List in Groups of Size K (Medium)",
      "Find Missing Number in Array / Duplicate in O(N) time and O(1) space (Easy/Medium)",
      "Two Sum / Subarray Sum Equals K (Medium)",
      "SQL: Query to find duplicate records and delete them (Medium)",
      "Core CS: Explain Linux memory management, Paging, and Top 10 Shell Commands (Medium)",
      "Core CS: Difference between Synchronous and Asynchronous programming (Medium)"
    ],
    "prepNotes": [
      "Brush up on basic Linux shell commands (grep, find, sed, awk, chmod, ps, top) frequently tested for HCL engineering roles.",
      "Master foundational data structures: Arrays, Linked Lists, Stacks, Queues, and Binary Trees.",
      "Be prepared to discuss your engineering projects with emphasis on problem statement, tech stack, and testing methodology."
    ],
    "systemDesignArchetypes": [
      "Design Product Lifecycle Management (PLM) Digital Tracking Engine",
      "Design Hybrid Cloud Enterprise Infrastructure Monitoring Dashboard",
      "Design Automotive IoT Telematics Data Ingestion Gateway"
    ],
    "culturalValues": [
      "Ideapreneurship: Grassroots innovation by employees",
      "Relationship Beyond the Contract & Trust",
      "Excellence, Continuous Learning and Inclusivity"
    ],
    "communityInsights": [
      {
        "title": "Ideapreneurship Culture",
        "detail": "HCL takes pride in its 'Ideapreneurship' ethos where engineers propose innovative business solutions directly to clients."
      },
      {
        "title": "Linux & Systems Knowledge",
        "detail": "Expect questions on Linux command line tools, file permissions, and process management."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Linked Lists",
          "target": "Master two pointers, linked list reversals, and string manipulation.",
          "topics": [
            "Reverse Linked List",
            "Merge Two Sorted Lists",
            "Find Duplicate Number",
            "Valid Anagram"
          ],
          "deliverable": "Solve 25 foundational array and linked list problems."
        },
        {
          "label": "Week 2",
          "focus": "Stacks, Queues & Core OOP",
          "target": "Master stack applications (Valid Parentheses, Next Greater Element) and OOP principles.",
          "topics": [
            "Valid Parentheses",
            "Next Greater Element",
            "Implement Queue using Stacks",
            "4 Pillars of OOP"
          ],
          "deliverable": "Complete 20 stack and OOP programming challenges."
        },
        {
          "label": "Week 3",
          "focus": "DBMS, SQL & Linux Shell Commands",
          "target": "Master SQL joins, duplicate removal, indexing, and Linux command line utilities.",
          "topics": [
            "SQL Joins & De-duplication",
            "Database Normalization",
            "Linux Shell Commands (grep, ps, find)",
            "File Permissions (chmod)"
          ],
          "deliverable": "Write and test 20 SQL queries and Linux commands."
        },
        {
          "label": "Week 4",
          "focus": "Trees, BSTs & Binary Search",
          "target": "Master binary tree traversals, LCA, and binary search.",
          "topics": [
            "Lowest Common Ancestor in BST",
            "Binary Tree Level Order",
            "Search in Rotated Sorted Array",
            "Validate BST"
          ],
          "deliverable": "Solve 20 tree and search problems."
        },
        {
          "label": "Week 5",
          "focus": "Product Engineering & Enterprise Cloud Architecture",
          "target": "Design infrastructure monitoring dashboards, PLM trackers, and IoT telemetry pipelines.",
          "topics": [
            "Design Cloud Monitoring System",
            "Design IoT Telemetry Ingestion",
            "Design Library Management System"
          ],
          "deliverable": "Draft 3 complete system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Project Deep-Dive, Ideapreneurship & HR Simulation",
          "target": "Rehearse project technical explanations, Ideapreneurship values, and HR behavioral questions.",
          "topics": [
            "Project Architecture & Code Walkthrough",
            "HCL Ideapreneurship Values",
            "HR Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior HCL Technical Leads."
        }
      ],
      "curatedPrep": [
        {
          "title": "Linux Shell Mastery",
          "detail": "Understand how to search log files using grep, sort, uniq, and awk."
        },
        {
          "title": "SQL Duplicate Queries",
          "detail": "Master queries using GROUP BY ... HAVING COUNT(*) > 1 and ROW_NUMBER() window functions."
        },
        {
          "title": "Ideapreneurship Mindset",
          "detail": "Highlight examples where you took proactive initiative to improve code quality or user experience."
        }
      ]
    }
  },
  {
    "id": "tech-mahindra",
    "name": "Tech Mahindra",
    "category": "service-based",
    "region": "Pune / Hyderabad, India / Global",
    "hiringProcess": [
      "Round 01: Online Assessment (Aptitude + English Essay + Technical Coding, 90 mins)",
      "Round 02: Technical Interview 1 — Core Data Structures, Java/Python, OOP & SQL (45 mins)",
      "Round 03: Technical Interview 2 / Domain Round (Telecom, 5G, Cloud & Project discussion, 45 mins)",
      "Round 04: HR & Behavioral Round (30 mins)"
    ],
    "pyqTopics": [
      "Telecom & 5G Network Solutions Architecture",
      "Core Java / Python / C++ Programming & OOP",
      "Array Manipulations, Sorting & String Processing",
      "SQL Queries, Joins, Triggers & Normalization",
      "Operating Systems & Computer Networks (OSI, TCP/IP, 5G Core)",
      "Trees & Basic Dynamic Programming"
    ],
    "interviewStyle": "Tests foundational programming in Java/Python/C++, understanding of core CS fundamentals (OOP, DBMS, OS, Networks), telecom domain awareness (5G, cloud virtualization), and project experience.",
    "sampleQuestions": [
      "Find Majority Element in Array / Moore's Voting Algorithm (Easy/Medium)",
      "Longest Common Prefix in String Array (Easy)",
      "Reverse Linked List (Easy/Medium)",
      "SQL: Write query to find second highest salary without using LIMIT/TOP (Medium)",
      "Core CS: Explain 5G Core Architecture, Network Slicing & NFV (Medium)",
      "Core CS: Difference between TCP and UDP protocols with real-world examples (Medium)"
    ],
    "prepNotes": [
      "Understand Tech Mahindra's primary domain strength: Telecom 5G transformation, Network Function Virtualization (NFV), and Cloud-Native platforms.",
      "Master foundational data structures: Arrays, Linked Lists, Stacks, Queues, and basic Trees.",
      "Be prepared to write clean code for classic algorithmic questions without compilation bugs."
    ],
    "systemDesignArchetypes": [
      "Design 5G Telecom Network Slicing & Billing Mediation Engine",
      "Design Enterprise Customer Telecom Self-Care Portal & Order Manager",
      "Design IoT Smart City Traffic & Lighting Telemetry Engine"
    ],
    "culturalValues": [
      "Rise Philosophy: Accepting No Limits, Alternative Thinking, Driving Positive Change",
      "Customer Centricity and Innovation in Connected Experiences",
      "Inclusivity, Agility and High Integrity"
    ],
    "communityInsights": [
      {
        "title": "Telecom Domain Knowledge",
        "detail": "Having basic awareness of 5G, IoT, and Cloud Network Virtualization gives candidates a significant edge in technical rounds."
      },
      {
        "title": "Rise Philosophy",
        "detail": "Align your behavioral answers with the Mahindra 'Rise' philosophy: accepting no limits and driving positive change."
      }
    ],
    "roadmap": {
      "duration": "6-week master loop",
      "weeks": [
        {
          "label": "Week 1",
          "focus": "Arrays, Strings & Foundational Coding",
          "target": "Master array operations, string prefix matching, Moore's voting algorithm, and sorting.",
          "topics": [
            "Majority Element",
            "Longest Common Prefix",
            "Two Sum",
            "String to Integer"
          ],
          "deliverable": "Solve 25 foundational Tech Mahindra coding challenges."
        },
        {
          "label": "Week 2",
          "focus": "Core Java / Python & OOP Principles",
          "target": "Master Encapsulation, Inheritance, Polymorphism, Abstraction, and Exception Handling.",
          "topics": [
            "4 Pillars of OOP",
            "Method Overloading vs Overriding",
            "Abstract Class vs Interface",
            "Custom Exception Handling"
          ],
          "deliverable": "Complete OOP implementation assignment."
        },
        {
          "label": "Week 3",
          "focus": "DBMS, SQL Queries & Computer Networks",
          "target": "Master SQL joins, second highest salary queries, OSI model, and TCP vs UDP.",
          "topics": [
            "SQL Joins & Subqueries",
            "Database Normalization",
            "OSI 7 Layers & TCP vs UDP",
            "5G Network Architecture Fundamentals"
          ],
          "deliverable": "Write and test 20 SQL queries."
        },
        {
          "label": "Week 4",
          "focus": "Linked Lists, Stacks & Trees",
          "target": "Master linked list reversals, stack evaluations, and binary tree traversals.",
          "topics": [
            "Reverse Linked List",
            "Valid Parentheses",
            "Binary Tree Level Order",
            "Lowest Common Ancestor in BST"
          ],
          "deliverable": "Solve 20 data structure problems."
        },
        {
          "label": "Week 5",
          "focus": "Telecom & Cloud High-Scale System Design",
          "target": "Design 5G network billing engines, customer self-care portals, and IoT smart city systems.",
          "topics": [
            "Design Telecom Billing Engine",
            "Design Smart City IoT Ingestion",
            "Design Customer Care Portal"
          ],
          "deliverable": "Draft 3 complete system architecture blueprints."
        },
        {
          "label": "Week 6",
          "focus": "Project Deep-Dive, Rise Philosophy & HR Simulation",
          "target": "Rehearse project technical explanations, Mahindra Rise philosophy, and HR behavioral questions.",
          "topics": [
            "Project Architecture & Code Defense",
            "Mahindra Rise Philosophy",
            "HR Mock Interview"
          ],
          "deliverable": "Complete 3 mock interviews with Senior Tech Mahindra Leads."
        }
      ],
      "curatedPrep": [
        {
          "title": "Moore's Voting Algorithm",
          "detail": "Master O(N) time and O(1) space majority element finding using candidate voting."
        },
        {
          "title": "TCP vs UDP",
          "detail": "Explain differences in reliability, connection overhead, flow control, and use cases (TCP for banking/web, UDP for live video/gaming)."
        },
        {
          "title": "Mahindra Rise",
          "detail": "Connect past achievements to 'Accepting No Limits' and 'Driving Positive Change'."
        }
      ]
    }
  }
];

export const companyPrepCatalog: CompanyPrepItem[] = curatedProfiles;
