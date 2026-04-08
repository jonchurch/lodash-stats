# lodash-stats CLI

A CLI for querying lodash ecosystem download stats across 450+ packages.

## Usage

```bash
lodash-stats <command> [options]
```

## Data Source & Methodology

Download counts are fetched live from the [npm registry downloads API](https://github.com/npm/registry/blob/main/docs/download-counts.md) (`/downloads/point/last-month`), which returns the total number of installs over a rolling 30-day window. Weekly, daily, and per-second figures are estimated by dividing the monthly total, they are not independently measured. Results are cached to the system's temp dir for 1 hour to avoid redundant API calls.

## Commands

### `top [N]`

Show the top N packages by download count. Defaults to 20. Includes core packages (`lodash`, `lodash-es`), method packages (`lodash.merge`, etc.), and legacy packages.

```bash
lodash-stats top        # top 20
lodash-stats top 5      # top 5
```

### `total`

Show grand total downloads across all lodash packages.

```bash
lodash-stats total
# Lodash total downloads (all 453 packages):
#   3.8B/month
#   887.2M/week
#   126.7M/day
```
Pass `--silly` to see hour/minute/second breakdown as well.

```bash
lodash-stats total --silly
# Lodash total downloads (all 453 packages):
#  4.6B/month
#  1.1B/week
#  152.6M/day
#  6.4M/hour
#  106.0K/minute
#  1.8K/second
```

### `graph`

Show a bar chart of download share across the ecosystem.

```bash
lodash-stats graph
```

Outputs a simple bar chart in stdout:

```txt

  Lodash Ecosystem Download Share
  ════════════════════════════════════════════════════════

  Other (446+ pkgs)      ████████████████████████████████████████ 2.4B (63.0%)
  lodash                 ████████ 452.4M (11.9%)
  lodash.merge           █████ 279.1M (7.3%)
  lodash.isplainobject   ███ 163.7M (4.3%)
  lodash.debounce        ██ 140.6M (3.7%)
  lodash.once            ██ 134.3M (3.5%)
  lodash.isstring        ██ 130.7M (3.4%)
  lodash-es              ██ 106.9M (2.8%)

  ────────────────────────────────────────────────────────
  Total: 3.8B/month across 453 packages


```

### `search <term>`

Search packages by name.

```bash
lodash-stats search debounce
```

### `category [name]`

List all categories, or show packages in a specific category.

```bash
lodash-stats category              # list categories
lodash-stats category Function      # packages in Function
```

`cat` is an alias for `category`.

### `markdown`

Output a full report in markdown format. Useful for saving to a file.

```bash
lodash-stats markdown > LODASH_STATS.md
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
lodash-stats top 5

# Function category sorted by name
lodash-stats category Function --sort name

# Search with JSON output
lodash-stats search clone --json

# Monthly, weekly, daily, hourly, and per second stats
lodash-stats total --silly

# Save markdown report
lodash-stats md > LODASH_STATS.md
```
