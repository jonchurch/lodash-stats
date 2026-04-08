import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const API_BASE = 'https://api.npmjs.org/downloads/point/last-month';
const BATCH_SIZE = 128;
const CACHE_FILE = join(tmpdir(), 'lodash-stats-cache.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function readCache() {
  if (!existsSync(CACHE_FILE)) return null;
  try {
    const data = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    if (Date.now() - data.timestamp < CACHE_TTL) return data.counts;
  } catch {}
  return null;
}

function writeCache(counts) {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify({ timestamp: Date.now(), counts }));
  } catch {}
}

async function fetchBatch(packages) {
  const url = `${API_BASE}/${packages.join(',')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`npm API ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch download counts for a list of package names from the npm API.
 * Returns a Map of package name -> monthly download count.
 * Results are cached to /tmp for 1 hour.
 */
export async function fetchDownloads(packageNames) {
  const cached = readCache();
  if (cached) {
    return new Map(Object.entries(cached));
  }

  // Split into batches of 128
  const batches = [];
  for (let i = 0; i < packageNames.length; i += BATCH_SIZE) {
    batches.push(packageNames.slice(i, i + BATCH_SIZE));
  }

  // Fetch all batches in parallel
  const results = await Promise.all(batches.map(fetchBatch));

  // Merge results into a single map
  const counts = new Map();
  for (const result of results) {
    for (const [pkg, data] of Object.entries(result)) {
      if (data && data.downloads) {
        counts.set(pkg, data.downloads);
      }
    }
  }

  // Cache results
  writeCache(Object.fromEntries(counts));

  return counts;
}
