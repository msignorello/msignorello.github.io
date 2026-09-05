# Validation playbooks

Record source, destination, protocol, expected path, actual path, and result for every test.

## Baseline and management recovery

- Verify local console or alternate management access.
- Record interface addresses, link state, default routes, gateway status, and service state.
- Download and verify a current OPNsense backup.
- Confirm the restore procedure and the exact backup to use.
- Test GUI, SSH, DNS, and internet access from an actual LAN client.

## DHCP and local DNS

- Confirm the selected DHCP backend and that only the intended service is active.
- Validate range, exclusions, reservations, lease times, gateway, DNS, and domain.
- Renew two different clients and inspect their complete leases.
- Resolve migrated host overrides from LAN and remote VPN clients.
- Verify forward and, when configured, reverse records.
- Reboot or renew long-lived clients that retained incompatible leases from the old router.

## Firewall and inter-subnet routing

- Test the router's route only as an initial diagnostic.
- Test from the actual source subnet to the destination host.
- Inspect ingress rule order and counters.
- Confirm the destination receives the packet and has a return path.
- Capture both directions when the client result differs from a router-local test.

## Remote-access VPN

- Authenticate with certificate plus username/password when required.
- Verify assigned address, pushed routes, DNS server, search domain, MTU, and default-route behavior.
- Test the router GUI/DNS only if policy permits it.
- Test each authorized internal subnet.
- Test VPN-peer access separately when required.
- Confirm unauthorized destinations remain blocked.
- Revoke or disable a test identity and verify denial.

## Policy-routed commercial VPN

- Confirm only members of the source alias match the VPN gateway rule.
- Confirm nonmembers use the ordinary WAN path.
- Verify outbound NAT on the VPN interface.
- Test the kill switch with the tunnel down.
- Verify local-subnet traffic bypasses the commercial VPN policy.
- Compare throughput, loss, latency, MTU/MSS, CPU, and selected cipher/protocol.

## Port forwarding

- Test externally rather than from the same LAN unless reflection is explicitly required.
- Capture inbound SYN on the external/VPN interface.
- Capture the translated SYN at the internal host.
- Confirm the internal host returns SYN-ACK.
- Confirm the SYN-ACK exits through the intended external/VPN interface.
- Inspect state, generated PF rule, NAT rule, gateway/reply policy, and service listener.

## Multi-WAN failover and failback

Run every row; none substitutes for another.

| Test | Evidence required |
| --- | --- |
| Router source through each WAN | Interface and upstream connectivity |
| New LAN session through each WAN | Forwarding, policy routing, and outbound NAT |
| DNS lookup during each WAN state | Resolver path and fresh answers |
| Physical primary-link loss | Link detection, transition, client traffic, and states |
| Primary upstream failure with carrier | Monitor detection and policy transition |
| Existing and new sessions | Intended state cleanup/preservation behavior |
| Primary restoration | Routes, rules, DNS, sessions, and failback |

During each state, record gateway monitors, default route, compiled `route-to` rule, outbound NAT, public source IP, raw IPv4 reachability, DNS, and a representative HTTPS page with dependent assets.

## Reboot validation

- Confirm all expected interfaces, gateways, VPNs, and services start.
- Confirm compiled firewall and NAT rules match the saved configuration.
- Repeat LAN, DNS, VPN, policy-routing, port-forward, and failover smoke tests.
- Confirm dynamic DNS reports the intended public address.
- Confirm no temporary test override or forced gateway state survived.
