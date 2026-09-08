# Known migration pitfalls

Review these before planning and before every production batch.

## Routes are not permissions

A router-local ping proves only the router's own route and source address. A LAN or VPN client additionally needs ingress policy, forwarding, NAT when required, and a return path.

## Remote VPN peers may still be isolated

Routes pushed to VPN clients do not necessarily permit client-to-client traffic. Prefer an explicit VPN-interface firewall rule when peer traffic must remain visible to PF policy and logging. Account for dynamic client addresses by using the intended VPN subnet when appropriate.

## Policy routing is a chain

An alias and gateway rule alone do not complete outbound VPN policy. Validate alias membership, rule order, gateway health, kill-switch behavior, outbound NAT, and symmetric return routing. Put local-network exemptions above broad policy-routing rules.

## Port forwards require symmetric replies

Seeing an inbound SYN at the internal server does not prove a working forward. Capture the SYN-ACK and confirm it leaves through the intended VPN/WAN interface. Generated rules may lack the needed gateway or reply policy for an assigned VPN interface.

## Cellular-management NAT is not internet NAT

A rule translating LAN traffic only to the directly connected cellular subnet permits management access but does not translate LAN traffic to arbitrary internet destinations during failover.

## A configured gateway group may be unused

Confirm the general LAN internet rule references the gateway group. Also confirm monitor addresses, gateway state, state cleanup behavior, local exemptions, and router-originated service routing.

## DNS can outlive a gateway transition

Existing states, selected outbound interfaces, forwarding-mode upstream servers, or stale resolver state can make partial pages load while dependent hostnames fail. Test raw IP connectivity and multiple fresh DNS names during failover. Verify whether Unbound is recursive or forwarding and which source/gateway it uses.

## Save is not apply

Many OPNsense components separate model persistence from runtime reconfiguration. Call and verify the relevant apply/reconfigure action.

## Successful broad endpoints can cause collateral changes

Setup-wizard and initial-configuration operations may rewrite gateways, DNS, DHCP, or other fields beyond the submitted value. Use narrow controllers and diff the whole configuration after unfamiliar operations.

## API payload formats differ

Some installed controllers accept nested form fields where an assumed JSON body fails validation. Inspect the installed GUI request, API model, and response rather than retrying blind variants.

## DHCP configuration and activation are separate decisions

Stage scopes and reservations without enabling the service when an old DHCP server is still authoritative. Detect duplicate IPs, MACs, and out-of-scope reservations before cutover.

## Certificate migration is identity migration

Prefer a new CA, new server certificate, and separate per-user certificates rather than carrying shared identities forward. Require users to reset temporary passwords. Never publish complete client profiles.

## Hardware crypto settings do not guarantee throughput

Confirm CPU capabilities, selected algorithms, driver/offload settings, tunnel MTU/MSS, buffers, DCO availability, and measured end-to-end performance. Hardware offload can help some paths and interfere with others.

## Package names do not imply feature parity

pfBlockerNG, monitoring exporters, discovery daemons, certificate automation, and other packages may require OPNsense-specific plugins or redesign. Inventory package intent, not just package names.
