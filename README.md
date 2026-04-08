# lodash-stats CLI

A CLI for querying lodash ecosystem download stats across 440+ packages.

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
# Lodash total downloads (all 440 packages):
#   4.6B/month
#   1.1B/week
#   152.6M/day
```
Pass `--silly` to see hour/minute/second breakdown as well.

```bash
lodash-stats total --silly
# Lodash total downloads (all 440 packages):
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

  Other (446+ pkgs)      ████████████████████████████████████████ 2.9B (62.5%)
  lodash                 ████████ 555.7M (12.1%)
  lodash.merge           █████ 346.2M (7.6%)
  lodash.isplainobject   ███ 215.3M (4.7%)
  lodash.debounce        ██ 163.9M (3.6%)
  lodash.once            ██ 158.4M (3.5%)
  lodash.isstring        ██ 154.6M (3.4%)
  lodash-es              ██ 124.3M (2.7%)

  ────────────────────────────────────────────────────────
  Total: 4.6B/month across 440 packages


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
| `--json` | | Output as JSON |
| `--silly` | | Show downloads down to per-second (use with `total`) |
| `--no-cache` | | Skip cache, fetch fresh data from npm |

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
