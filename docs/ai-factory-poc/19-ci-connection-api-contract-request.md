# CI connection API contract request — US-019 / T3.6

> **Status:** Proposed for Backend/Product/QA agreement — no CI connection API is published or agreed yet
>
> **Frontend Jira:** [EPMRPP-122050](https://jiraeu.epam.com/browse/EPMRPP-122050) · 12 h
> (4 h research / 5 h contract / 3 h validation)
>
> **Parent story:** [EPMRPP-121842](https://jiraeu.epam.com/browse/EPMRPP-121842) — US-019 Connect
> pipeline to CI
>
> **Audience:** ReportPortal Backend/API, Product, QA, Security and Service UI owners
>
> **Implementation gate:** this proposal must be copied into, reviewed and accepted in
> `reportportal-requirements/domains/projects/df_bootcamp_2026/contracts/` before runtime T3.6 starts.
> This `service-ui` document is a handoff/request, not the authoritative approved contract.

## 1. Problem Statement table

| # | Date | Problem statement & Description | Source | Author | Description | Jira |
|---|---|---|---|---|---|---|
| 1 | 2026-10-05 | US-019 requires Organization Managers and Instance Administrators to configure and test a Pipeline's CI connection, but the audited OpenAPI contains no read/save/test CI connection operations or DTOs. Implementing the UI now would invent transport, secret-handling, authorization and state semantics. | US-019, accepted D15, T3.6, published Pipeline API audit | Saveli Savich / FE handoff | Agree an end-to-end, server-authoritative CI connection contract before runtime integration. The contract must safely support repository, branch, credential, jobs, models and environments; expose only non-secret/masked read data; and gate dependent actions consistently. | [EPMRPP-121842](https://jiraeu.epam.com/browse/EPMRPP-121842), [EPMRPP-122050](https://jiraeu.epam.com/browse/EPMRPP-122050) |

## 2. Assumptions and agreements table

| # | Assumptions and agreements |
|---|---|
| 1 | **Proposed identity rule:** a CI connection is keyed by `{projectKey, pipelineId}` and must be owned by that Pipeline within that project; it is not a browser-global or user-global setting. Backend/Product must accept the immutable-identity and non-enumeration rules. |
| 2 | **Accepted Product decision (D15):** only Organization Manager and Instance Administrator may manage or test the connection. Editor and Viewer cannot mutate it. Backend authorization is mandatory; hiding or disabling FE controls is UX only. |
| 3 | **Proposed state contract:** the UI has three user-facing aggregate states — **Not connected**, **Connected**, and **Connection failed** — backed by explicit machine states. Product/BE must accept the enum and transition rules before implementation. |
| 4 | **Proposed security invariant:** the trigger credential is write-only. It must never be returned after save, placed in a URL, shown in logs/audit payloads or reconstructed by the FE. A read response should expose only `credentialConfigured: boolean` plus explicitly approved non-secret metadata. Security/BE acceptance is required. |
| 5 | **Proposed scope boundary:** Push to agent, Automate, Re-run and Retry should depend on an effective Connected state. T1.2u should consume a minimal capability projection, while T4.4 remains separately blocked by the US-020 command contract. Product/BE must accept the capability and recheck semantics. |
| 6 | **Proposed contract:** the endpoint family and DTOs in sections 5–7 are a concrete starting point, not evidence of an already-published API. Backend may propose equivalent names/shapes if all invariants and acceptance criteria remain satisfied. |
| 7 | **Proposed transport baseline:** all authenticated operations use the normal ReportPortal bearer session through a trusted same-origin HTTPS `/api` route. HTTP, TLS bypass and browser-to-CI-provider direct credential calls are forbidden. |
| 8 | **Proposed persistence rule:** save and test are separate operations. Saving validates/persists configuration; testing performs a bounded server-side probe and updates the last-test state. Save does not silently trigger external CI work unless Product explicitly chooses and documents that behavior. Every material save or credential rotation invalidates `CONNECTED` until a successful test. |
| 9 | **Proposed concurrency rule:** reads return a version token; save uses optimistic concurrency and rejects a stale write. The FE refetches after every successful mutation or conflict. |
| 10 | **Proposed idempotency rule:** save and test use an `Idempotency-Key` header with the contract in §6.3; retries/double-clicks must not create parallel probes or ambiguous save results. |
| 11 | **Non-goal:** this task does not implement UI/runtime code, provision credentials, execute a live connection test, change demo data, define CI-provider administration or make LP6 a browser Re-run endpoint. |
| 12 | **Non-goal:** the contract does not define source-code repository browsing, webhook creation, arbitrary custom scripts, multiple active connections per Pipeline or secret retrieval/export. Credential rotation/revocation/disconnect lifecycle is in scope, but external provider administration beyond that lifecycle is not. |

## 3. Designs table

| Name / Description | Link |
|---|---|
| Existing Pipeline settings modal (T3.4) is the host surface; US-019 adds the CI connection section | [Implementation plan — T3.4/T3.6](04-implementation-plan.md#phase-3--review-loop-us-011-013-005-012-019) |
| Requirements digest and accepted D15 roles | [Knowledge base — US-019](01-knowledge-base.md#new-stories-not-in-the-original-17) |
| No separate approved Figma artifact is recorded for T3.6 | Open — Product/Design to link an approved artifact if one exists |

## 4. Functional Requirements table

| ID | Name | Description | Link to test case | Status |
|---|---|---|---|---|
| CIConnection_1 | Read CI connection | Read one Pipeline's non-secret connection configuration and effective state. | [TC-CIC-001–004](#11-contract-validation-cases) | Proposed |
| CIConnection_2 | Save CI connection | Validate and persist configuration without returning or logging the credential. | [TC-CIC-005–010](#11-contract-validation-cases) | Proposed |
| CIConnection_3 | Test CI connection | Run one bounded, idempotent backend probe and expose a safe result. | [TC-CIC-011–015](#11-contract-validation-cases) | Proposed |
| CIConnection_4 | Authorization and isolation | Enforce role, project and Pipeline ownership server-side. | [TC-CIC-016–019](#11-contract-validation-cases) | Proposed |
| CIConnection_5 | Downstream capability gating | Supply server-authoritative capability/state data for dependent actions. | [TC-CIC-020–024](#11-contract-validation-cases) | Proposed |
| CIConnection_6 | Security, concurrency and audit | Protect secrets, reject stale writes, constrain URLs and produce redacted audit evidence. | [TC-CIC-025–039](#11-contract-validation-cases) | Proposed |

### CIConnection_1 — Read CI connection

**User Story:** **As an** Organization Manager or Instance Administrator **I want to** open the current CI connection
configuration **So that** I can understand its state without exposing its credential.

**Pre-condition:** the user is authenticated, belongs to `{projectKey}`, can access `{pipelineId}`, and the
AI Factory feature is enabled for the project.

**Acceptance Criteria:**

1. `GET` returns the current non-secret representation for exactly one Pipeline.
   1.1. Identity contains `projectKey` and immutable numeric/string `pipelineId` matching the path.
   1.2. A connection is never resolved by mutable Pipeline name.
   1.3. Cross-project or mismatched nested IDs fail according to the agreed non-enumerating error policy.
2. A never-configured Pipeline returns an explicit Not connected representation, not an invented empty Connected
   object and not a generic server error.
3. The response includes one stable machine state that maps exhaustively to the three UI states:
   3.1. `NOT_CONNECTED` → Not connected.
   3.2. `CONNECTED` → Connected.
   3.3. `CONNECTION_FAILED` → Connection failed.
   3.4. An unknown future value fails safe as unavailable/not connected for mutations and never enables a dependent
   action.
4. The response contains the saved repository, branch, selected jobs, models and environments in deterministic
   order, plus safe last-test metadata when present.
5. The response never contains a credential, encrypted credential, reversible mask, credential length, raw provider
   response, authorization header or secret-bearing URL.
6. `credentialConfigured: true|false` is the only required credential-presence indicator. An optional constant mask
   such as `••••••••` may be a presentation concern, but the backend must not return a secret-derived mask.
7. Read access for Editor/Viewer is an **open Product/BE decision**. Manage/test access is not open: it remains
   Organization Manager/Instance Administrator only, with org membership and project permission checked server-side.

### CIConnection_2 — Save CI connection

**User Story:** **As an** Organization Manager or Instance Administrator **I want to** save a validated CI configuration
**So that** ReportPortal can invoke only the approved repository jobs and choices.

**Pre-condition:** the latest connection version has been read and the user has manage permission.

**Acceptance Criteria:**

1. Save accepts repository, branch, optional write-only credential input, jobs, models and environments.
   1.1. All strings are trimmed and length-limited server-side.
   1.2. Collections reject empty elements and duplicates after the agreed case-normalization rules.
   1.3. At least one job, model and environment is required only if Product confirms that invariant; otherwise the
   exact minimum cardinalities must be published in OpenAPI.
2. Credential update semantics are explicit and non-ambiguous:
   2.1. omitted credential means **retain the stored credential**;
   2.2. a non-blank credential means replace it;
   2.3. empty string and `null` are rejected and never interpreted as delete;
   2.4. credential removal/disconnect requires a separate explicitly authorized operation or explicit Product
   decision; it is not inferred from an empty field.
3. The save response is the full current non-secret representation and never echoes the request credential.
4. The backend validates project membership, Pipeline ownership, role, repository/branch syntax, approved URL policy,
   supported job/model/environment values and collection limits independently of FE validation.
5. The operation uses optimistic concurrency. A stale `version`/`If-Match` returns the agreed conflict response and
   does not overwrite the newer configuration.
6. Duplicate identical save requests are deterministic and do not create extra connections/audit events beyond the
   agreed idempotent semantics.
7. FE disables Save while a request is in flight, shows field-level stable validation errors, retains non-secret
   user input on a recoverable failure, clears credential input after every submission attempt, and refetches on
   success/conflict.

### CIConnection_3 — Test CI connection

**User Story:** **As an** Organization Manager or Instance Administrator **I want to** test the stored connection **So that**
I know whether ReportPortal can reach the approved CI configuration before dependent actions are enabled.

**Pre-condition:** a configuration and credential are stored; the caller has manage permission.

**Acceptance Criteria:**

1. Test is a backend-to-provider probe; the browser never sends the stored credential to the CI provider.
2. Test validates the saved repository and branch plus the availability/authorization of configured jobs, models and
   environments according to the agreed provider-specific rule.
3. Only one active probe per Pipeline is allowed. Duplicate submission with the same idempotency key returns the same
   operation/result; a conflicting concurrent test returns the agreed `409` or existing-operation representation.
4. The probe has a documented timeout and does not trigger a Pipeline iteration, CI job, Re-run, Retry, Push or
   Automate action.
5. Success updates the aggregate state to `CONNECTED` and records safe last-test metadata.
6. Authentication, authorization, connectivity, timeout and configuration failures update the aggregate state to
   `CONNECTION_FAILED` with a stable safe error code. No provider secret or raw response is returned.
7. A transient request transport failure before the backend accepts the test does not falsely overwrite the last
   known connection state; the response/operation contract must distinguish not-accepted from completed-failed.
8. FE disables Test while pending, ignores stale results after route/Pipeline change, refetches the connection on
   completion and renders the backend state rather than assuming success.

### CIConnection_4 — Authorization and isolation

**User Story:** **As a** security owner **I want to** enforce CI connection permissions at the API boundary **So that**
client manipulation cannot reveal or mutate CI configuration.

**Pre-condition:** backend role and project membership resolution are available.

**Acceptance Criteria:**

1. The minimum mutation matrix is enforced server-side:

   | Role | See non-secret configuration | Save | Test | Disconnect/delete |
   |---|:---:|:---:|:---:|:---:|
   | Viewer | Open Product/BE decision | - | - | - |
   | Editor | Open Product/BE decision | - | - | - |
   | Organization Manager | + | + | + | Open — define separately |
   | Instance Administrator | + | + | + | Open — define separately |

2. FE may hide/disable controls but direct requests are still denied by the backend with the agreed `403`.
3. Every operation validates `{projectKey}` + `{pipelineId}` ownership atomically and denies ID enumeration/cross-
   project access without leaking existence according to the agreed `403`/`404` policy.
4. Authentication failure and authorization failure are distinct stable outcomes; response bodies never reveal
   configuration or provider detail.
5. Service identities used for backend-to-provider calls have least privilege and are not accepted as browser-user
   identities unless explicitly designed and documented.

### CIConnection_5 — Downstream capability gating

**User Story:** **As a** Pipeline user **I want to** see why an AI Factory action is unavailable **So that** I do not
start work when CI is not connected.

**Pre-condition:** the connection state/capability contract is available to the relevant read surfaces.

**Acceptance Criteria:**

1. `CONNECTED` is necessary but not by itself sufficient for a mutation. Backend authorization, org membership,
   project permission, freshness/expiry/revocation checks and action-specific eligibility remain mandatory.
2. Not connected, Connection failed, unknown/unavailable and stale connection states never enable Push to agent,
   Automate, Re-run or Retry.
3. For a caller who cannot manage the connection, the FE explanation uses the Product-approved equivalent of
   “Ask an Organization Manager to connect this Pipeline to CI”; it does not expose credential or provider detail.
4. T1.2u reads the same aggregate machine state for the Pipelines group header; it does not infer state from missing
   repository text or last-test timestamps.
5. Push and Automate must also be rejected server-side when the effective connection is not Connected, expired,
   revoked, disconnected or changed since its last successful test, even if a stale/manipulated client invokes their endpoint.
6. Re-run and Retry remain disabled until T4.4 and the US-020 contract are separately accepted. A Connected response
   does not make LP6 a browser Re-run command and does not define Retry eligibility.
7. State changes invalidate/refetch dependent capability data so an open screen does not retain a stale enabled
   action after save/failure/disconnect.

### CIConnection_6 — Security, concurrency and audit

**User Story:** **As a** security/audit owner **I want to** protect credentials and record safe configuration changes
**So that** CI integration is traceable without leaking secrets.

**Pre-condition:** trusted HTTPS, server-side secret storage and a redaction policy are configured.

**Acceptance Criteria:**

1. Credentials cross a vault/secret-manager boundary: the API accepts write-only input, passes it only to the
   approved secret-manager service, and stores/reads only a vault reference. The backend-to-provider service identity
   is least-privilege and provider scopes are limited to the configured repository/jobs/models/environments. Rotation,
   revocation, deletion and explicit disconnect semantics must be published. Credentials are encrypted at rest using
   the platform-approved mechanism and are excluded/redacted before WAF, APM, request-body logging, traces, telemetry,
   analytics, audit events, exception messages, backups, fixtures or screenshots.
2. Repository/provider URLs follow an allowlist policy:
   2.1. trusted HTTPS only; no HTTP, protocol-relative URL, user-info credentials, loopback/link-local/private targets
   unless explicitly required and allowlisted by deployment;
   2.2. redirects are revalidated at every hop;
   2.3. DNS resolution/rebinding protections and outbound egress rules are enforced server-side;
   2.4. credentials are sent only to the approved provider host and never across an unapproved redirect.
3. Error messages contain a stable machine code, safe localized/display message or parameters, correlation ID and
   retryability; raw provider bodies and tokens are redacted.
4. Audit records include actor ID, projectKey, pipelineId, operation, timestamp, outcome, correlation ID and changed
   **non-secret field names**. They do not include previous/new credential values or secret-derived metadata.
5. Version changes are monotonic. A successful save returns the stored version; a stale save cannot overwrite it.
6. Save/test idempotency keys are scoped to actor/project/Pipeline/operation, have a documented retention window and
   reject same-key/different-body reuse.
7. Rate limits and `Retry-After` behavior are defined for read/save/test, with stricter limits for external probes.
8. Inputs are plain-text values with a declared charset and maximum byte/character lengths. Control characters,
   null bytes, bidi overrides, non-normalized Unicode, markup and CR/LF header injection are rejected or normalized by
   a documented rule; outputs use context-appropriate encoding and never render backend strings as HTML/markup.
   Hostile HTML, control-character, Unicode-confusable, oversized and delimiter-injection fixtures are mandatory in
   the contract/security test pack.

## 5. Proposed endpoint family — Backend decision required

No endpoint in this section is claimed to exist. Backend should accept these paths/methods or replace them with an
equivalent normative contract.

| ID | Proposed method and path below `/api` | Purpose | Proposed success | Decision status |
|---|---|---|---|---|
| CIC1 | `GET /v1/project/{projectKey}/pipeline/{pipelineId}/ci-connection` | Read non-secret configuration/state | `200 CiConnectionRS`; alternatively an explicit agreed `404` for never configured | Open — BE to accept/replace |
| CIC2 | `PUT /v1/project/{projectKey}/pipeline/{pipelineId}/ci-connection` | Create or replace mutable configuration while retaining an omitted credential | `200 CiConnectionRS` or `201` on first creation, with exact rule documented | Open — BE to accept/replace |
| CIC3 | `POST /v1/project/{projectKey}/pipeline/{pipelineId}/ci-connection/test` | Start/perform a bounded test of the stored connection | `200 CiConnectionTestRS` if synchronous or `202` + operation resource if asynchronous | Open — BE to choose timing model |
| CIC4 | `DELETE /v1/project/{projectKey}/pipeline/{pipelineId}/ci-connection` | Mandatory proposed explicit disconnect/removal with provider/vault revocation | `204` or full Not connected representation | Open — BE/Product to accept/replace lifecycle semantics |

`PATCH` may replace proposed CIC2 only if omitted/null/credential-retention and optimistic-concurrency semantics are
fully specified. A generic Pipeline `PATCH` must not accept secret-bearing fields unless its audit, validation and
response redaction contract is equally explicit.

## 6. Proposed DTOs — Backend decision required

Names are illustrative; requiredness, bounds, enums and formats must be published in OpenAPI.

```ts
type CiConnectionState =
  | 'NOT_CONNECTED'
  | 'UNVERIFIED'
  | 'CONNECTED'
  | 'CONNECTION_FAILED'
  | 'EXPIRED'
  | 'REVOKED';

interface CiConnectionRS {
  projectKey: string;
  pipelineId: number | string;          // use the Pipeline API's immutable ID type
  version: string;                      // opaque ETag/version token
  state: CiConnectionState;
  repository: CiRepositoryRS | null;
  branch: string | null;                 // UTF-8/NFC plain text; proposed max 256 chars/1024 bytes
  credentialConfigured: boolean;        // never return secret or secret-derived mask
  jobs: CiOptionRS[];
  models: CiOptionRS[];
  environments: CiOptionRS[];
  lastTest: CiConnectionTestSummaryRS | null;
  checkedAt: string | null;             // ISO-8601; last successful/terminal server check
  connectedUntil: string | null;        // ISO-8601; only meaningful for CONNECTED
  freshnessTtlSeconds: number;          // proposed default 900; backend-configurable within published bounds
  updatedAt: string | null;              // ISO-8601 date-time
  updatedBy: ActorReferenceRS | null;    // safe display contract to be agreed
}

interface CiRepositoryRS {
  providerId: string;                      // backend allowlist; machine-ID grammar, never free text
  url: string;                           // normalized trusted HTTPS URL
  displayName: string;
}

interface CiOptionRS {
  id: string;                            // ASCII ^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$
  displayName: string;                   // plain text; proposed max 256 chars/1024 bytes
}

interface CiConnectionSaveRQ {
  version: string;                       // or If-Match header
  repository: { providerId: string; url: string };
  branch: string;
  credential?: string;                   // write-only; omission retains stored secret
  jobIds: string[];
  modelIds: string[];
  environmentIds: string[];
}

interface CiConnectionTestRS {
  operationId: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  connectionState: CiConnectionState;
  testedAt?: string;                     // ISO-8601 date-time when terminal
  error?: SafeApiErrorRS;                // stable/redacted only
  correlationId: string;
}

interface CiConnectionTestSummaryRS {
  status: 'SUCCEEDED' | 'FAILED';
  testedAt: string;
  errorCode?: string;                    // safe stable code only
  correlationId: string;
}

interface SafeApiErrorRS {
  code: string;
  message: string;                       // safe; no raw provider response
  field?: string;
  retryable: boolean;
  correlationId: string;
}
```

### 6.1 Minimal capability projection versus privileged configuration

The broad Pipelines list, iteration details and downstream action guards must not consume the privileged full
configuration DTO. Propose a separate, minimal projection so a caller can learn whether an action is currently
available without receiving repository URLs, branch names, option catalogs, actor data or credential metadata:

```ts
interface CiConnectionCapabilityRS {
  projectKey: string;
  pipelineId: number | string;
  state: CiConnectionState;
  usableFor: { pushToAgent: boolean; automate: boolean; rerun: boolean; retry: boolean };
  checkedAt: string | null;
  connectedUntil: string | null;
  version: string;
}
```

`CiConnectionRS` is the privileged full configuration response. The proposed read matrix is explicit but **Open for
Product/BE acceptance**: Organization Manager and Instance Administrator may read the full non-secret configuration
and mutate/test it; Editor and Viewer may read only the minimal capability projection unless Product/BE explicitly
approve a broader non-secret read. D15 accepts the mutation roles only; it does not settle read visibility.
Unauthenticated callers, users without active membership in the requested project, users without the exact existing
Pipeline-read permission, and cross-project or cross-pipeline identifiers receive the one agreed non-enumerating
policy: `401` when unauthenticated, otherwise `404` for absent/wrong-project resources (or `403` only where the final
security policy explicitly distinguishes an authenticated permission denial), with no projection or metadata.
Every Push, Automate, Re-run and Retry endpoint must repeat the org-membership/project-permission, ownership, state,
freshness, expiry and revocation checks server-side immediately before execution.

### 6.2 State freshness and invalidation (proposed)

Use the single `CiConnectionState` enum in every response. A never-configured or explicitly disconnected connection is
`NOT_CONNECTED`; a material save or rotation is `UNVERIFIED`; a successful probe is `CONNECTED`; a failed probe is
`CONNECTION_FAILED`; freshness expiry is `EXPIRED`; provider credential revocation or security invalidation is
`REVOKED`. Only `CONNECTED` with `now < connectedUntil` may produce any downstream capability `true` value.

Propose a default freshness TTL of **900 seconds (15 minutes)**, configurable by Backend only within a published
bounded range of 60–3600 seconds. The response exposes `checkedAt`, `connectedUntil`, `freshnessTtlSeconds`, version
and state; it never exposes secret-derived metadata. On expiry, reads return `EXPIRED` and all downstream capability
booleans become false. A capability read must be no older than the TTL, and action endpoints must repeat membership,
permission, ownership, state, freshness, expiry, version and revocation checks immediately before execution.

Every material save that changes repository, branch, jobs, models or environments transitions to `UNVERIFIED`, clears
capability booleans and requires a successful fresh test. Credential rotation is atomic: the old provider/vault secret
remains usable only until the new secret is durably persisted and validated; then the old secret is revoked/deleted.
If persistence or validation fails, the old secret remains active, the new secret is discarded, state is `UNVERIFIED`
or `CONNECTION_FAILED`, and no downstream action is enabled. Provider revocation, explicit disconnect/delete and
security invalidation transition to `REVOKED` or `NOT_CONNECTED` as defined by the final contract and invalidate all
capabilities.

### 6.2a Mandatory disconnect/delete lifecycle (proposed CIC4)

CIC4 is a mandatory proposed operation, not an optional placeholder. It must atomically revoke/delete the provider
credential and vault secret, clear `credentialConfigured` and non-secret credential metadata, invalidate all downstream
capabilities, transition to `NOT_CONNECTED` (or `REVOKED` when revocation fails and the safe state must be retained),
and write an audit event containing only actor/project/Pipeline/operation/outcome/correlation ID and changed field names.
It must never return, log or back up the credential, vault token or provider response. Repeat disconnect is idempotent;
partial failure returns a safe retryable error and leaves downstream actions disabled until reconciliation completes.

### 6.3 `Idempotency-Key` transport contract (proposed)

For CIC2 save, CIC3 test and mandatory CIC4 disconnect, the client sends an `Idempotency-Key` HTTP header. Propose a
UUIDv4 in canonical ASCII form: UUIDv4 has **122 random bits** after the version/variant bits. Reject malformed keys
and keys that are not valid UUIDv4 values; missing or invalid keys return `400`. The key is generated per logical
operation and never derived from a credential. The server scopes it to
authenticated actor, project, immutable pipeline, operation and deployment environment, stores a canonical request
fingerprint and retains the restricted record for **24 hours**, followed by secure deletion/cleanup. The version or
`If-Match` value is part of the fingerprint and is checked before replay.

The fingerprint includes HTTP method, project key, immutable pipeline ID, operation and a non-secret body encoded with
RFC 8785/JCS canonical JSON. For save/rotation, the raw credential is included as exact raw UTF-8 bytes only in
memory, without Unicode normalization, then a server-side keyed **HMAC-SHA-256** is computed using a separate
secret-manager HMAC key. Only
the HMAC digest and a secret-present/rotation marker are stored in the restricted idempotency record; the raw
credential, HMAC key and digest are never returned, logged, backed up or included in audit/telemetry. The record stores
the HMAC key version; old verification keys remain available for the full 24-hour replay window and are destroyed only
after that window and cleanup complete. This distinguishes changed credentials safely while keeping retries functional.

While the first request is in progress, an identical retry returns the existing operation/result or a documented
`202` pending representation and never starts a second save/probe. A completed identical retry returns the original
result without a second external probe or duplicate audit event. Reusing a key with a different fingerprint, version,
operation, actor, pipeline or credential-presence marker returns `409` with a stable idempotency-conflict code. The
Only one active test probe is allowed per project+pipeline. A second distinct key while a probe is active returns the
proposed `409` conflict (Backend may use `429` only with an explicit `Retry-After` contract). Saves for one
project+pipeline are serialized by version; stale versions return `409`, while same-key identical replays return the
stored response. The server must define maximum concurrent probes and crash recovery: if persistence succeeds before a response is lost,
the same key returns the durable original result; if persistence is ambiguous, the server returns a documented pending
representation and reconciles before allowing a new operation. Missing keys are rejected for test and either
rejected or explicitly documented as unsafe for save; the FE must not silently retry a non-idempotent request.

### 6.4 Concrete input and output validation proposal

All JSON is UTF-8. Apply NFC normalization where the field permits normalization, then reject NUL, C0/C1 control
characters, bidi override/isolate characters, CR/LF injection and non-printing separators. The write-only `credential`
is an opaque visible-ASCII token (`0x21–0x7E`), 1–4096 bytes; reject NUL, all controls and newline characters and
**never Unicode-normalize credential bytes**. A `projectKey` proposes ReportPortal-safe ASCII grammar
`^[a-z0-9][a-z0-9._-]{0,254}$` (1–255 bytes); Backend must publish/confirm the deployed key grammar before runtime.
Machine IDs use `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$` and are at most 128 ASCII bytes. `providerId` is a backend-
published allowlisted machine ID using that grammar; unknown provider IDs are rejected, never accepted as a free string.
Branches
are normalized plain text, 1–256 Unicode characters/1024 UTF-8 bytes, and reject controls, leading/trailing whitespace,
backslash, NUL and path traversal-like segments. Repository URLs are trusted HTTPS only, at most 2048 ASCII bytes,
must contain no user-info, credentials, fragments or secret query parameters, and are revalidated after redirects.
Display labels are plain text, 1–256 Unicode characters/1024 UTF-8 bytes; renderers must contextually escape output and
must never interpret labels, provider errors or branch names as HTML/Markdown. Jobs, models and environments are
deduplicated machine-ID arrays with **at most 100 unique entries each**; duplicates and oversized collections are
rejected with stable field errors and deterministic ordering. The contract test pack
must include hostile HTML, CR/LF, NUL/C0/C1, bidi/confusable and non-normalized Unicode fixtures plus oversized and
delimiter-injection values; responses and diagnostics must remain safely encoded and non-secret.

## 7. Example payloads — placeholders only

### 7.1 Read a connected configuration

```json
{
  "projectKey": "demo-project",
  "pipelineId": 42,
  "version": "v7",
  "state": "CONNECTED",
  "checkedAt": "2026-10-05T10:15:30Z",
  "connectedUntil": "2026-10-05T10:30:30Z",
  "freshnessTtlSeconds": 900,
  "repository": {
    "providerId": "gitlab",
    "url": "https://git.example.test/team/ui-tests",
    "displayName": "team/ui-tests"
  },
  "branch": "main",
  "credentialConfigured": true,
  "jobs": [{ "id": "generate-cases", "displayName": "Generate cases" }],
  "models": [{ "id": "model-a", "displayName": "Model A" }],
  "environments": [{ "id": "qa", "displayName": "QA" }],
  "lastTest": {
    "status": "SUCCEEDED",
    "testedAt": "2026-10-05T10:15:30Z",
    "correlationId": "corr-example-123"
  },
  "updatedAt": "2026-10-05T10:15:30Z",
  "updatedBy": { "id": "user-123", "displayName": "Example Manager" }
}
```

### 7.2 Save with a new placeholder credential

```json
{
  "version": "v7",
  "repository": {
    "providerId": "gitlab",
    "url": "https://git.example.test/team/ui-tests"
  },
  "branch": "main",
  "credential": "<WRITE_ONLY_TRIGGER_CREDENTIAL>",
  "jobIds": ["generate-cases"],
  "modelIds": ["model-a"],
  "environmentIds": ["qa"]
}
```

### 7.3 Save without rotating the credential

```json
{
  "repository": {
    "providerId": "gitlab",
    "url": "https://git.example.test/team/ui-tests"
  },
  "branch": "release/demo",
  "jobIds": ["generate-cases"],
  "modelIds": ["model-a"],
  "environmentIds": ["qa"]
}
```

The omitted `credential` retains the stored credential. No example in this document contains a real secret.

## 8. Validation and status-code contract requested

| HTTP status | Requested meaning | FE behavior |
|---:|---|---|
| `200` | Successful read/update/test result | Validate DTO, reconcile/refetch and render server state |
| `201` | Optional first creation if CIC2 distinguishes create | Same as `200`; BE must define deterministic create-vs-update behavior |
| `202` | Test accepted asynchronously | Track only the returned operation; prevent a second active probe |
| `400` | Structurally malformed request | Generic safe request error; no message-text parsing |
| `401` | Missing/expired authentication | Use standard session handling; no configuration detail |
| `403` | Authenticated but not authorized | Permission state; backend remains authoritative |
| `404` | Project/Pipeline/operation absent under agreed non-enumerating policy | Not-found/unavailable; never treat as Not connected unless contract says CIC1 `404` means never configured |
| `409` | Stale version, active conflicting test or idempotency conflict | Refetch current state; show stable conflict guidance |
| `422` | Semantically invalid field/value/combination | Map stable `field`/`code` to localized field errors |
| `429` | Rate limited | Respect `Retry-After`; no automatic probe storm |
| `500/502/503/504` | Backend/provider/server unavailable | Safe retryable failure; preserve last known non-secret state |

The error envelope must not require the FE to parse human text. Backend must publish maximum lengths/cardinalities,
allowed provider values, repository and branch validation, option-ID validation, timeout and rate limits.

## 9. Open decisions requested from BE, Product and QA

| ID | Owner | Decision required | Required evidence / output | Blocks |
|---|---|---|---|---|
| CIC-D01 | BE | Accept/replace CIC1–CIC4 paths and methods; choose synchronous `200` or asynchronous `202` test model. | Updated OpenAPI + deployed build/version | T3.6 transport |
| CIC-D02 | Product + BE | Decide whether Editor/Viewer may read the non-secret configuration/state. | Final permission matrix + QA identities | Read UI and T1.2u |
| CIC-D03 | Product | Accept/replace mandatory disconnect/delete CIC4 confirmation and impact semantics. | US-019 AC update | CIC4/FE action |
| CIC-D04 | BE + Security | Select provider enum, repository representation and trusted HTTPS/host/redirect/egress policy. | OpenAPI/ADR and allowed test fixtures | Save/Test security |
| CIC-D05 | BE + Product | Define minimum/maximum jobs, models, environments; source-of-options endpoint or authoritative catalog; ordering and stale-option behavior. | Typed DTOs + examples | Form implementation |
| CIC-D06 | BE + Security | Confirm secret storage, write-only replacement/retention rules, rotation/removal and audit/log/telemetry redaction. | Security review + negative evidence | Credential field |
| CIC-D07 | BE | Define aggregate state transitions, last-test persistence, timeout, concurrent probe and transient-not-accepted semantics. | State table + contract tests | Status UI/gating |
| CIC-D08 | BE | Choose `ETag/If-Match` or body `version`; define stale-write and idempotency retention/conflict rules. | OpenAPI + integration tests | Safe mutations |
| CIC-D09 | BE + Product | Confirm how Push/Automate endpoints discover/enforce Connected; keep Re-run/Retry separately gated by US-020. | Capability/error contract | T1.2u, T4.4, dependent actions |
| CIC-D10 | QA | Provide allowed/denied role accounts, two-project isolation data, invalid/timeout/rate-limit fixtures and a sanitized success/error payload pack. | QA fixture matrix | Acceptance sign-off |
| CIC-D11 | Product + Design | Link the approved T3.6 design or accept the existing T3.4 modal placement and exact field/state interactions. | Figma/requirements decision | Visual implementation |
| CIC-D12 | Requirements owners | Copy the final agreed contract into `reportportal-requirements/.../contracts/` and link it from US-019/US-002/US-020 as applicable. | Merged requirements commit/link | Runtime T3.6 start |
| CIC-D13 | BE + Security | Define the vault/secret-manager boundary, service identity/provider scopes, rotation/revocation/deletion/disconnect and pre-WAF/APM/request-body redaction controls. | Security ADR and negative logging/backup evidence | Credential safety |
| CIC-D14 | BE + Security | Publish plain-text/charset/control/markup normalization and output-encoding rules, including hostile Unicode/HTML fixtures and maximum byte/character lengths. | Validation schema and hostile-input test pack | Input/output safety |
| CIC-D15 | BE + Product | Accept the split between minimal capability projection and privileged full configuration, exact read roles, org/project membership constants and immediate downstream action rechecks. | Permission matrix + API contract tests | Capability leakage/action bypass |

## 10. Frontend acceptance boundary

This documentation-only task may finish with the proposal and its open decisions. Runtime T3.6 is fail-closed and
may start only after the authoritative contract is copied into and accepted in
`reportportal-requirements/domains/projects/df_bootcamp_2026/contracts/`, linked from US-019, and its deployed
OpenAPI/payload pack matches. Acceptance must explicitly include the exact capability read roles and existing
Pipeline-read permission mapping (CIC-D02/CIC-D15), mandatory CIC4 disconnect/revocation lifecycle (CIC-D03), the
unified six-state enum and TTL/rotation rules (CIC-D07/D16), idempotency/input/security decisions (CIC-D06/D08/D13/D14/D17),
and **every applicable open decision D-01 through D-17 in the linked integration register**, including D-03, D-07,
D-08, D-10, D-11 and D-12. No proposal in `service-ui` can substitute for that acceptance. Runtime T3.6 may start
only when CIC-D01–D15 (including the security, capability and mandatory disconnect decisions) are accepted and the deployed OpenAPI/payload pack
match the authoritative requirements contract. The FE implementation must then:

1. add raw DTOs and runtime validation at the transport boundary rather than reuse mock view models;
2. keep `show_ai_factory_poc` default OFF and preserve toggle-OFF behavior;
3. render the section inside the existing Pipeline settings surface for the accepted roles;
4. never persist, log, cache, prefill or redisplay the credential after submission;
5. implement loading, never-configured, Connected, Connection failed, invalid-payload, forbidden, conflict, offline and
   retryable failure states;
6. prevent stale request results from crossing Pipeline/route/logout changes;
7. refetch/reconcile server state after save/test and never infer success from the submitted body;
8. use the same aggregate state/capability contract for T1.2u and dependent-action gating;
9. add adapter, service/controller, component, permission, secret-redaction, concurrency, toggle-OFF and browser tests;
10. demonstrate that no real credential appears in DOM snapshots, console, Redux/state persistence, analytics, request
    URLs, test fixtures or captured evidence.

## 11. Contract validation cases

These are pre-implementation acceptance cases. Detailed executable cases should be copied to the QA system after
the authoritative contract is accepted.

| ID | Scenario | Expected result |
|---|---|---|
| TC-CIC-001 | Read a never-configured Pipeline | Explicit Not connected representation/contracted absence; no fabricated values |
| TC-CIC-002 | Read Connected and Connection failed configurations | Exact aggregate state, deterministic options and safe last-test metadata |
| TC-CIC-003 | Read contains secret-like provider fields | Contract/adapter rejects or strips them; no render/log/state leak |
| TC-CIC-004 | Unknown state or invalid success payload | Fail closed; dependent actions remain disabled |
| TC-CIC-005 | First valid save with placeholder credential | Stored configuration returned without credential; version advances |
| TC-CIC-006 | Edit non-secret fields with omitted credential | Stored credential is retained; response remains non-secret |
| TC-CIC-007 | Save with `credential: null`, empty or whitespace | Stable validation failure; stored credential unchanged |
| TC-CIC-008 | Duplicate/oversized/unknown options and malformed repository/branch | Stable field-level validation; nothing persisted |
| TC-CIC-009 | Two clients save the same version | One succeeds; stale request receives conflict and cannot overwrite |
| TC-CIC-010 | Exact replay and same-key/different-body replay | Deterministic identical result; conflicting reuse rejected |
| TC-CIC-011 | Successful bounded test | One probe; state becomes Connected; safe metadata only |
| TC-CIC-012 | Provider authentication/configuration failure | State becomes Connection failed with stable redacted code |
| TC-CIC-013 | Timeout/provider outage | Agreed retryable outcome, no raw provider response or secret leak |
| TC-CIC-014 | Double-click/concurrent test | One active probe; duplicate follows idempotency/conflict contract |
| TC-CIC-015 | Browser route/Pipeline changes before result | Stale result cannot update the new screen; server state remains queryable |
| TC-CIC-016 | Organization Manager and Instance Administrator manage/test | Allowed only for correct project/Pipeline |
| TC-CIC-017 | Viewer/Editor manipulate UI or call API directly | Save/Test denied by backend with stable `403` |
| TC-CIC-018 | Cross-project Pipeline ID and enumeration attempts | Denied without metadata leakage |
| TC-CIC-019 | Expired/missing authentication | Standard `401`; no external provider call |
| TC-CIC-020 | Not connected/failed/unknown state across Push/Automate/Re-run/Retry | Every dependent action remains unavailable and backend rejects mutation |
| TC-CIC-021 | Connected state with denied role | State alone does not grant the action |
| TC-CIC-022 | State changes while dependent screen is open | Capability invalidates/refetches; stale enabled action cannot succeed |
| TC-CIC-023 | T1.2u group header | Uses exact aggregate state, not inferred repository/last-test data |
| TC-CIC-024 | Connected before US-020 is accepted | Re-run/Retry remain unavailable; LP6 is not called from browser |
| TC-CIC-025 | HTTP, invalid TLS, unapproved host/redirect, credential-in-URL input | Fail closed before credential disclosure or external call |
| TC-CIC-026 | Logs/traces/audit/errors after save/test failure | Credential and raw provider response absent; correlation ID present |
| TC-CIC-027 | Read/save/test rate limit | Stable `429`, `Retry-After` honored, no retry storm |
| TC-CIC-028 | Audit a non-secret update | Actor/project/Pipeline/operation/outcome and changed field names recorded |
| TC-CIC-029 | Audit a credential replacement | Records only that credential changed; no old/new value or secret-derived data |
| TC-CIC-030 | Same Pipeline names in different projects | Immutable project/Pipeline identity keeps configurations isolated |
| TC-CIC-031 | Toggle OFF | No CI connection UI/request and no change to existing application behavior |
| TC-CIC-032 | Broad consumer reads capability only | Editor/Viewer receive only the minimal state/capability projection when approved; full configuration fields are absent |
| TC-CIC-033 | Privileged full-configuration read | Organization Manager/Instance Administrator with valid org membership and project permission receive only the approved non-secret DTO; denied roles and cross-project IDs receive no configuration metadata |
| TC-CIC-034 | Save/credential rotation after Connected | State immediately becomes `UNVERIFIED`, capability booleans are false, and Push/Automate/Re-run/Retry are rejected until a successful fresh test |
| TC-CIC-035 | Expiry, revocation and disconnect | Expired, provider-revoked or disconnected credentials cannot enable or execute downstream actions; safe state and audit evidence are returned |
| TC-CIC-036 | Idempotency header replay | Same actor/project/Pipeline/operation/key/fingerprint replays the original pending/result response without duplicate probe/audit |
| TC-CIC-037 | Idempotency conflict and version interaction | Same key with changed body, credential-presence marker, operation or version returns stable `409`; stale `If-Match`/version cannot be replayed as success |
| TC-CIC-038 | Vault and logging boundary | Secret reaches only the approved vault/provider boundary; WAF/APM/request logs, traces, backups, audit and errors contain no credential, vault token or raw provider response |
| TC-CIC-039 | Hostile input and output encoding | HTML, CR/LF, null/control, bidi/confusable, non-normalized Unicode, oversized and delimiter inputs are rejected/normalized safely and never rendered as markup |
| TC-CIC-040 | Credential validation | Visible-ASCII 1–4096-byte credential accepts valid input, rejects NUL/control/newline, and preserves exact bytes without Unicode normalization |
| TC-CIC-041 | Project/provider identity validation | Invalid project keys and unknown/non-allowlisted provider IDs fail with stable field errors; provider IDs follow the machine-ID grammar |
| TC-CIC-042 | Collection bounds | Duplicate or more than 100 jobs, models or environments are rejected; valid collections are deterministic and unique |
| TC-CIC-043 | Idempotency key validation | Missing, non-UUIDv4 or malformed keys on CIC2/CIC3/CIC4 return `400`; valid UUIDv4 keys retain/replay for 24 hours |
| TC-CIC-044 | Concurrent test and crash replay | One active probe per project+Pipeline; a distinct concurrent key returns `409`; crash-after-persistence replays the stored terminal response without duplicate provider call/audit |

## 12. Completion and sign-off checklist

- [ ] Product/BE accepts field/state/permission/downstream behavior and the mandatory CIC4 disconnect/revocation lifecycle.
- [ ] Backend publishes the accepted endpoints, required DTO fields, constraints, errors, concurrency/idempotency and
  state transitions in trusted-HTTPS OpenAPI.
- [ ] Security approves secret storage/redaction and URL/egress policy.
- [ ] QA receives sanitized positive/negative payloads and role/isolation accounts.
- [ ] The source-of-truth contract is merged under
  `reportportal-requirements/domains/projects/df_bootcamp_2026/contracts/` and linked from the affected stories.
- [ ] Only after all required boxes are complete may runtime T3.6 move from contract readiness to implementation.

Until then, T3.6, T1.2u and CI-dependent portions of T4.4 remain blocked. This document completes only the
contract-readiness handoff represented by EPMRPP-122050; it does not complete US-019 or integrate a backend API.
