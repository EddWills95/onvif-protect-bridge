import { execSync } from "node:child_process";
import { networkInterfaces } from "node:os";

function getDefaultInterface(): string {
  try {
    if (process.platform === "darwin") {
      const out = execSync("route -n get default 2>/dev/null").toString();
      const match = out.match(/interface:\s+(\S+)/);
      return match?.[1] ?? "en0";
    } else {
      const out = execSync("ip route show default 2>/dev/null").toString();
      const match = out.match(/dev\s+(\S+)/);
      return match?.[1] ?? "eth0";
    }
  } catch {
    return process.platform === "darwin" ? "en0" : "eth0";
  }
}

function isAliasActive(ip: string): boolean {
  const ifaces = networkInterfaces();
  return Object.values(ifaces)
    .flat()
    .some((entry) => entry?.address === ip);
}

function isIpInUse(ip: string): boolean {
  try {
    // -c 1: single packet, -t/-W 1: 1s timeout, stdio ignored (we only care about exit code)
    const timeoutFlag = process.platform === "darwin" ? "-t" : "-W";
    execSync(`ping -c 1 ${timeoutFlag} 1 ${ip}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function addIpAliases(ips: string[]): Set<string> {
  const iface = getDefaultInterface();
  const added = new Set<string>();
  for (const ip of ips) {
    if (isAliasActive(ip)) {
      console.log(`  IP alias ${ip} already active`);
      added.add(ip);
      continue;
    }
    if (isIpInUse(ip)) {
      console.error(`  ⚠️  ${ip} is already in use on the network — skipping (choose a different IP in cameras.yml)`);
      continue;
    }
    try {
      if (process.platform === "darwin") {
        execSync(`ifconfig ${iface} alias ${ip} 255.255.255.0`);
      } else {
        execSync(`ip addr add ${ip}/24 dev ${iface}`);
      }
      console.log(`  Added IP alias ${ip} on ${iface}`);
      added.add(ip);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  Failed to add IP alias ${ip}: ${msg}`);
      console.warn(`  Run with sudo (or CAP_NET_ADMIN on Linux) to enable per-camera IPs`);
    }
  }
  return added;
}

export function removeIpAliases(ips: string[]): void {
  const iface = getDefaultInterface();
  for (const ip of ips) {
    if (!isAliasActive(ip)) continue;
    try {
      if (process.platform === "darwin") {
        execSync(`ifconfig ${iface} -alias ${ip}`);
      } else {
        execSync(`ip addr del ${ip}/24 dev ${iface}`);
      }
      console.log(`  Removed IP alias ${ip}`);
    } catch {
      // best-effort on shutdown
    }
  }
}
