# Security Policy

## Supported versions

Only the latest released version of `siyuan-mcp-server` is considered supported for security fixes.

## What this project is

This project is a high-privilege MCP integration for SiYuan Note. Once configured, it can read and write your SiYuan data through the same API token you provide to the client.

Important implications:

- treat `SIYUAN_TOKEN` like a secret
- prefer the default local endpoint at `http://127.0.0.1:6806`
- if you override `SIYUAN_BASE_URL` with a non-local address, your token and note content will be sent there
- if that target is non-HTTPS, the traffic may be exposed in transit

## Reporting a vulnerability

Please report security issues privately before opening a public issue.

Preferred path:

1. Open a GitHub Security Advisory if the repository has advisories enabled.
2. If that is not available, open a private maintainer contact through the repository owner profile or other clearly published contact channel.

When reporting, include:

- affected version or commit
- reproduction steps
- impact assessment
- whether the issue requires a non-default configuration

## Scope notes

The SQL tool is intentionally restricted to a single read-only `SELECT` statement. If you find a bypass that allows writes, schema changes, or multiple statements to reach the SiYuan SQL endpoint, please treat it as a security bug.
