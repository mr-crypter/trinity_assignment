'use strict';

const { readFileSync, readdirSync } = require('fs');
const { resolve, join } = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: resolve(__dirname, '..', '.env') });

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    // Wait for DB to be ready (handles startup race with Postgres)
    async function waitForDb(maxAttempts = 30, delayMs = 1000) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await pool.query('SELECT 1');
          // eslint-disable-next-line no-console
          console.log(`[migrate] database ready (attempt ${attempt})`);
          return;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(
            `[migrate] database not ready yet (attempt ${attempt}/${maxAttempts})`,
            e?.code || e?.message || e
          );
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
      throw new Error('Database not ready after retries');
    }

    await waitForDb();

    // Always read from backend-local migrations folder
    const migrationsDir = resolve(__dirname, '../migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const full = join(migrationsDir, file);
      const sql = readFileSync(full, 'utf8');
      // simple splitter; most files are single statements with function/trigger blocks
      // execute as one script to preserve order and PL/pgSQL blocks
      // eslint-disable-next-line no-console
      console.log(`[migrate] applying ${file}`);
      // Use single query so DO blocks work
      let applied = false;
      for (let attempt = 1; attempt <= 5 && !applied; attempt++) {
        try {
          await pool.query(sql);
          applied = true;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(
            `[migrate] retry ${attempt}/5 for ${file} due to error:`,
            e?.code || e?.message || e
          );
          await new Promise((r) => setTimeout(r, 1000));
          if (attempt === 5) throw e;
        }
      }
    }
    // eslint-disable-next-line no-console
    console.log('[migrate] done');
    await pool.end();
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[migrate] failed', err);
    process.exit(1);
  }
}

run();



