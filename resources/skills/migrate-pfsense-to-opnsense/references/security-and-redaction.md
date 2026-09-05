# Security and redaction

Treat firewall backups as credential archives and network maps, even when encrypted transport is used.

## Never expose or commit

- API keys and secrets
- administrative or user passwords
- password hashes
- private certificate keys
- TLS static keys and preshared keys
- VPN provider credentials or complete client configurations
- recovery codes, tokens, cookies, or session material
- full unredacted configuration backups

Do not rely on a user saying a chat is safe. Minimize secret handling anyway.

## Operational inventory versus public report

The inventory script always omits known secret fields. Its normal output intentionally retains operational identifiers such as private IPs, hostnames, MAC addresses, usernames, aliases, and rule descriptions because they are needed for migration. Protect that file like internal network documentation.

Use `--public` before sharing an inventory. Public mode removes or replaces host-level addressing and identifiers and retains aggregate structure. Review the result manually; custom package fields and descriptive text can still disclose context if separately quoted.

## Credential workflow

1. Create least-privilege, temporary migration credentials.
2. Supply secrets through the runtime's protected credential mechanism, not command arguments, prompts, source files, or committed environment files.
3. Avoid verbose HTTP output that prints authorization headers.
4. Create distinct user and certificate identities.
5. Rotate every temporary or exposed credential after migration.
6. Revoke credentials no longer required.

## Backup workflow

1. Store source and destination backups outside the publication repository.
2. Record filename, timestamp, size, and checksum without publishing the file.
3. Encrypt backups at rest where possible.
4. Verify that a backup can be parsed before relying on it.
5. Keep a known-good pre-cutover backup and a final post-validation backup.
6. Remove intermediate exports and client profiles from temporary workspaces after handoff.

## Publication review

Before publishing an article, skill, log, screenshot, example, or fixture:

- search for API credentials, private key markers, password fields, tokens, public IPs, domains, email addresses, usernames, hostnames, MAC addresses, certificate bodies, and client-profile blocks;
- replace environment-specific values with documentation ranges and placeholders;
- avoid publishing screenshots of DNS zones, user lists, certificate inventories, or complete firewall rules without manual review;
- ensure test fixtures are synthetic rather than merely redacted production backups.
