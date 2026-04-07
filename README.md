# lodash-stats CLI

A CLI for querying lodash ecosystem download stats across 450+ packages.

## Usage

```bash
node lodash-stats.mjs <command> [options]
```

## Commands

### `top [N]`

Show the top N packages by download count. Defaults to 20. Includes core packages (`lodash`, `lodash-es`), method packages (`lodash.merge`, etc.), and legacy packages.

```bash
node lodash-stats.mjs top        # top 20
node lodash-stats.mjs top 5      # top 5
```

### `total`

Show grand total downloads across all lodash packages.

```bash
node lodash-stats.mjs total
# Lodash total downloads (all 453 packages):
#   126.7M/day
#   887.2M/week
#   3.8B/month
```

### `graph`

Show a bar chart of download share across the ecosystem.

```bash
node lodash-stats.mjs graph
```

### `search <term>`

Search packages by name.

```bash
node lodash-stats.mjs search debounce
```

### `category [name]`

List all categories, or show packages in a specific category.

```bash
node lodash-stats.mjs category              # list categories
node lodash-stats.mjs category Function      # packages in Function
```

`cat` is an alias for `category`.

### `markdown`

Output a full report in markdown format. Useful for saving to a file.

```bash
node lodash-stats.mjs markdown > LODASH_STATS.md
```

`md` is an alias for `markdown`.

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--sort <count\|name>` | | Sort by download count (default) or name |
| `--category <name>` | `-c` | Filter to a specific category |
| `--search <term>` | `-s` | Filter packages by name |
| `--top <N>` | `-t` | Limit number of results |
| `--json` | | Output as JSON |
| `--total` | | Shorthand for `total` command |
| `--graph` | | Shorthand for `graph` command |
| `--silly` | | Show downloads down to per-second (use with `total`) |

## Examples

```bash
# Top 5 packages overall
node lodash-stats.mjs top 5

# Function category sorted by name
node lodash-stats.mjs category Function --sort name

# Search with JSON output
node lodash-stats.mjs search clone --json

# Per-second stats
node lodash-stats.mjs total --silly

# Save markdown report
node lodash-stats.mjs md > LODASH_STATS.md
```

## npm scripts

```bash
npm run stats          # default (top 20)
npm run stats:total    # total downloads
npm run stats:graph    # bar chart
npm run stats:save     # save markdown report
```

## Data Source

Download counts come from the [`download-counts`](https://github.com/nice-registry/download-counts) npm package, which bundles monthly npm download data. The CLI checks for newer versions on startup and warns if your data is outdated.
