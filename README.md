# rtsp-2-protect

An ONVIF bridge that makes RTSP camera streams appear as genuine IP cameras in UniFi Protect.

## The Problem

UniFi Protect won't add cameras unless they respond to ONVIF discovery and serve compliant SOAP endpoints. It also deduplicates cameras by MAC address — so you can't fake multiple cameras from a single host using IP aliases.

## How It Works

Each camera runs as its own Docker container with a unique MAC address via [macvlan networking](https://docs.docker.com/network/drivers/macvlan/). From Protect's perspective, each container is a real camera on the LAN.

Inside each container:
- **mediamtx** restreams the upstream RTSP source (e.g. from a DVR) on port 8554
- **ONVIF HTTP server** answers `GetCapabilities`, `GetProfiles`, `GetStreamUri`, etc.
- **WS-Discovery** (UDP 3702) responds to Protect's multicast probes so cameras appear automatically

## Quick Start

**1. Clone and configure**

```bash
git clone https://github.com/eddwills95/rtsp-2-protect.git
cd rtsp-2-protect
cp .env.template .env
```

Edit `.env` with your RTSP URLs:

```env
NETWORK_INTERFACE=eth0          # your server's physical NIC (eno1, eth0, etc.)
CAM1_RTSP_URL=rtsp://admin:password@192.168.1.x:554/stream?channel=2
CAM2_RTSP_URL=rtsp://admin:password@192.168.1.x:554/stream?channel=3
# ... add as many as you need
```

**2. Update camera names in `docker-compose.yml`**

Edit `CAMERA_NAME` for each service to match your camera locations.

**3. Deploy**

```bash
docker compose up -d
```

Protect will auto-discover the cameras via WS-Discovery within a minute. Go to **Protect → Cameras → Add** if they don't appear automatically.

## Requirements

- Docker with macvlan support (Linux host recommended — works on Raspberry Pi, any x86 server)
- Your server must be on the same LAN as the UniFi Cloud Key / Dream Machine running Protect
- Upstream RTSP streams (e.g. from a DVR or NVR)

> **Mac note:** macvlan requires OrbStack. Set `NETWORK_INTERFACE=en0`.

## Adding or Removing Cameras

Copy an existing service block in `docker-compose.yml`, assign a new `ipv4_address` on your LAN subnet, and add the corresponding `CAM{n}_RTSP_URL` to `.env`. Redeploy with `docker compose up -d`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NETWORK_INTERFACE` | `eth0` | macvlan parent interface |
| `CAM{n}_RTSP_URL` | — | Upstream RTSP URL for camera n |
| `CAMERA_ID` | — | Set per-container in compose (e.g. `cam1`) |
| `CAMERA_NAME` | — | Display name in Protect (e.g. `Patio`) |
| `CAMERA_RTSP_URL` | — | Set per-container in compose |
| `CAMERA_PORT` | `8080` | ONVIF HTTP port |
| `RTSP_STREAM_PORT` | `8554` | mediamtx RTSP output port |

## Supported ONVIF Actions

- `GetSystemDateAndTime`
- `GetCapabilities` / `GetServices` / `GetScopes`
- `GetDeviceInformation`
- `GetUsers`
- `GetProfiles` / `GetVideoSources`
- `GetStreamUri`
- `GetSnapshotUri`

## Contributing

PRs welcome. See [CLAUDE.md](CLAUDE.md) for architecture details and how to add new ONVIF actions.

## License

MIT
