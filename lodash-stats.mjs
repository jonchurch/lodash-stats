#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { fetchDownloads } from './fetch-downloads.mjs';
import {
  categories, corePackages, legacyPackages, internalPackages,
  methodPackages, allPackageNames,
} from './packages.mjs';

// --- CLI ---

const { values: args, positionals } = parseArgs({
  options: {
    category: { type: 'string', short: 'c' },
    search: { type: 'string', short: 's' },
    silly: { type: 'boolean', default: false },
    sort: { type: 'string', default: 'count' }, // count | name
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
    'no-cache': { type: 'boolean', default: false },
  },
  allowPositionals: true,
  strict: false,
});

const command = positionals[0] || 'top';

// --- Data ---

let downloadCounts;

function getDownloads(pkg) {
  return downloadCounts.get(pkg) || 0;
}

function withDownloads(packages) {
  return packages
    .map(pkg => ({ pkg, monthly: getDownloads(pkg) }))
    .filter(s => s.monthly > 0);
}

function buildStats() {
  const methods = methodPackages
    .map(m => ({ ...m, monthly: getDownloads(m.pkg) }))
    .filter(m => m.monthly > 0);

  const core = corePackages.map(pkg => ({ pkg, monthly: getDownloads(pkg) }));
  const legacy = withDownloads(legacyPackages);
  const internals = withDownloads(internalPackages);

  const grandTotal = allPackageNames.reduce((sum, pkg) => sum + getDownloads(pkg), 0);

  return { methods, core, legacy, internals, grandTotal, totalPackages: allPackageNames.length };
}

const WEEKS_PER_MONTH = 30 / 7;

// --- Formatting ---

function formatNum(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDownloads(monthly) {
  const weekly = Math.round(monthly / WEEKS_PER_MONTH);
  return `${formatNum(monthly)}/month (${formatNum(weekly)}/wk)`;
}

function sortItems(items, sortBy) {
  if (sortBy === 'name') return [...items].sort((a, b) => (a.pkg || a.method || '').localeCompare(b.pkg || b.method || ''));
  return [...items].sort((a, b) => b.monthly - a.monthly);
}

// --- Commands ---

function cmdTotal(stats) {
  const { grandTotal, totalPackages } = stats;
  const daily = Math.round(grandTotal / 30);
  const weekly = Math.round(grandTotal / WEEKS_PER_MONTH);

  if (args.json) {
    return JSON.stringify({ daily, weekly, monthly: grandTotal, packages: totalPackages });
  }

  const lines = [
    `Lodash total downloads (all ${totalPackages} packages):`,
    `  ${formatNum(grandTotal)}/month`,
    `  ${formatNum(weekly)}/week`,
    `  ${formatNum(daily)}/day`,
  ];

  if (args.silly) {
    const perSecond = Math.round(grandTotal / 30 / 24 / 60 / 60);
    const perMinute = Math.round(grandTotal / 30 / 24 / 60);
    const perHour = Math.round(grandTotal / 30 / 24);
    lines.push(
      `  ${formatNum(perHour)}/hour`,
      `  ${formatNum(perMinute)}/minute`,
      `  ${formatNum(perSecond)}/second`,
    );
  }

  return lines.join('\n');
}

function cmdTop(stats, overrides = {}) {
  const n = parseInt(positionals[1], 10) || 20;
  const categoryFilter = overrides.category || args.category;
  const searchFilter = overrides.search || args.search;

  let items = [
    ...stats.core.map(s => ({ ...s, method: s.pkg, category: 'Core' })),
    ...stats.methods,
    ...stats.legacy.map(s => ({ ...s, method: s.pkg, category: 'Legacy' })),
  ];

  if (categoryFilter) {
    const cat = categoryFilter.toLowerCase();
    items = items.filter(m => m.category.toLowerCase() === cat);
    if (items.length === 0) {
      const validCats = Object.keys(categories).join(', ');
      return `No category "${categoryFilter}". Valid: ${validCats}`;
    }
  }

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    items = items.filter(m => m.method.toLowerCase().includes(q) || m.pkg.includes(q));
  }

  items = sortItems(items, args.sort).slice(0, n);

  if (args.json) {
    return JSON.stringify(items.map(m => ({ package: m.pkg, method: m.method, category: m.category, monthly: m.monthly })));
  }

  if (items.length === 0) return 'No results.';

  const label = categoryFilter ? `Top ${items.length} in ${categoryFilter}` :
    searchFilter ? `Results for "${searchFilter}"` :
      `Top ${items.length} lodash packages`;

  const lines = [label, ''];
  items.forEach((s, i) => {
    lines.push(`  ${String(i + 1).padStart(3)}. ${s.pkg.padEnd(30)} ${formatDownloads(s.monthly)}`);
  });
  return lines.join('\n');
}

function cmdGraph(stats) {
  const sorted = sortItems(stats.methods, 'count');
  const top5 = sorted.slice(0, 5);
  const top5Total = top5.reduce((s, m) => s + m.monthly, 0);

  const lodashMonthly = getDownloads('lodash');
  const lodashEsMonthly = getDownloads('lodash-es');
  const otherTotal = stats.grandTotal - lodashMonthly - lodashEsMonthly - top5Total;

  const slices = [
    { label: 'lodash', monthly: lodashMonthly },
    { label: 'lodash-es', monthly: lodashEsMonthly },
    ...top5.map(m => ({ label: m.pkg, monthly: m.monthly })),
    { label: `Other (${stats.totalPackages - 2 - top5.length}+ pkgs)`, monthly: otherTotal },
  ].sort((a, b) => b.monthly - a.monthly);

  if (args.json) {
    return JSON.stringify(slices);
  }

  const BAR_WIDTH = 40;
  const maxMonthly = slices[0].monthly;
  const lines = [
    '',
    '  Lodash Ecosystem Download Share',
    '  ' + '═'.repeat(56),
    '',
  ];

  for (const s of slices) {
    const pct = (s.monthly / stats.grandTotal * 100);
    const barLen = Math.max(1, Math.round(s.monthly / maxMonthly * BAR_WIDTH));
    const bar = '█'.repeat(barLen);
    const label = s.label.padEnd(22);
    lines.push(`  ${label} ${bar} ${formatNum(s.monthly)} (${pct.toFixed(1)}%)`);
  }

  lines.push('', '  ' + '─'.repeat(56));
  lines.push(`  Total: ${formatNum(stats.grandTotal)}/month across ${stats.totalPackages} packages`);
  lines.push('');
  return lines.join('\n');
}

function cmdSearch(stats) {
  const term = args.search || positionals[1];
  if (!term) return 'Usage: lodash-stats search <term>';
  return cmdTop(stats, { search: term });
}

function cmdCategory(stats) {
  const cat = args.category || positionals[1];
  if (!cat) {
    const cats = Object.keys(categories);
    if (args.json) return JSON.stringify(cats);
    return 'Categories: ' + cats.join(', ');
  }
  return cmdTop(stats, { category: cat });
}

function cmdList() {
  if (args.json) return JSON.stringify(allPackageNames);
  return allPackageNames.join('\n');
}

function cmdMarkdown(stats) {
  const p = [];
  const lodashMonthly = getDownloads('lodash');
  const lodashEsMonthly = getDownloads('lodash-es');
  const methodTotal = stats.methods.reduce((s, m) => s + m.monthly, 0);

  p.push('# Lodash Package Download Stats');
  p.push('');
  p.push(`**Main lodash package:** ${formatDownloads(lodashMonthly)}`);
  p.push(`**lodash-es:** ${formatDownloads(lodashEsMonthly)}`);
  p.push(`**Total lodash.foo method packages:** ${formatDownloads(methodTotal)}`);
  p.push('');
  p.push(`**Grand Total:** ${formatDownloads(stats.grandTotal)}`);
  p.push('');

  // Top 20
  const top20 = sortItems(stats.methods, 'count').slice(0, 20);
  p.push('## Top 20 Downloaded Lodash Method Packages');
  p.push('');
  top20.forEach((s, i) => {
    p.push(`${i + 1}. [\`lodash.${s.method.toLowerCase()}\`](https://www.npmjs.com/package/${s.pkg}) — ${formatDownloads(s.monthly)}`);
  });
  p.push('');

  // By category
  p.push('## Downloads By Category');
  p.push('');
  const categoryOrder = Object.keys(categories);
  for (const cat of categoryOrder) {
    const items = sortItems(stats.methods.filter(m => m.category === cat), 'count');
    if (items.length === 0) continue;
    p.push(`### ${cat}`);
    p.push('');
    items.forEach((s, i) => {
      p.push(`${i + 1}. [${s.pkg}](https://www.npmjs.com/package/${s.pkg}) — ${formatDownloads(s.monthly)}`);
    });
    p.push('');
  }

  // Core packages
  const coreWithDownloads = stats.core.filter(s => s.monthly > 0);
  if (coreWithDownloads.length > 0) {
    p.push('## Core Packages');
    p.push('');
    sortItems(coreWithDownloads, 'count').forEach((s, i) => {
      p.push(`${i + 1}. [${s.pkg}](https://www.npmjs.com/package/${s.pkg}) — ${formatDownloads(s.monthly)}`);
    });
    p.push('');
  }

  // Internals (collapsed)
  if (stats.internals.length > 0) {
    const internalTotal = stats.internals.reduce((s, m) => s + m.monthly, 0);
    p.push('## Internal Packages (lodash._)');
    p.push('');
    p.push(`<details><summary>${stats.internals.length} internal packages — ${formatDownloads(internalTotal)} total</summary>`);
    p.push('');
    stats.internals.sort((a, b) => b.monthly - a.monthly).forEach((s, i) => {
      p.push(`${i + 1}. [${s.pkg}](https://www.npmjs.com/package/${s.pkg}) — ${formatDownloads(s.monthly)}`);
    });
    p.push('');
    p.push('</details>');
    p.push('');
  }

  return p.join('\n');
}

// --- Main ---

async function main() {
  if (args.help || command === 'help') {
    console.log(`Usage: lodash-stats <command> [options]

Commands:
  top [N]              Top N packages by downloads (default: 20)
  total                Grand total across all packages
  graph                Bar chart of download share
  search <term>        Search packages by name
  category [name]      Filter to a category (alias: cat)
                       Valid: Array, Collection, Date, Function, Lang,
                       Math, Number, Object, String, Util
  list                 List all package names (alias: ls)
  markdown             Full report in markdown (alias: md)
  help                 Show this help

Options:
  -c, --category <name> Filter by category
  -s, --search <term>  Filter by name
      --sort <field>   Sort by: count (default), name
      --json           Output as JSON
      --silly          Show per-second stats (with total)
      --no-cache       Skip cache, fetch fresh data from npm
  -h, --help           Show this help

Examples:
  lodash-stats top 5
  lodash-stats total --silly
  lodash-stats search debounce --json
  lodash-stats category Function --sort name
  lodash-stats md > LODASH_STATS.md`);
    return;
  }

  try {
    downloadCounts = await fetchDownloads(allPackageNames, { noCache: args['no-cache'] });
  } catch (err) {
    console.error(`Failed to fetch download stats: ${err.message}`);
    process.exit(1);
  }

  const stats = buildStats();

  const commands = {
    top: cmdTop,
    total: cmdTotal,
    graph: cmdGraph,
    search: cmdSearch,
    category: cmdCategory,
    cat: cmdCategory,
    list: cmdList,
    ls: cmdList,
    markdown: cmdMarkdown,
    md: cmdMarkdown,
  };

  const handler = commands[command];
  if (!handler) {
    console.log(`Unknown command: ${command}`);
    console.log(`Available: ${Object.keys(commands).join(', ')}`);
    process.exit(1);
  }

  console.log(handler(stats));
}

main();
