# Agent Instructions

Cursor Scout is the Cursor-facing companion integration for OpenScout.

Keep the Scout-owned MCP server in OpenScout. This repository should package
Cursor configuration, installation helpers, docs, and host-specific guidance
that make Cursor launch `scout mcp`.

Do not reimplement Scout broker tools here unless the Cursor host requires a
thin compatibility wrapper. The canonical tool surface is the `scout mcp`
stdio server provided by OpenScout.

OpenScout is currently for high-trust local developer pilots. Do not claim
enterprise readiness, compliance readiness, hardened multi-tenant security, or
guaranteed distributed delivery.

Use the narrowest relevant check:

```bash
bun run check
```
