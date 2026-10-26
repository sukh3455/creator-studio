# Automated Testing Guide

Creator Studio comes equipped with a Vitest test suite verifying creative planning, deterministic template generation, SSRF security validation, database persistence, and cost safeguards.

---

## Running Tests

Execute the automated test suite with:

```bash
npm test
```

Or run Vitest in watch mode during development:

```bash
npx vitest
```

---

## Test Suite Coverage

| Test Suite | File | What is Tested |
| :--- | :--- | :--- |
| **Creative Planning** | [`tests/creativePlanner.test.ts`](../tests/creativePlanner.test.ts) | Sukh Graphix Diwali Reel planning, offline deterministic fallback, 15-second duration budget verification, scene regeneration, approval flag reset. |
| **SSRF Security** | [`tests/safeUrlValidator.test.ts`](../tests/safeUrlValidator.test.ts) | Public HTTPS validation, loopback blocking, cloud metadata blocking (169.254.169.254), RFC 1918 private IP blocking, protocol blocking (`file://`, `gopher://`). |
| **Database Persistence** | [`tests/databaseProvider.test.ts`](../tests/databaseProvider.test.ts) | Project CRUD, sample project initialization, asset saving/deleting, render queue state transitions (pending -> rendering -> completed). |
| **Settings & Cost Guards** | [`tests/settingsAndCostGuards.test.ts`](../tests/settingsAndCostGuards.test.ts) | Provider validation reporting, free-only AI safeguard blocking paid models, missing API key handling. |
