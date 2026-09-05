# Migration matrix

Use this matrix to identify likely translations. Verify every item against the installed pfSense and OPNsense versions.

| Area | pfSense evidence | OPNsense target | Required dependencies and checks |
| --- | --- | --- | --- |
| Physical interfaces | `interfaces`, VLANs, PPPs, assignments | Interface assignments and devices | Map hardware names manually; preserve management access; verify carrier and addresses |
| Gateways | Gateway items, groups, monitoring, default gateway | Gateways, monitor IPs, groups, priorities | Confirm routing and policy rules actually reference the group |
| Static routes | `staticroutes` | System routes | Confirm next hop is reachable through the assigned interface |
| DHCP | `dhcpd`, ranges, static mappings | Installed DHCP backend, commonly Dnsmasq or Kea | Migrate configuration separately from service activation; detect duplicates |
| DNS resolver | Unbound or Dnsmasq configuration | Unbound/Dnsmasq plugin and host overrides | Preserve internal domains, DHCP registration, VPN DNS pushes, and WAN behavior |
| Upstream DNS | System DNS servers plus gateway binding | System DNS and resolver mode | Decide recursive versus forwarding mode; test during each WAN state |
| Dynamic DNS | `dyndnses` | `os-ddclient` or current supported service | Re-enter credentials; verify detected address and provider response |
| Aliases | Hosts, networks, ports, URLs | Firewall aliases | Create before rules; preserve names, types, and update behavior |
| Firewall rules | Floating and interface rules in order | Filter rules | Preserve order, quick/floating semantics, IP family, gateway, logging, and disabled state |
| Port forwards | NAT rules and associations | Destination NAT plus filter rule | Verify listening interface, target, target port, reflection policy, and symmetric replies |
| Outbound NAT | Automatic/hybrid/manual mode and rules | Source NAT | Ensure every client network is translated on every eligible internet WAN or VPN |
| Remote OpenVPN | Server, auth mode, CA/cert, tunnel and local networks | OpenVPN instances, users, certificates | Prefer new CA and per-user identities; push routes and DNS; add VPN ingress rules |
| Outbound OpenVPN | Client instance, gateway, aliases, NAT | OpenVPN client plus assigned interface/gateway | Validate source alias, kill switch, outbound NAT, and return path |
| WireGuard | Package configuration, peers, tunnel addresses | WireGuard plugin | Validate allowed IPs, gateway/interface assignment, MSS/MTU, NAT, and policy routing |
| Certificates | CA, cert, CRL metadata | Trust store and certificates | Reissue where practical; never migrate private material through chat or reports |
| Users/groups | Users, groups, privileges, hashes | Local users/groups and privileges | Create separate identities; set temporary passwords out of band; rotate them afterward |
| Multi-WAN | Gateways, tiers, monitor IPs, policy rules | Gateway group and LAN policy routing | Test link loss, soft upstream failure, new sessions, DNS, state cleanup, and failback |
| Hardware acceleration | Crypto selection and offload-disable flags | System crypto/offload settings and driver capability | Confirm CPU exposure, driver support, VPN algorithm use, and measured throughput |
| Packages | `installedpackages` and package-specific trees | OPNsense plugins or replacements | Treat as separate migrations; do not assume package parity |

## Classification rules

- Mark **direct** only when the semantic model and runtime behavior match.
- Mark **rebuild** for VPN identities, certificate chains, firewall/NAT policy, and plugins with different implementations.
- Mark **manual** for physical ports, secrets, cable moves, upstream devices, and provider-side configuration.
- Mark **retire** only with operator agreement.
- Mark **defer** with an owner, reason, and expected impact.
- Mark **blocked** when a required control path or recovery path is missing.
