import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildScoutCursorMcpEntry,
  getCursorMcpConfigPath,
  installCursorScout,
  upsertScoutMcpServer,
} from "./install.mjs";

describe("buildScoutCursorMcpEntry", () => {
  it("builds a Cursor stdio MCP server entry", () => {
    assert.deepEqual(
      buildScoutCursorMcpEntry({
        command: "/tmp/scout",
        args: ["mcp", "--context-root", "${workspaceFolder}"],
      }),
      {
        type: "stdio",
        command: "/tmp/scout",
        args: ["mcp", "--context-root", "${workspaceFolder}"],
      },
    );
  });
});

describe("upsertScoutMcpServer", () => {
  it("adds scout while preserving other MCP servers", () => {
    const result = upsertScoutMcpServer(
      {
        mcpServers: {
          docs: {
            type: "stdio",
            command: "docs",
            args: [],
          },
        },
      },
      {
        type: "stdio",
        command: "scout",
        args: ["mcp"],
      },
    );

    assert.equal(result.changed, true);
    assert.deepEqual(result.config.mcpServers.docs, {
      type: "stdio",
      command: "docs",
      args: [],
    });
    assert.deepEqual(result.config.mcpServers.scout, {
      type: "stdio",
      command: "scout",
      args: ["mcp"],
    });
  });

  it("blocks replacing a different scout entry without force", () => {
    const result = upsertScoutMcpServer(
      {
        mcpServers: {
          scout: {
            type: "stdio",
            command: "/old/scout",
            args: ["mcp"],
          },
        },
      },
      {
        type: "stdio",
        command: "/new/scout",
        args: ["mcp"],
      },
    );

    assert.equal(result.changed, false);
    assert.equal(result.blocked, true);
  });

  it("treats portable and resolved scout commands as equivalent", () => {
    const result = upsertScoutMcpServer(
      {
        mcpServers: {
          scout: {
            type: "stdio",
            command: "scout",
            args: ["mcp", "--context-root", "${workspaceFolder}"],
          },
        },
      },
      {
        type: "stdio",
        command: "/Users/arach/.bun/bin/scout",
        args: ["mcp", "--context-root", "${workspaceFolder}"],
      },
    );

    assert.equal(result.changed, false);
    assert.equal(result.blocked, undefined);
  });
});

describe("installCursorScout", () => {
  it("writes project config", () => {
    const projectPath = mkdtempSync(join(tmpdir(), "cursor-scout-project-"));
    const result = installCursorScout({
      scope: "project",
      projectPath,
      launch: {
        command: "scout",
        args: ["mcp", "--context-root", "${workspaceFolder}"],
      },
    });

    const configPath = getCursorMcpConfigPath({ projectPath });
    const written = JSON.parse(readFileSync(configPath, "utf8"));

    assert.equal(result.status, "changed");
    assert.deepEqual(written.mcpServers.scout, {
      type: "stdio",
      command: "scout",
      args: ["mcp", "--context-root", "${workspaceFolder}"],
    });
  });

  it("preserves existing JSON when forced", () => {
    const projectPath = mkdtempSync(join(tmpdir(), "cursor-scout-project-"));
    const configPath = getCursorMcpConfigPath({ projectPath });
    mkdirSync(join(projectPath, ".cursor"), { recursive: true });
    writeFileSync(
      configPath,
      JSON.stringify({
        mcpServers: {
          scout: {
            type: "stdio",
            command: "old",
            args: ["mcp"],
          },
          other: {
            type: "stdio",
            command: "other",
            args: [],
          },
        },
      }),
    );

    const result = installCursorScout({
      scope: "project",
      projectPath,
      force: true,
      launch: {
        command: "scout",
        args: ["mcp", "--context-root", "${workspaceFolder}"],
      },
    });
    const written = JSON.parse(readFileSync(configPath, "utf8"));

    assert.equal(result.status, "changed");
    assert.equal(written.mcpServers.other.command, "other");
    assert.equal(written.mcpServers.scout.command, "scout");
  });
});
