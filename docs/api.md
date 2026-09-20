# API Reference
Base URL `/api` · JSON · `Authorization: Bearer <jwt>` · **Owner: Member 2** (Ledger section: Member 4)

**Envelope** — success `{ "data": …, "error": null }` · failure `{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "…" } }`
Codes: `VALIDATION_ERROR` 400 · `UNAUTHENTICATED` 401 · `FORBIDDEN` 403 · `NOT_FOUND` 404 · `CONFLICT` 409 · `RULE_VIOLATION` 422 · `INTERNAL_ERROR` 500
Pagination: `?page=1&limit=20` → `{ items, page, limit, total }` · Money: strings with 2 decimals (`"1500.00"`) · Keys: camelCase
Legend:  public ·  logged in ·  ORGANIZER ·  ADMIN. Each router defines its full path and is mounted at `/api`.

## Auth & users
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /auth/register |  | `{name,email,password,role}` role ∈ CONTRIBUTOR/ORGANIZER |
| POST | /auth/login |  | → `{ token, user }` |
| GET | /auth/me |  | current user |
| GET | /users |  | list users |

## Campaigns
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /campaigns |  | filters `category, q, status`; default ACTIVE + CLOSED |
| GET | /campaigns/mine |  | own campaigns (register before `/campaigns/:id`) |
| GET | /campaigns/pending |  | approval queue |
| GET | /campaigns/:id |  | |
| POST | /campaigns |  | creates DRAFT: `{title,description,category,goalAmount,startDate?,endDate?}` |
| PATCH | /campaigns/:id |  owner | DRAFT/REJECTED only |
| POST | /campaigns/:id/submit |  owner | → PENDING_APPROVAL |
| POST | /campaigns/:id/approve |  | → ACTIVE + ledger `CAMPAIGN_APPROVED` |
| POST | /campaigns/:id/reject |  | `{reason}` → REJECTED |
| POST | /campaigns/:id/close |  | → CLOSED + ledger `CAMPAIGN_CLOSED` |

## Donations
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /campaigns/:campaignId/donations |  | `{amount, donorName?, donorEmail?, isAnonymous}` → mock payment → CONFIRMED + ledger. Response includes `ledgerIndex`, `ledgerHash` |
| GET | /campaigns/:campaignId/donations |  | paginated; anonymous masked |
| GET | /donations/me |  | my donations |
| GET | /donations/:id/receipt |  owner | donation + ledger index + hash |

## Allocations
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /campaigns/:campaignId/allocations |  owner | `{purpose, description?, amount}` |
| GET | /campaigns/:campaignId/allocations |  | each with `utilized`, `remaining` |
| GET | /allocations/pending |  | queue |
| POST | /allocations/:id/approve |  | rule 2 re-check; ledger `ALLOCATION_APPROVED` |
| POST | /allocations/:id/reject | 🛡 | `{note}` |

## Expenses
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /allocations/:allocationId/expenses |  owner | multipart: `amount, vendor, description, spentAt, receipt(file)` |
| GET | /campaigns/:campaignId/expenses |  | receipt URL only for VERIFIED |
| GET | /expenses/pending |  | queue |
| POST | /expenses/:id/verify |  | rule 3 re-check; ledger `EXPENSE_VERIFIED` |
| POST | /expenses/:id/reject |  | `{note}` |

## Dashboard
| Method | Path | Access | Response |
|---|---|---|---|
| GET | /dashboard/summary |  | `{ totalCampaigns, activeCampaigns, totalDonors, collected, allocated, utilized, recentActivity[] }` |
| GET | /dashboard/campaigns/:id |  | `{ collected, allocated, utilized, unallocated, unspent, goal, percentFunded, byPurpose[{purpose,allocated,utilized}], timeline[{date,collected,utilized}] }` |
| GET | /dashboard/campaigns/:id/flow |  | `{ nodes[], links[] }` Donations → Campaign → Allocations → Expenses |
| GET | /dashboard/top-campaigns |  | ranked by utilized / collected |

## Ledger (Member 4)
| Method | Path | Access | Response |
|---|---|---|---|
| GET | /ledger | | paginated entries; filters `campaignId, type` |
| GET | /ledger/head |  | `{ index, hash }` |
| GET | /ledger/verify |  | `{ valid, checkedEntries, headHash, firstBrokenIndex, reason }` |
| GET | /ledger/:index |  | one entry |
| GET | /campaigns/:campaignId/ledger |  | entries for a campaign |
| GET | /campaigns/:campaignId/reconcile |  | `{ donations:{ledger,database,match}, allocations:{…}, expenses:{…}, match }` |

Ledger entry JSON: `{ index, type, campaignId, refType, refId, amount, payload, timestamp, prevHash, hash }`

## Changing the contract
Edit this file in the same PR as the code and tag the consumer (usually Member 1). Consumers must not depend on unlisted fields.
