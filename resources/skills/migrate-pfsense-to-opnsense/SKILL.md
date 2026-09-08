---
name: migrate-pfsense-to-opnsense
description: Audit a pfSense configuration backup, reconstruct its intended behavior, plan and execute a staged migration to OPNsense, and validate the resulting firewall at configuration and packet-flow levels. Use when Codex must inspect pfSense XML, compare pfSense with an existing OPNsense installation, migrate DHCP/DNS/VPN/NAT/firewall/multi-WAN configuration, diagnose an incomplete migration, or prepare a reversible production cutover using an OPNsense MCP connector, native API, and controlled SSH access.
---

# Migrate pfSense to OPNsense

Treat the pfSense backup as evidence of intended behavior, not as an import file. Build a migration inventory, map dependencies, apply bounded changes, and prove the resulting packet paths from real client networks.

## Non-negotiable safeguards

- Start read-only unless the user explicitly asks to implement changes.
- Never print, persist in reports, or commit passwords, password hashes, private keys, API secrets, TLS static keys, VPN credentials, recovery codes, or complete client profiles.
- Never modify the source pfSense backup.
- Take and verify a current OPNsense backup before each connectivity-risking change batch.
- Preserve a console or alternate management path before changing interfaces, LAN addressing, default routes, firewall policy, DHCP activation, or VPN access.
- Separate configuration from activation. Do not enable DHCP, VPN, DNS, dynamic DNS, or another service unless the approved step includes activation.
- Stop for explicit approval before a physical cutover, management-path change, default-route change, reboot, restore, service activation, destructive replacement, or broad production firewall change.
- Prefer supported configuration interfaces. Modify `config.xml` directly only when no supported operation exists, the exact scope is understood, a backup exists, and a diff plus rollback plan is ready.
- Treat an HTTP 200 or `saved` response as acceptance, not proof of correct runtime behavior.

## Load only the references needed

- Read [migration-matrix.md](references/migration-matrix.md) while classifying pfSense features and dependencies.
- Read [control-plane.md](references/control-plane.md) before selecting MCP, API, GUI-derived requests, or SSH operations.
- Read [known-pitfalls.md](references/known-pitfalls.md) before proposing or applying changes.
- Read [validation-playbooks.md](references/validation-playbooks.md) before cutover or troubleshooting.
- Read [security-and-redaction.md](references/security-and-redaction.md) before handling backups, credentials, reports, or publication artifacts.

## Phase 1: establish scope and evidence

1. Record the pfSense version, OPNsense version, intended topology, physical interface map, management path, maintenance window, rollback method, and features the user actually wants preserved.
2. Classify every discovered item as `migrate`, `replace`, `retire`, `defer`, or `needs decision`. Do not assume everything in the backup should migrate.
3. Inventory an OPNsense MCP connector's actual operations before relying on it. Keep the native API and SSH available as diagnostic fallbacks.
4. Capture a read-only OPNsense baseline: interfaces, addresses, routes, gateways, services, aliases, rules, NAT, VPNs, certificates, DNS, DHCP, and installed plugins.
5. Confirm the destination backup can be downloaded and read back before making changes.

## Phase 2: inventory the pfSense backup

Run the bundled inventory script when Python is available:

```sh
python scripts/inventory_pfsense.py /path/to/config.xml --format markdown --output inventory.md
```

Use `--public` for an intentionally reduced report suitable for sharing. It removes host-level identifiers and addresses as well as secrets. The normal report omits secrets but retains operational IP, hostname, MAC, and username data needed for migration; protect it accordingly.

Review the result against the XML structure. Explicitly inventory:

- interfaces, VLANs, virtual IPs, gateways, gateway groups, and static routes;
- DHCP scopes, reservations, relay/failover settings, and whether each service is enabled;
- Unbound/Dnsmasq settings, host overrides, domain overrides, upstream DNS, and gateway bindings;
- users, groups, certificate authorities, certificates, CRLs, and authentication modes;
- remote-access and outbound VPN instances, routes, DNS pushes, topology, ciphers, and per-user identity requirements;
- aliases, floating/interface rules, order, gateway selection, logging, and disabled state;
- port forwards, one-to-one NAT, outbound NAT mode, generated associations, and expected return paths;
- dynamic DNS, monitoring, hardware crypto/offload settings, and installed packages.

Do not copy secret-bearing XML nodes into notes or prompts.

## Phase 3: reconstruct behavior and dependencies

For every feature, state:

1. The user-visible behavior it creates.
2. Its pfSense implementation.
3. Its OPNsense equivalent or replacement.
4. Dependencies that must exist first.
5. Whether it can be staged without activation.
6. Verification tests and rollback steps.
7. Confidence and unresolved decisions.

Represent policy-routed flows as a complete chain:

```text
source alias -> ingress rule -> selected gateway -> outbound NAT -> return policy
```

Represent remote-access flows as:

```text
client route -> VPN ingress policy -> destination route -> destination response -> return path
```

Do not infer access from route existence. Do not infer internet failover from a router-originated ping.

## Phase 4: produce the migration plan

Order work by dependency and blast radius:

1. Backups and management access.
2. Physical interface mapping and inactive interface definitions.
3. Aliases and reusable objects.
4. DHCP scopes/reservations and DNS records, initially inactive when requested.
5. Certificate authorities, certificates, users, and authentication.
6. VPN instances, routes, and DNS pushes.
7. Gateways, monitoring, gateway groups, and local-network exemptions.
8. Firewall rules in verified order.
9. Port forwards and outbound NAT.
10. Dynamic DNS and auxiliary services.
11. Activation, physical cutover, reboot, and complete validation.

For each batch, show intended changes, expected diff, impact, rollback, and tests. Obtain required approval before executing high-risk batches.

## Phase 5: apply bounded changes

1. Create a fresh destination backup and record its filename, size, timestamp, and checksum when available.
2. Capture the relevant pre-change persisted and runtime state.
3. Use the narrowest supported operation.
4. Inspect the full response. Treat `failed`, validation messages, missing UUIDs, or empty results as failures even with HTTP success.
5. Invoke the required apply/reconfigure action explicitly when the component separates save from apply.
6. Read the object back and compare it with the intended values.
7. Diff the overall configuration against the backup when using an unfamiliar or wizard-like endpoint.
8. Inspect runtime state before continuing.
9. Roll back immediately if unrelated interfaces, gateways, DHCP, DNS, firewall, NAT, or VPN state changed.

Do not batch unrelated changes merely to reduce API calls.

## Phase 6: prove three layers of truth

Verify each migrated feature at all three layers:

1. **Requested state:** the operation and payload that were submitted.
2. **Persisted state:** what OPNsense stored after validation.
3. **Runtime state:** services, routes, compiled PF rules, states, logs, and packets.

Test from the actual source network. A successful router-local test does not prove forwarding, ingress policy, policy routing, NAT, DNS delivery, or return routing for clients.

For failures, follow packets rather than changing several settings at once:

1. Confirm client address, mask, gateway, DNS, and route.
2. Confirm ingress interface and matching rule.
3. Inspect the kernel route and any policy-selected gateway.
4. Inspect compiled PF filter and NAT rules.
5. Capture on ingress and expected egress.
6. Confirm the destination receives and answers.
7. Follow the answer back to the source.

Use the exact playbooks in [validation-playbooks.md](references/validation-playbooks.md).

## Phase 7: close the migration

Produce a final report containing:

- migrated, replaced, retired, deferred, and unresolved items;
- sanitized before/after behavior and dependencies;
- destination backup identifiers and rollback points;
- tests run from each source network and their results;
- known limitations and follow-up actions;
- credentials and certificates that the operator must rotate;
- a reboot validation checklist.

Never declare the migration complete while required client-path, failover/failback, DNS, VPN, or recovery tests remain unperformed. Distinguish `configured`, `runtime verified`, and `client verified` explicitly.
