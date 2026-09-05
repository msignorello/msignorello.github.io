#!/usr/bin/env python3
"""Create a secret-minimized migration inventory from a pfSense backup XML."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Iterable


SECRET_TAGS = {
    "apikey", "api_key", "api_secret", "auth_pass", "bcrypt-hash", "crt",
    "password", "passwordfld", "private-key", "privatekey", "prv",
    "proxy_passwd", "psk", "secret", "sharedkey", "tls", "token",
}


def text(node: ET.Element | None, name: str, default: str = "") -> str:
    if node is None:
        return default
    child = node.find(name)
    return (child.text or "").strip() if child is not None else default


def texts(node: ET.Element | None, name: str) -> list[str]:
    if node is None:
        return []
    return [item.text.strip() for item in node.findall(name) if item.text and item.text.strip()]


def enabled(node: ET.Element | None, name: str = "enable") -> bool:
    if node is None:
        return False
    child = node.find(name)
    if child is None:
        return False
    return (child.text or "").strip().lower() not in {"0", "false", "no", "off", "disabled"}


def tokens(value: str) -> list[str]:
    return [token for token in value.replace("\n", " ").split() if token]


def endpoint(node: ET.Element | None) -> dict[str, Any]:
    if node is None:
        return {}
    result: dict[str, Any] = {}
    if node.find("any") is not None:
        result["any"] = True
    for name in ("network", "address", "port"):
        value = text(node, name)
        if value:
            result[name] = value
    if node.find("not") is not None:
        result["not"] = True
    return result


def interfaces(root: ET.Element) -> list[dict[str, Any]]:
    container = root.find("interfaces")
    if container is None:
        return []
    return [
        {
            "id": item.tag,
            "description": text(item, "descr"),
            "device": text(item, "if"),
            "enabled": item.tag in {"lan", "wan"} or enabled(item),
            "ipv4": text(item, "ipaddr"),
            "ipv4_prefix": text(item, "subnet"),
            "ipv4_gateway": text(item, "gateway"),
            "ipv6": text(item, "ipaddrv6"),
            "ipv6_prefix": text(item, "subnetv6"),
            "block_private": item.find("blockpriv") is not None,
            "block_bogons": item.find("blockbogons") is not None,
        }
        for item in list(container)
    ]


def dhcp(root: ET.Element) -> list[dict[str, Any]]:
    container = root.find("dhcpd")
    if container is None:
        return []
    scopes = []
    for scope in list(container):
        mappings = [
            {
                "mac": text(item, "mac"),
                "ip": text(item, "ipaddr"),
                "hostname": text(item, "hostname"),
                "description": text(item, "descr"),
            }
            for item in scope.findall("staticmap")
        ]
        range_node = scope.find("range")
        scopes.append(
            {
                "interface": scope.tag,
                "enabled": enabled(scope),
                "range": {"from": text(range_node, "from"), "to": text(range_node, "to")},
                "gateway": text(scope, "gateway"),
                "domain": text(scope, "domain"),
                "default_lease_time": text(scope, "defaultleasetime"),
                "maximum_lease_time": text(scope, "maxleasetime"),
                "reservation_count": len(mappings),
                "static_mappings": mappings,
            }
        )
    return scopes


def dns(root: ET.Element) -> dict[str, Any]:
    system = root.find("system")
    unbound = root.find("unbound")
    overrides = []
    if unbound is not None:
        overrides = [
            {
                "host": text(item, "host"),
                "domain": text(item, "domain"),
                "ip": text(item, "ip"),
                "description": text(item, "descr"),
                "alias_count": len(item.findall("./aliases/item")),
            }
            for item in unbound.findall("hosts")
        ]
    return {
        "system_servers": texts(system, "dnsserver"),
        "system_server_gateways": [text(system, f"dns{index}gw") for index in range(1, 5)],
        "unbound": {
            "present": unbound is not None,
            "enabled": enabled(unbound),
            "forwarding": enabled(unbound, "forwarding"),
            "active_interfaces": tokens(text(unbound, "active_interface")),
            "outgoing_interfaces": tokens(text(unbound, "outgoing_interface")),
            "host_override_count": len(overrides),
            "host_overrides": overrides,
            "has_custom_options": bool(text(unbound, "custom_options")),
        },
    }


def aliases(root: ET.Element) -> list[dict[str, Any]]:
    container = root.find("aliases")
    if container is None:
        return []
    result = []
    for item in container.findall("alias"):
        entries = tokens(text(item, "address"))
        result.append(
            {
                "name": text(item, "name"),
                "type": text(item, "type"),
                "description": text(item, "descr"),
                "entry_count": len(entries),
                "entries": entries,
                "has_url": bool(text(item, "url")),
            }
        )
    return result


def gateways(root: ET.Element) -> dict[str, Any]:
    container = root.find("gateways")
    if container is None:
        return {"items": [], "groups": []}
    items = [
        {
            "name": text(item, "name"),
            "interface": text(item, "interface"),
            "gateway": text(item, "gateway"),
            "monitor": text(item, "monitor"),
            "description": text(item, "descr"),
            "ip_protocol": text(item, "ipprotocol"),
            "disabled": item.find("disabled") is not None,
        }
        for item in container.findall("gateway_item")
    ]
    groups = [
        {
            "name": text(item, "name"),
            "description": text(item, "descr"),
            "members": texts(item, "item"),
            "trigger": text(item, "trigger"),
        }
        for item in container.findall("gateway_group")
    ]
    return {"items": items, "groups": groups}


def safe_rule(item: ET.Element) -> dict[str, Any]:
    return {
        "description": text(item, "descr"),
        "disabled": item.find("disabled") is not None,
        "type": text(item, "type", "pass"),
        "interface": text(item, "interface"),
        "direction": text(item, "direction"),
        "ip_protocol": text(item, "ipprotocol"),
        "protocol": text(item, "protocol"),
        "source": endpoint(item.find("source")),
        "destination": endpoint(item.find("destination")),
        "gateway": text(item, "gateway"),
        "floating": item.find("floating") is not None,
        "quick": item.find("quick") is not None,
        "logged": item.find("log") is not None,
    }


def nat(root: ET.Element) -> dict[str, Any]:
    container = root.find("nat")
    if container is None:
        return {"port_forwards": [], "outbound": {"mode": "", "rules": []}}
    forwards = [
        {
            "description": text(item, "descr"),
            "disabled": item.find("disabled") is not None,
            "interface": text(item, "interface"),
            "ip_protocol": text(item, "ipprotocol"),
            "protocol": text(item, "protocol"),
            "source": endpoint(item.find("source")),
            "destination": endpoint(item.find("destination")),
            "target": text(item, "target"),
            "target_port": text(item, "local-port"),
            "associated_rule": text(item, "associated-rule-id"),
        }
        for item in container.findall("rule")
    ]
    outbound = container.find("outbound")
    outbound_rules = [] if outbound is None else [
        {
            "description": text(item, "descr"),
            "disabled": item.find("disabled") is not None,
            "interface": text(item, "interface"),
            "source": endpoint(item.find("source")),
            "destination": endpoint(item.find("destination")),
            "target": text(item, "target"),
            "source_port": text(item, "sourceport"),
        }
        for item in outbound.findall("rule")
    ]
    return {"port_forwards": forwards, "outbound": {"mode": text(outbound, "mode"), "rules": outbound_rules}}


def openvpn(root: ET.Element) -> dict[str, Any]:
    container = root.find("openvpn")
    if container is None:
        return {"servers": [], "clients": []}

    def common(item: ET.Element) -> dict[str, Any]:
        return {
            "description": text(item, "description"),
            "disabled": item.find("disable") is not None,
            "mode": text(item, "mode"),
            "device_mode": text(item, "dev_mode"),
            "protocol": text(item, "protocol"),
            "interface": text(item, "interface"),
            "local_port": text(item, "local_port"),
            "tunnel_network": text(item, "tunnel_network"),
            "remote_network": text(item, "remote_network"),
            "data_ciphers": text(item, "data_ciphers"),
            "digest": text(item, "digest"),
            "topology": text(item, "topology"),
            "ca_reference": text(item, "caref"),
            "certificate_reference": text(item, "certref"),
            "has_tls_key": item.find("tls") is not None,
            "has_custom_options": bool(text(item, "custom_options")),
        }

    servers = []
    for item in container.findall("openvpn-server"):
        record = common(item)
        record.update(
            {
                "authentication_mode": text(item, "authmode"),
                "local_network": text(item, "local_network"),
                "redirect_gateway": enabled(item, "gwredir"),
                "client_to_client": enabled(item, "client2client"),
                "dns_servers": [text(item, f"dns_server{index}") for index in range(1, 5)],
            }
        )
        servers.append(record)
    clients = []
    for item in container.findall("openvpn-client"):
        record = common(item)
        record.update(
            {
                "server_address": text(item, "server_addr"),
                "server_port": text(item, "server_port"),
                "route_no_pull": enabled(item, "route_no_pull"),
                "create_gateway": enabled(item, "create_gw"),
                "has_username": bool(text(item, "auth_user")),
                "has_password": item.find("auth_pass") is not None,
            }
        )
        clients.append(record)
    return {"servers": servers, "clients": clients}


def identities(root: ET.Element) -> dict[str, Any]:
    system = root.find("system")
    users = [] if system is None else [
        {
            "name": text(item, "name"),
            "description": text(item, "descr"),
            "scope": text(item, "scope"),
            "groups": texts(item, "groupname"),
            "privilege_count": len(item.findall("./priv/item")),
            "has_password_hash": item.find("bcrypt-hash") is not None,
        }
        for item in system.findall("user")
    ]
    authorities = [
        {"description": text(item, "descr"), "reference": text(item, "refid"), "has_private_key": item.find("prv") is not None}
        for item in root.findall("ca")
    ]
    certificates = [
        {
            "description": text(item, "descr"),
            "reference": text(item, "refid"),
            "ca_reference": text(item, "caref"),
            "type": text(item, "type"),
            "has_private_key": item.find("prv") is not None,
        }
        for item in root.findall("cert")
    ]
    return {"users": users, "authorities": authorities, "certificates": certificates}


def dynamic_dns(root: ET.Element) -> list[dict[str, Any]]:
    container = root.find("dyndnses")
    if container is None:
        return []
    return [
        {
            "description": text(item, "descr"),
            "enabled": enabled(item),
            "provider": text(item, "type"),
            "interface": text(item, "interface"),
            "host": text(item, "host"),
            "domain": text(item, "domainname"),
            "has_username": bool(text(item, "username")),
            "has_password": item.find("password") is not None,
            "has_custom_update_url": bool(text(item, "updateurl")),
        }
        for item in container.findall("dyndns")
    ]


def installed_packages(root: ET.Element) -> list[str]:
    container = root.find("installedpackages")
    names = [] if container is None else [text(item, "name") for item in container.findall("package")]
    return sorted({name for name in names if name}, key=str.lower)


def sensitive_counts(root: ET.Element) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in root.iter():
        tag = item.tag.lower()
        if tag in SECRET_TAGS:
            counts[tag] = counts.get(tag, 0) + 1
    return dict(sorted(counts.items()))


def inventory(path: Path) -> dict[str, Any]:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    root = ET.parse(path).getroot()
    if root.tag not in {"pfsense", "opnsense"}:
        raise ValueError(f"unexpected root element: {root.tag}")
    system = root.find("system")
    filter_node = root.find("filter")
    return {
        "inventory_format": 1,
        "source": {"product": root.tag, "file": path.name, "sha256": digest, "configuration_version": text(root, "version")},
        "system": {
            "hostname": text(system, "hostname"),
            "domain": text(system, "domain"),
            "timezone": text(system, "timezone"),
            "optimization": text(system, "optimization"),
            "crypto_hardware": text(system, "crypto_hardware"),
            "checksum_offload_disabled": system is not None and system.find("disablechecksumoffloading") is not None,
            "segmentation_offload_disabled": system is not None and system.find("disablesegmentationoffloading") is not None,
            "large_receive_offload_disabled": system is not None and system.find("disablelargereceiveoffloading") is not None,
            "gateway_down_state_kill": system is not None and system.find("gw_down_kill_states") is not None,
        },
        "interfaces": interfaces(root),
        "gateways": gateways(root),
        "dhcp": dhcp(root),
        "dns": dns(root),
        "dynamic_dns": dynamic_dns(root),
        "identities": identities(root),
        "openvpn": openvpn(root),
        "aliases": aliases(root),
        "firewall_rules": [] if filter_node is None else [safe_rule(item) for item in filter_node.findall("rule")],
        "nat": nat(root),
        "installed_packages": installed_packages(root),
        "safety": {
            "secret_values_included": False,
            "sensitive_xml_tags_detected": sensitive_counts(root),
            "notice": "Known secret-bearing values are omitted. Operational identifiers remain unless --public is used.",
        },
    }


def make_public(data: dict[str, Any]) -> dict[str, Any]:
    data = json.loads(json.dumps(data))
    data["source"].update(file="<redacted-config.xml>", sha256="<redacted>")
    data["system"].update(hostname="<redacted>", domain="<redacted>")
    for item in data["interfaces"]:
        for key in ("description", "device", "ipv4", "ipv4_gateway", "ipv6"):
            if item.get(key):
                item[key] = "<redacted>"
    for item in data["gateways"]["items"]:
        for key in ("gateway", "monitor", "description"):
            if item.get(key):
                item[key] = "<redacted>"
    for item in data["dhcp"]:
        item["range"] = {"from": "<redacted>", "to": "<redacted>"}
        item["gateway"] = "<redacted>" if item.get("gateway") else ""
        item["domain"] = "<redacted>" if item.get("domain") else ""
        item.pop("static_mappings", None)
    data["dns"]["system_servers"] = ["<redacted>"] * len(data["dns"]["system_servers"])
    data["dns"]["unbound"].pop("host_overrides", None)
    for item in data["dynamic_dns"]:
        for key in ("description", "host", "domain"):
            if item.get(key):
                item[key] = "<redacted>"
    data["identities"]["user_count"] = len(data["identities"]["users"])
    data["identities"]["users"] = []
    for key in ("authorities", "certificates"):
        for item in data["identities"][key]:
            for field in ("description", "reference", "ca_reference"):
                if item.get(field):
                    item[field] = "<redacted>"
    for collection in (data["openvpn"]["servers"], data["openvpn"]["clients"]):
        for item in collection:
            for key in ("description", "tunnel_network", "remote_network", "local_network", "server_address", "ca_reference", "certificate_reference"):
                if item.get(key):
                    item[key] = "<redacted>"
            if item.get("dns_servers"):
                item["dns_servers"] = ["<redacted>"] * len(item["dns_servers"])
    for item in data["aliases"]:
        item["description"] = "<redacted>" if item.get("description") else ""
        item.pop("entries", None)
    for item in data["firewall_rules"]:
        item["description"] = "<redacted>" if item.get("description") else ""
        item["source"] = {"redacted": True}
        item["destination"] = {"redacted": True}
    for group in (data["nat"]["port_forwards"], data["nat"]["outbound"]["rules"]):
        for item in group:
            item["description"] = "<redacted>" if item.get("description") else ""
            item["source"] = {"redacted": True}
            item["destination"] = {"redacted": True}
            item["target"] = "<redacted>" if item.get("target") else ""
    data["safety"].update(public_mode=True, notice="Host-level identifiers and known secrets are omitted. Manually review before publication.")
    return data


def table(headers: list[str], rows: Iterable[Iterable[Any]]) -> list[str]:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    lines.extend("| " + " | ".join(str(value).replace("|", "\\|") for value in row) + " |" for row in rows)
    return lines


def markdown(data: dict[str, Any]) -> str:
    counts = [
        ("Interfaces", len(data["interfaces"])), ("Gateway items", len(data["gateways"]["items"])),
        ("Gateway groups", len(data["gateways"]["groups"])), ("DHCP scopes", len(data["dhcp"])),
        ("DHCP reservations", sum(item["reservation_count"] for item in data["dhcp"])),
        ("DNS host overrides", data["dns"]["unbound"]["host_override_count"]),
        ("Dynamic DNS records", len(data["dynamic_dns"])), ("Users", len(data["identities"]["users"])),
        ("Certificate authorities", len(data["identities"]["authorities"])),
        ("Certificates", len(data["identities"]["certificates"])),
        ("OpenVPN servers", len(data["openvpn"]["servers"])), ("OpenVPN clients", len(data["openvpn"]["clients"])),
        ("Aliases", len(data["aliases"])), ("Firewall rules", len(data["firewall_rules"])),
        ("Port forwards", len(data["nat"]["port_forwards"])),
        ("Outbound NAT rules", len(data["nat"]["outbound"]["rules"])),
        ("Installed packages", len(data["installed_packages"])),
    ]
    lines = [
        "# pfSense migration inventory", "", f"- Product: `{data['source']['product']}`",
        f"- Configuration version: `{data['source']['configuration_version'] or 'unknown'}`",
        f"- Source file: `{data['source']['file']}`", f"- SHA-256: `{data['source']['sha256']}`",
        "- Secret values included: **no**", "", "## System", "",
        f"- Host: `{data['system']['hostname']}.{data['system']['domain']}`",
        f"- Timezone: `{data['system']['timezone']}`",
        f"- Crypto hardware: `{data['system']['crypto_hardware'] or 'not specified'}`", "", "## Summary", "",
    ]
    lines.extend(table(["Area", "Count"], counts))
    lines.extend(["", "## Interfaces", ""])
    lines.extend(table(["ID", "Description", "Device", "Enabled", "IPv4", "Prefix", "Gateway"], (
        (item["id"], item["description"], item["device"], item["enabled"], item["ipv4"], item["ipv4_prefix"], item["ipv4_gateway"])
        for item in data["interfaces"]
    )))
    lines.extend(["", "## DHCP", ""])
    lines.extend(table(["Interface", "Enabled", "Range", "Reservations", "Domain"], (
        (item["interface"], item["enabled"], f"{item['range']['from']} - {item['range']['to']}", item["reservation_count"], item["domain"])
        for item in data["dhcp"]
    )))
    lines.extend(["", "## Aliases", ""])
    lines.extend(table(["Name", "Type", "Entries", "Description"], (
        (item["name"], item["type"], item["entry_count"], item["description"]) for item in data["aliases"]
    )))
    lines.extend(["", "## Packages", "", ", ".join(data["installed_packages"]) or "None detected.", "", "## Safety notice", "", data["safety"]["notice"], "", "Use JSON output for the detailed secret-minimized migration inventory.", ""])
    return "\n".join(lines)


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path, help="pfSense backup XML")
    parser.add_argument("--format", choices=("json", "markdown"), default="json")
    parser.add_argument("--output", type=Path, help="write output to this file instead of stdout")
    parser.add_argument("--public", action="store_true", help="remove host-level identifiers for a shareable aggregate report")
    return parser.parse_args()


def main() -> int:
    args = arguments()
    try:
        if not args.config.is_file():
            raise FileNotFoundError(args.config)
        result = inventory(args.config)
        if args.public:
            result = make_public(result)
        rendered = json.dumps(result, indent=2, sort_keys=True) + "\n" if args.format == "json" else markdown(result)
        if args.output:
            args.output.write_text(rendered, encoding="utf-8")
        else:
            sys.stdout.write(rendered)
        return 0
    except (ET.ParseError, OSError, ValueError) as exc:
        print(f"inventory_pfsense: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
