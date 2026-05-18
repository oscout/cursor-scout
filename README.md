# Cursor Scout

Cursor Scout packages OpenScout for Cursor through Cursor's MCP configuration.

The repository is named `cursor-scout`; the MCP server name is `scout`. Cursor
launches OpenScout's existing stdio MCP server:

```bash
scout mcp
```

This repo does not implement a second Scout MCP server. It provides the Cursor
host packaging, config, docs, and install helpers.

Website: <https://arach.github.io/cursor-scout/>

Repository: <https://github.com/arach/cursor-scout>

## Included Surfaces

- `.cursor/mcp.json`: project-level Cursor MCP config for local testing
- `scripts/install.mjs`: installer for Cursor global or project MCP config
- `docs/index.html`: static project page for GitHub Pages

## Prerequisites

- Cursor or `cursor-agent` with MCP support
- OpenScout installed and set up locally
- A running Scout broker
- `scout` on `PATH`, or Bun available so the installer can fall back to
  `bunx @openscout/scout`

Recommended local setup:

```bash
bun add -g @openscout/scout
scout setup
scout up
```

## Install Globally

From this repository:

```bash
bun run install:global
```

That writes or updates:

```text
~/.cursor/mcp.json
```

with a `scout` MCP server entry. Cursor and `cursor-agent` both use Cursor's
`mcp.json` configuration.

To preview the write:

```bash
bun run install:global -- --dry-run
```

To replace an existing non-matching `scout` entry:

```bash
bun run install:global -- --force
```

If Cursor logs `ERR_UNSUPPORTED_ESM_URL_SCHEME` for protocol `bun:`, Cursor is
launching a stale Node-backed Scout shim. Re-run the installer with `--force` so
it probes local `scout` commands and writes a Bun-backed `@openscout/scout`
entry:

```bash
bun run install:global -- --force
```

## Install Per Project

To install into the current project:

```bash
bun run install:project
```

This writes:

```text
.cursor/mcp.json
```

Project config is useful when you want Scout available only for a specific
workspace.

## Manual Config

Cursor's MCP config shape is:

```json
{
  "mcpServers": {
    "scout": {
      "type": "stdio",
      "command": "scout",
      "args": ["mcp", "--context-root", "${workspaceFolder}"]
    }
  }
}
```

If Cursor cannot find `scout`, use an absolute command path or run the installer,
which resolves the command from common local install paths.

## Validate

```bash
bun run check
cursor-agent mcp list
cursor-agent mcp list-tools scout
```

## Current Limits

- Events and MCP notifications only arrive while Cursor keeps the MCP server
  process alive.
- Cursor host notification behavior may differ between the editor and
  `cursor-agent`; durable Scout flights and messages remain the source of truth.
- This is an experimental local developer package.
