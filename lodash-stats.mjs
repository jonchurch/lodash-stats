#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const downloadCounts = require('download-counts');
const downloadCountsPkg = require('download-counts/package.json');

// Check if a newer version of download-counts is available
async function checkForUpdate() {
  try {
    const res = await fetch('https://registry.npmjs.org/download-counts/latest', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return;
    const { version: latest } = await res.json();
    if (latest !== downloadCountsPkg.version) {
      console.warn(`⚠ Newer data available: v${latest} (you have v${downloadCountsPkg.version}). Run: npm update download-counts`);
    }
  } catch {}
}
const updateCheck = checkForUpdate();

// --- CLI ---

const { values: args, positionals } = parseArgs({
  options: {
    top:      { type: 'string', short: 't', default: '20' },
    category: { type: 'string', short: 'c' },
    search:   { type: 'string', short: 's' },
    graph:    { type: 'boolean', default: false },
    total:    { type: 'boolean', default: false },
    silly:    { type: 'boolean', default: false },
    sort:     { type: 'string', default: 'count' }, // count | name
    json:     { type: 'boolean', default: false },
    help:     { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
  strict: false,
});

const command = positionals[0] || 'top';

// --- Package registry ---

// Core packages (not derivable from method categories)
const corePackages = [
  'lodash', 'lodash-es', 'lodash-compat', 'lodash-amd', 'lodash-cli',
  'lodash-webpack-plugin', 'lodash-migrate', 'lodash-doc-globals',
  'babel-plugin-lodash',
];

// Aliases share a package with another method — skip when deriving package names
const aliases = new Set([
  'each', 'eachRight', 'entries', 'entriesIn', 'extend', 'extendWith',
]);

// All lodash methods organized by category (from lodash v4.18.1 docs)
const categories = {
  Array: [
    'chunk', 'compact', 'concat', 'difference', 'differenceBy', 'differenceWith',
    'drop', 'dropRight', 'dropRightWhile', 'dropWhile', 'fill', 'findIndex',
    'findLastIndex', 'flatten', 'flattenDeep', 'flattenDepth', 'fromPairs', 'head',
    'indexOf', 'initial', 'intersection', 'intersectionBy', 'intersectionWith',
    'join', 'last', 'lastIndexOf', 'nth', 'pull', 'pullAll', 'pullAllBy',
    'pullAllWith', 'pullAt', 'remove', 'reverse', 'slice', 'sortedIndex',
    'sortedIndexBy', 'sortedIndexOf', 'sortedLastIndex', 'sortedLastIndexBy',
    'sortedLastIndexOf', 'sortedUniq', 'sortedUniqBy', 'tail', 'take', 'takeRight',
    'takeRightWhile', 'takeWhile', 'union', 'unionBy', 'unionWith', 'uniq',
    'uniqBy', 'uniqWith', 'unzip', 'unzipWith', 'without', 'xor', 'xorBy',
    'xorWith', 'zip', 'zipObject', 'zipObjectDeep', 'zipWith',
  ],
  Collection: [
    'countBy', 'each', 'eachRight', 'every', 'filter', 'find', 'findLast',
    'flatMap', 'flatMapDeep', 'flatMapDepth', 'forEach', 'forEachRight', 'groupBy',
    'includes', 'invokeMap', 'keyBy', 'map', 'orderBy', 'partition', 'reduce',
    'reduceRight', 'reject', 'sample', 'sampleSize', 'shuffle', 'size', 'some',
    'sortBy',
  ],
  Date: ['now'],
  Function: [
    'after', 'ary', 'before', 'bind', 'bindKey', 'curry', 'curryRight', 'debounce',
    'defer', 'delay', 'flip', 'memoize', 'negate', 'once', 'overArgs', 'partial',
    'partialRight', 'rearg', 'rest', 'spread', 'throttle', 'unary', 'wrap',
  ],
  Lang: [
    'castArray', 'clone', 'cloneDeep', 'cloneDeepWith', 'cloneWith', 'conformsTo',
    'eq', 'gt', 'gte', 'isArguments', 'isArray', 'isArrayBuffer', 'isArrayLike',
    'isArrayLikeObject', 'isBoolean', 'isBuffer', 'isDate', 'isElement', 'isEmpty',
    'isEqual', 'isEqualWith', 'isError', 'isFinite', 'isFunction', 'isInteger',
    'isLength', 'isMap', 'isMatch', 'isMatchWith', 'isNaN', 'isNative', 'isNil',
    'isNull', 'isNumber', 'isObject', 'isObjectLike', 'isPlainObject', 'isRegExp',
    'isSafeInteger', 'isSet', 'isString', 'isSymbol', 'isTypedArray', 'isUndefined',
    'isWeakMap', 'isWeakSet', 'lt', 'lte', 'toArray', 'toFinite', 'toInteger',
    'toLength', 'toNumber', 'toPlainObject', 'toSafeInteger', 'toString',
  ],
  Math: [
    'add', 'ceil', 'divide', 'floor', 'max', 'maxBy', 'mean', 'meanBy', 'min',
    'minBy', 'multiply', 'round', 'subtract', 'sum', 'sumBy',
  ],
  Number: ['clamp', 'inRange', 'random'],
  Object: [
    'assign', 'assignIn', 'assignInWith', 'assignWith', 'at', 'create', 'defaults',
    'defaultsDeep', 'entries', 'entriesIn', 'extend', 'extendWith', 'findKey',
    'findLastKey', 'forIn', 'forInRight', 'forOwn', 'forOwnRight', 'functions',
    'functionsIn', 'get', 'has', 'hasIn', 'invert', 'invertBy', 'invoke', 'keys',
    'keysIn', 'mapKeys', 'mapValues', 'merge', 'mergeWith', 'omit', 'omitBy',
    'pick', 'pickBy', 'result', 'set', 'setWith', 'toPairs', 'toPairsIn',
    'transform', 'unset', 'update', 'updateWith', 'values', 'valuesIn',
  ],
  String: [
    'camelCase', 'capitalize', 'deburr', 'endsWith', 'escape', 'escapeRegExp',
    'kebabCase', 'lowerCase', 'lowerFirst', 'pad', 'padEnd', 'padStart', 'parseInt',
    'repeat', 'replace', 'snakeCase', 'split', 'startCase', 'startsWith', 'template',
    'templateSettings', 'toLower', 'toUpper', 'trim', 'trimEnd', 'trimStart',
    'truncate', 'unescape', 'upperCase', 'upperFirst', 'words',
  ],
  Util: [
    'attempt', 'bindAll', 'cond', 'conforms', 'constant', 'defaultTo', 'flow',
    'flowRight', 'identity', 'iteratee', 'matches', 'matchesProperty', 'method',
    'methodOf', 'mixin', 'noConflict', 'noop', 'nthArg', 'over', 'overEvery',
    'overSome', 'property', 'propertyOf', 'range', 'rangeRight', 'runInContext',
    'stubArray', 'stubFalse', 'stubObject', 'stubString', 'stubTrue', 'times',
    'toPath', 'uniqueId',
  ],
  Seq: [
    'chain', 'tap', 'thru', 'wrapperAt', 'wrapperChain', 'wrapperCommit',
    'wrapperNext', 'wrapperPlant', 'wrapperReverse', 'wrapperToIterator',
    'wrapperValue',
  ],
};

// Internal lodash._ packages (can't be derived from categories)
const internalPackages = [
  'lodash._reinterpolate', 'lodash._basecopy', 'lodash._isiterateecall',
  'lodash._root', 'lodash._basetostring', 'lodash._bindcallback',
  'lodash._getnative', 'lodash._baseassign', 'lodash._createset',
  'lodash._createassigner', 'lodash._objecttypes', 'lodash._reevaluate',
  'lodash._baseuniq', 'lodash._basevalues', 'lodash._reescape',
  'lodash._baseiteratee', 'lodash._baseflatten', 'lodash._shimkeys',
  'lodash._basefor', 'lodash._arrayeach', 'lodash._basecreate',
  'lodash._basebind', 'lodash._baseclone', 'lodash._stringtopath',
  'lodash._baseisequal', 'lodash._createwrapper', 'lodash._setbinddata',
  'lodash._slice', 'lodash._reunescapedhtml', 'lodash._basecallback',
  'lodash._arraycopy', 'lodash._escapestringchar', 'lodash._isnative',
  'lodash._baseindexof', 'lodash._cacheindexof', 'lodash._pickbycallback',
  'lodash._escapehtmlchar', 'lodash._baseeach', 'lodash._basecreatewrapper',
  'lodash._pickbyarray', 'lodash._createcache', 'lodash._renative',
  'lodash._basecreatecallback', 'lodash._htmlescapes', 'lodash._arraypool',
  'lodash._basedifference', 'lodash._basefind', 'lodash._replaceholders',
  'lodash._getarray', 'lodash._maxpoolsize', 'lodash._basefindindex',
  'lodash._arraymap', 'lodash._createcompounder', 'lodash._topath',
  'lodash._releasearray', 'lodash._basefilter', 'lodash._baseget',
  'lodash._baseismatch', 'lodash._basematches', 'lodash._arrayfilter',
  'lodash._baseeachright', 'lodash._stack', 'lodash._baseforright',
  'lodash._baseslice', 'lodash._basereduce', 'lodash._basecompareascending',
  'lodash._createaggregator', 'lodash._basesortby', 'lodash._shimisplainobject',
  'lodash._invokepath', 'lodash._createpadding', 'lodash._setcache',
  'lodash._basemerge', 'lodash._cachepush', 'lodash._getobject',
  'lodash._basefunctions', 'lodash._largearraysize', 'lodash._toiterable',
  'lodash._arrayevery', 'lodash._basepullat', 'lodash._objectpool',
  'lodash._releaseobject', 'lodash._keyprefix', 'lodash._binaryindexby',
  'lodash._charsleftindex', 'lodash._trimmedrightindex', 'lodash._binaryindex',
  'lodash._basesortbyorder', 'lodash._baserandom', 'lodash._charsrightindex',
  'lodash._trimmedleftindex', 'lodash._arrayincludeswith', 'lodash._cachehas',
  'lodash._arrayincludes', 'lodash._charatcallback', 'lodash._baseset',
  'lodash._mapcache', 'lodash._baseat', 'lodash._basedelay',
  'lodash._baseintersection', 'lodash._createbound', 'lodash._noop',
  'lodash._baseproperty', 'lodash._basepullall', 'lodash._basematchesproperty',
  'lodash._unescapehtmlchar', 'lodash._basesorteduniqby', 'lodash._basesortedindexby',
  'lodash._compareascending', 'lodash._basepullallby', 'lodash._reescapedhtml',
  'lodash._createcomposer', 'lodash._basexor', 'lodash._charsendindex',
  'lodash._charsstartindex', 'lodash._arraymin', 'lodash._lodashwrapper',
  'lodash._createextremum', 'lodash._arraymax', 'lodash._basesorteduniq',
  'lodash._basetonumber', 'lodash._createpad', 'lodash._htmlunescapes',
  'lodash._createobject',
];

// Legacy/deprecated method packages
const legacyPackages = [
  'lodash.restparam', 'lodash.support', 'lodash.pairs', 'lodash.where',
  'lodash.pluck', 'lodash.sortbyorder', 'lodash.sortbyall', 'lodash.trunc',
  'lodash.findwhere', 'lodash.indexby',
  'lodash.reevaluate', 'lodash.reescape', 'lodash.reinterpolate',
];

// Derive all method packages from categories (skipping aliases)
const methodPackages = (() => {
  const methods = [];
  const seen = new Set();
  for (const [category, methodList] of Object.entries(categories)) {
    for (const method of methodList) {
      if (aliases.has(method)) continue;
      const pkg = `lodash.${method.toLowerCase()}`;
      if (seen.has(pkg)) continue;
      seen.add(pkg);
      methods.push({ method, pkg, category });
    }
  }
  return methods;
})();

const allPackageNames = [
  ...corePackages,
  ...methodPackages.map(m => m.pkg),
  ...legacyPackages,
  ...internalPackages,
];

// --- Data ---

function getDownloads(pkg) {
  return downloadCounts[pkg] || 0;
}

function withDownloads(packages) {
  return packages
    .map(pkg => ({ pkg, monthly: getDownloads(pkg) }))
    .filter(s => s.monthly > 0);
}

function loadStats() {
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
    `  ${formatNum(daily)}/day`,
    `  ${formatNum(weekly)}/week`,
    `  ${formatNum(grandTotal)}/month`,
  ];

  if (args.silly) {
    const perSecond = Math.round(grandTotal / 30 / 24 / 60 / 60);
    const perMinute = Math.round(grandTotal / 30 / 24 / 60);
    const perHour = Math.round(grandTotal / 30 / 24);
    lines.splice(1, 0,
      `  ${formatNum(perSecond)}/second`,
      `  ${formatNum(perMinute)}/minute`,
      `  ${formatNum(perHour)}/hour`,
    );
  }

  return lines.join('\n');
}

function cmdTop(stats, overrides = {}) {
  const n = parseInt(positionals[1] || args.top, 10) || 20;
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
  const categoryOrder = Object.keys(categories).filter(c => c !== 'Seq');
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
  const stats = loadStats();

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

  if (args.help || command === 'help') {
    console.log(`Usage: lodash-stats <command> [options]

Commands:
  top [N]              Top N packages by downloads (default: 20)
  total                Grand total across all packages
  graph                Bar chart of download share
  search <term>        Search packages by name
  category [name]      List categories, or filter to one (alias: cat)
  list                 List all package names (alias: ls)
  markdown             Full report in markdown (alias: md)
  help                 Show this help

Options:
  -t, --top <N>        Limit number of results
  -c, --category <name> Filter by category
  -s, --search <term>  Filter by name
      --sort <field>   Sort by: count (default), name
      --json           Output as JSON
      --silly          Show per-second stats (with total)
      --total          Shorthand for total command
      --graph          Shorthand for graph command
  -h, --help           Show this help`);
    return;
  }

  // Flags as shorthand for commands
  if (args.total) return console.log(cmdTotal(stats));
  if (args.graph) return console.log(cmdGraph(stats));

  const handler = commands[command];
  if (!handler) {
    console.log(`Unknown command: ${command}`);
    console.log(`Available: ${Object.keys(commands).join(', ')}`);
    process.exit(1);
  }

  console.log(handler(stats));
  await updateCheck;
}

main();
