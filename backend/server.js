require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const crud = require('./src/utils/crud');
const errorHandler = require('./src/middleware/error');
const Note = require('./src/models/Note');
const CaseStudy = require('./src/models/CaseStudy');
const Question = require('./src/models/Question');
const Skill = require('./src/models/Skill');

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./src/routes/auth'));
// Notes show every status publicly (upcoming / in-progress / published) — mirrors your site
app.use('/api/notes', crud(Note, { slugField: 'title', publicFilter: {}, sort: { order: 1, createdAt: -1 } }));
app.use('/api/case-studies', crud(CaseStudy, { slugField: 'title' }));
app.use('/api/questions', crud(Question));
app.use('/api/skills', crud(Skill, { publicFilter: {}, sort: { category: 1, order: 1, name: 1 } }));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`API running on :${PORT}`)));
