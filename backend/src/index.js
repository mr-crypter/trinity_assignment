'use strict';

const express = require('express');
const { Pool } = require('pg');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Trust proxy so rate-limits work behind reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(morgan('combined'));

// Rate limit: simple smoothing per IP
const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  family: 4,
});

// Helpers
function buildSuccess(data) {
  return { success: true, data };
}
function buildError(message) {
  return { success: false, error: message };
}

// Health
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Create idea
app.post('/api/ideas', async (req, res) => {
  try {
    const raw = typeof req.body?.text === 'string' ? req.body.text : '';
    const text = raw.trim();
    if (!text || text.length === 0 || text.length > 280) {
      return res
        .status(400)
        .json(buildError('Text required and max 280 characters'));
    }
    const { rows } = await pool.query(
      'INSERT INTO ideas (text) VALUES ($1) RETURNING id, text, upvotes, created_at',
      [text]
    );
    return res.status(201).json(buildSuccess(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[POST /api/ideas] error', err);
    return res.status(500).json(buildError('Internal server error'));
  }
});

// List ideas
app.get('/api/ideas', async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 100);
    const offset = Number.parseInt(req.query.offset, 10) || 0;
    const sortParam = req.query.sort === 'popular' ? 'popular' : 'newest';
    const sortClause =
      sortParam === 'popular'
        ? 'upvotes DESC, created_at DESC'
        : 'created_at DESC';

    const sql = `SELECT id, text, upvotes, created_at FROM ideas ORDER BY ${sortClause} LIMIT $1 OFFSET $2`;
    const { rows } = await pool.query(sql, [limit, offset]);
    return res.status(200).json(buildSuccess(rows));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[GET /api/ideas] error', err);
    return res.status(500).json(buildError('Internal server error'));
  }
});

// Upvote idea (atomic)
app.post('/api/ideas/:id/upvote', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json(buildError('Invalid id'));
    }
    const { rows } = await pool.query(
      'UPDATE ideas SET upvotes = upvotes + 1 WHERE id = $1 RETURNING id, upvotes',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json(buildError('Idea not found'));
    }
    return res.status(200).json(buildSuccess(rows[0]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[POST /api/ideas/:id/upvote] error', err);
    return res.status(500).json(buildError('Internal server error'));
  }
});

// Start server
const port = Number.parseInt(process.env.PORT, 10) || 4000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on ${port}`);
});

// Graceful shutdown
function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[server] ${signal} received, shutting down`);
  server.close(() => {
    pool
      .end()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Fallback error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('[unhandled error]', err);
  res.status(500).json(buildError('Internal server error'));
});



