# K33P NOK Integration — Progress

_Status tracker for wiring the Midnight Next-Of-Kin (NOK) contract into K33P._
_Mobile changes live here (keepmobile); backend changes live in `K33P_Smart_Contract` (see its `backend/NOK_INTEGRATION.md`)._

## Architecture

```
keepmobile (NOK screens)  ──HTTP──▶  backend /api/nok/*  ──▶  Midnight NOK contract (preview)
                                     (admin: holds secret + funding wallet)
```

The mobile app never touches the contract or the admin secret. It only calls
the backend, which is the contract admin.

## Phase status

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Verify reused **preview** deployment (`0ac8f33d…`) | Done — deployment record + compiled ZK assets confirmed. Live proof-server check pending (Phase 4). |
| 1 | Backend NOK service + `/api/nok` route (in `K33P_Smart_Contract`) | Done (code) — needs `npm install` + build + proof server + funded wallet to run. |
| 2 | Mobile NOK API layer (`utils/nok.ts`) | Done. |
| 3 | Wire mobile NOK screens | Done (register wired; approve best-effort — see limitations). |
| 4 | End-to-end test on preview | Pending — requires proof server + funded wallet. |
| 5 | Progress/handoff docs | Done (this file + backend `NOK_INTEGRATION.md`). |

## What changed in keepmobile

- **`utils/nok.ts`** (new) — NOK API client: `registerNok`, `approveNokLogin`, `checkNokRegistered`. Calls the backend at `http://localhost:3000/api` and uses the auth token from `@/store/useAuthMethod`.
- **`app/(auth)/sign-up-nok/over18/secret-question/index.tsx`** — calls `registerNok(nokPhoneNumber)` before showing the "NOK registered" success modal.
- **`app/(auth)/sign-up-nok/under18/biometric/capture/index.tsx`** — calls `registerNok(nokPhoneNumber)` after ID capture.
- **`app/(auth)/sign-in-nok/fingerprint/index.tsx`** — calls `approveNokLogin(...)` on biometric success and gates navigation on the result.

## Identifier mapping

- `owner_identifier = ownerIdentifierToField(userId)` — derived on the backend from the authenticated user.
- `nok_hash = nokHashToField(nokIdentifier)` — derived from the NOK's phone number.

## Known limitations / remaining items

1. **App build blocker (out of scope):** many files import a missing `@/utils/*`
   module dir (api, wallet-api, crypto, payment, …). The app won't compile
   end-to-end until those are restored. Editor lint errors like
   "Cannot find module 'react'" / "--jsx not set" stem from this + uninstalled
   `node_modules`, not from the NOK changes.
2. **NOK sign-in identifiers:** the `sign-in-nok` flow only captures the owner's
   phone, not the NOK's own identifier. `approveNokLogin` is therefore
   best-effort: it runs only when both identifiers are present and does not
   block the (prototype) flow otherwise. To make approval enforce correctly:
   - Capture the NOK's own identifier in the `sign-in-nok` flow.
   - Ensure the owner identifier sent matches what was used at registration —
     either send the K33P `userId`, or have the backend resolve phone → userId.
3. **Backend base URL** is hardcoded (`http://localhost:3000/api`) to match the
   rest of the app; move to config/env when unblocking the build.
4. **Admin secret** for the reused preview deployment is committed in
   `Contract/nok_compact_deployment.md` — rotate for production.

## How to run (local)

1. Backend: follow `K33P_Smart_Contract/backend/NOK_INTEGRATION.md` (build the
   contract + CLI, set NOK env vars, start proof server, start backend).
2. Mobile: `npm install && npx expo start` (subject to item 1 above).

## Fork & PR

- Mobile changes → fork `K33P-repo/K33P-mobile`, branch `feat/nok-integration`, PR to `main`.
- Backend changes → `K33P_Smart_Contract` via `myfork` (paranormal39), branch `feat/nok-backend`.
