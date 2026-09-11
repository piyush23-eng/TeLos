import { Router } from 'express';

export const communityRouter = Router();

export const communityPosts: any[] = [
  {
    id: 'post-1',
    author: 'Priya S.',
    company: 'Google',
    role: 'L5 Backend Engineer',
    time: '2 hours ago',
    type: 'debrief',
    title: 'Cleared Google L5 Technical & System Design Rounds — Key Takeaways',
    message: 'Just received the positive HC signal for Google MTV! For system design, Alex’s advice on calculating throughput before writing down any database schemas saved me. When asked to scale an API rate limiter, I immediately led with token bucket + Redis Lua scripts + P99 latency bounds.',
    upvotes: 42,
    helpfulCount: 28,
    replies: [
      {
        id: 'rep-1',
        author: 'Rohan M.',
        time: '1 hour ago',
        message: 'Congrats Priya! How in-depth did they go into distributed consensus and split-brain recovery in round 3?'
      },
      {
        id: 'rep-2',
        author: 'Priya S.',
        time: '35 mins ago',
        message: 'They specifically drilled into network partition trade-offs (CP vs AP) and standby leader promotion.'
      }
    ]
  },
  {
    id: 'post-2',
    author: 'Karan V.',
    company: 'Amazon',
    role: 'SDE II',
    time: '5 hours ago',
    type: 'offer',
    title: 'Amazon SDE II Offer — 14 Leadership Principles Framing in Live Screen',
    message: 'TeLos’s pacing tracker got my filler words down from 8% to 1.2%. During the behavioral bar raiser, structuring answers strictly in STAR (Situation, Task, Action, Measurable Result) made a massive difference.',
    upvotes: 35,
    helpfulCount: 19,
    replies: [
      {
        id: 'rep-3',
        author: 'Ananya D.',
        time: '3 hours ago',
        message: 'Which LP did they focus on the most in the bar raiser?'
      }
    ]
  },
  {
    id: 'post-3',
    author: 'Dev Patel',
    company: 'Microsoft',
    role: 'Senior Software Engineer',
    time: '1 day ago',
    type: 'question',
    title: 'Top System Design PYQs for Azure Core Cloud Teams',
    message: 'Practicing the 24 curated company drills on TeLos right now. Highly recommend doing the Distributed Lock and Rate Limiter drills before Azure interviews.',
    upvotes: 29,
    helpfulCount: 15,
    replies: []
  }
];

// List community posts
communityRouter.get('/', (_req, res) => {
  res.json({ posts: communityPosts });
});

// Create new post
communityRouter.post('/', async (req, res, next) => {
  try {
    const newPost = req.body;
    if (newPost && newPost.id && newPost.message) {
      communityPosts.unshift(newPost);
      if (communityPosts.length > 100) communityPosts.pop();
    }
    res.json({ posts: communityPosts });
  } catch (error) {
    next(error);
  }
});

// Add reply to post
communityRouter.post('/reply', async (req, res, next) => {
  try {
    const { postId, reply } = req.body;
    if (postId && reply && reply.message) {
      const target = communityPosts.find(p => p.id === postId);
      if (target) {
        if (!target.replies) target.replies = [];
        target.replies.push(reply);
      }
    }
    res.json({ posts: communityPosts });
  } catch (error) {
    next(error);
  }
});

// Vote on post
communityRouter.post('/vote', async (req, res, next) => {
  try {
    const { postId, delta } = req.body;
    if (postId) {
      const target = communityPosts.find(p => p.id === postId);
      if (target) {
        target.upvotes = Math.max(0, (target.upvotes || 0) + (Number(delta) || 1));
      }
    }
    res.json({ posts: communityPosts });
  } catch (error) {
    next(error);
  }
});
