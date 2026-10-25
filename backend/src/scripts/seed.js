require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Note = require('../models/Note');
const CaseStudy = require('../models/CaseStudy');
const Question = require('../models/Question');
const Skill = require('../models/Skill');

const notes = [
  { title: 'System Design — Notes & Basics', subject: 'System Design', status: 'in-progress', excerpt: 'Breaking down scalability, consistency and tradeoffs in plain language.', content: '## Scalability\n\nVertical vs horizontal scaling, and when each makes sense.\n\n## Consistency\n\nCAP theorem, eventual consistency and the tradeoffs you actually face.\n\n```js\n// cache-aside pattern\nconst hit = await redis.get(key);\nif (hit) return JSON.parse(hit);\n```', tags: ['system-design'], readTime: 8 },
  { title: 'Docker Fundamentals — From Zero to Real-World Usage', subject: 'DevOps', status: 'in-progress', excerpt: 'Containers for full stack developers — images, volumes and real project setups.', content: '## Images and containers\n\nWrite your content in **markdown** from the admin panel.', tags: ['docker'], readTime: 10 },
  { title: 'Building a Production-Ready React Application from Scratch', subject: 'Frontend', status: 'in-progress', excerpt: 'Architecture, state, performance — and the decisions in between.', content: '## Start here\n\nFolder structure, state, performance.', tags: ['react'], readTime: 12 },
  { title: 'Understanding P99 latency, throughput, and error rates', subject: 'Systems', status: 'upcoming', excerpt: 'The three numbers that tell you if a service is actually healthy.', tags: ['observability'] },
  { title: 'MongoDB aggregation pipelines explained with real examples', subject: 'Data', status: 'upcoming', excerpt: 'From $match to $lookup — pipelines that earn their keep.', tags: ['mongodb'] },
  { title: 'Authentication, refresh tokens, and RBAC', subject: 'Security', status: 'upcoming', excerpt: "Sessions that stay secure without getting in the user's way.", tags: ['auth'] },
].map((n, i) => ({ ...n, order: i, slug: n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));

const caseStudies = [
  { title: 'Engineering financial data experiences', category: 'Case study', eyebrow: 'Fintech · Production', subtitle: 'NSE Cogencis-related financial-market applications', summary: 'Financial-market users need dense, real-time information — quotes, watchlists, news and analytics — without the interface getting slow or confusing as data volume grows.', stack: ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'Express.js', 'WebSockets', 'Zustand'], highlights: ['30% faster initial load', '25% smaller JS bundle', '20+ reusable UI components', '500+ concurrent users supported by backend APIs'], content: '## Problem\n\nDense real-time data without a slow UI.\n\n## What I did\n\n- Built React/Next.js micro-frontends for market data\n- Lazy loading, memoization, code splitting and caching\n- Reusable typed UI components\n\n## Result\n\nFaster first load and smaller bundles. *Contributed with a team — not solo ownership.*' },
  { title: 'CreditX — Credit Assessment API', category: 'Open source', eyebrow: 'Backend · Open source', subtitle: 'A backend-oriented credit assessment application, built and documented end to end', summary: 'Credit assessment workflows need structured multi-stage applications, authenticated access, and an API surface other developers can actually integrate with.', stack: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'Swagger'], highlights: ['Refresh-token auth', 'Swagger docs (v1)', 'Modules: auth, applications, scoring, users, webhooks'], github: 'https://github.com/Shivani-Chouksey', demo: 'https://creditx-plsn.vercel.app', content: '## Architecture\n\nClient → API → Auth / Business Logic → Database.\n\n## Endpoints\n\n| Method | Path | Purpose |\n|---|---|---|\n| POST | /v1/applications | Create application |\n| POST | /v1/auth/refresh | Rotate refresh token |\n| GET | /v1/applications/:id | Fetch application |' },
  { title: 'Building a real estate platform end to end', category: 'Case study', eyebrow: 'Full stack · Case study', subtitle: 'Property discovery and management application', summary: 'Property teams needed one place to publish listings, manage enquiries and administer users — with an experience buyers could actually navigate.', stack: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB'], highlights: ['Property listings and filters', 'Admin enquiries workflow', 'SEO with Next.js'], content: '## Scope\n\nListings, user management and an admin interface for enquiries.' },
].map((c, i) => ({ ...c, order: i, slug: c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));

const skillGroups = {
  Frontend: ['React.js', 'Next.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
  'State & Data Management': ['Redux Toolkit', 'React Query', 'Zustand'],
  Backend: ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'Authentication', 'JWT', 'RBAC'],
  Databases: ['MongoDB', 'MySQL'],
  'Testing & API Tools': ['Jest', 'Swagger', 'Postman'],
  'Cloud, Delivery & Collaboration': ['AWS S3', 'Docker', 'NGINX', 'Git', 'GitHub', 'GitLab'],
  'Real-time & Application Tech': ['WebSockets', 'Socket.IO', 'Electron.js', 'PWA'],
};
const skills = Object.entries(skillGroups).flatMap(([category, list]) => list.map((name, order) => ({ name, category, order })));

const questions = [
  { question: 'What is the difference between useMemo and useCallback?', category: 'React', difficulty: 'easy', answer: '`useMemo` caches a **computed value**; `useCallback` caches a **function reference**.\n\nUse them only when referential equality matters (memoized children, dependency arrays).', tags: ['hooks', 'performance'] },
  { question: 'How does JWT refresh-token rotation work?', category: 'Node.js', difficulty: 'medium', answer: 'Short-lived access token + long-lived refresh token. On refresh, issue a **new** refresh token and invalidate the old one; reuse of an old token signals theft.', tags: ['auth', 'security'] },
  { question: 'Explain the MongoDB aggregation pipeline.', category: 'MongoDB', difficulty: 'medium', answer: 'Documents flow through stages: `$match` → `$group` → `$sort` → `$lookup`. Put `$match` first so indexes are used.', tags: ['aggregation'] },
  { question: 'How would you design a real-time watchlist for 500+ concurrent users?', category: 'System Design', difficulty: 'hard', answer: 'WebSocket gateway + pub/sub (Redis), batch updates, per-symbol subscriptions, backpressure and reconnect with last-seen sequence.', tags: ['websockets', 'scalability'] },
].map((q, i) => ({ ...q, order: i }));

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe@123', 12);
  await Admin.findOneAndUpdate({ email }, { email, password: hash }, { upsert: true });
  console.log('Admin ready:', email);
  const seedIfEmpty = async (Model, data, label) => {
    if ((await Model.countDocuments()) === 0) { await Model.insertMany(data); console.log('Seeded', label); }
  };
  await seedIfEmpty(Note, notes, 'notes');
  await seedIfEmpty(CaseStudy, caseStudies, 'case studies');
  await seedIfEmpty(Skill, skills, 'skills');
  await seedIfEmpty(Question, questions, 'questions');
  await mongoose.disconnect();
})();
