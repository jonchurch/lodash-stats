// Lodash package registry — all package names derived from method categories

// Core packages (not derivable from method categories)
export const corePackages = [
  'lodash', 'lodash-es', 'lodash-compat', 'lodash-amd', 'lodash-cli',
  'lodash-webpack-plugin', 'lodash-migrate', 'lodash-doc-globals',
  'babel-plugin-lodash',
];

// Aliases share a package with another method — skip when deriving package names
const aliases = new Set([
  'each', 'eachRight', 'entries', 'entriesIn', 'extend', 'extendWith',
]);

// All lodash methods organized by category (from lodash v4.18.1 docs)
export const categories = {
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
    'methodOf', 'mixin', 'noop', 'nthArg', 'over', 'overEvery',
    'overSome', 'property', 'propertyOf', 'range', 'rangeRight',
    'stubArray', 'stubFalse', 'stubObject', 'stubString', 'stubTrue', 'times',
    'toPath', 'uniqueId',
  ],
};

// Internal lodash._ packages (can't be derived from categories)
export const internalPackages = [
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
export const legacyPackages = [
  'lodash.restparam', 'lodash.support', 'lodash.pairs', 'lodash.where',
  'lodash.pluck', 'lodash.sortbyorder', 'lodash.sortbyall', 'lodash.trunc',
  'lodash.findwhere', 'lodash.indexby',
  'lodash.reevaluate', 'lodash.reescape', 'lodash.reinterpolate',
];

// Derive all method packages from categories (skipping aliases)
export const methodPackages = (() => {
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

export const allPackageNames = [
  ...corePackages,
  ...methodPackages.map(m => m.pkg),
  ...legacyPackages,
  ...internalPackages,
];
