# OPNsense control plane

Use MCP, the native API, and SSH as complementary layers. No single layer is the source of truth.

## Select the access method

| Method | Prefer it for | Do not assume |
| --- | --- | --- |
| OPNsense MCP connector | Discovery and supported read/write operations with useful schemas | Complete controller/plugin coverage, installed-version parity, raw diagnostics, or correct apply sequencing |
| Native OPNsense API | Exact model/controller operations, request/response inspection, and uncommon features | Uniform payload encoding, narrow endpoint scope, or automatic runtime application |
| SSH | Routes, compiled PF rules, states, logs, service commands, packet capture, and recovery diagnostics | That runtime commands persist or that direct file edits are safe |
| Web GUI/network inspection | Discovering the request used by the installed version when documentation differs | That replaying a wizard request changes only the visible field |

## Evaluate an MCP connector before relying on it

1. Test connection and authentication without exposing credentials.
2. Inventory its operations for every feature in scope.
3. Confirm it targets the installed OPNsense version and required plugins.
4. Confirm it returns validation details, UUIDs, and raw-enough failures to diagnose problems.
5. Confirm whether save, apply, reconfigure, restart, backup, and restore are separately exposed.
6. Confirm SSH or direct API fallback exists before a production change.

Use the connector when it is the cleanest supported adapter. Switch layers when it hides a required operation or obscures the failing layer. Do not spend the migration debugging a wrapper that is not needed for the outcome.

## Native API discipline

- Expect routes in the form `/api/<module>/<controller>/<command>`, but verify actual controllers on the installed system.
- Discover models and request shapes from current documentation and installed GUI requests.
- Do not assume all controllers accept the same JSON or form encoding.
- Inspect response bodies even when the HTTP status is successful.
- Capture returned UUIDs and read the object back.
- Determine whether the component requires a separate apply or reconfigure call.
- Diff broad or unfamiliar operations against a fresh configuration backup.
- Avoid setup-wizard or initial-configuration endpoints for narrow edits.

## SSH discipline

- Prefer read-only commands first: interface state, routes, gateway status, service status, PF rules, states, logs, and packet captures.
- Scope packet captures by interface, host, port, and protocol to avoid collecting unrelated traffic.
- Do not paste configuration backups, private keys, hashes, or full logs containing secrets into chat.
- Use runtime commands to diagnose; use supported persistent configuration paths to implement.
- Record any temporary forced gateway state, manual route, or service override and remove it after testing.

## Failure isolation

Separate these layers explicitly:

1. TCP reachability to OPNsense.
2. TLS negotiation and trust.
3. HTTP request transmission.
4. API authentication and privileges.
5. Controller and action availability.
6. Payload validation and persistence.
7. Apply/reconfigure completion.
8. Runtime behavior.

Do not describe a failure as “the API is broken” until the failing layer is known.
