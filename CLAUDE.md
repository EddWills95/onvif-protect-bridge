# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

`rtsp-2-protect` is an ONVIF bridge that makes one or more RTSP streams (e.g. from MediaMTX) appear as ONVIF-compliant IP cameras to UniFi Protect. It exposes:
- An HTTP server (Hono) answering ONVIF SOAP requests at `/onvif/{cameraId}/device_service` and `/onvif/{cameraId}/media_service` — one route pair per camera
- A UDP WS-Discovery server (port 3702) that responds to ONVIF Probe messages so Protect can auto-discover all virtual cameras

## Commands

```bash
# Run dev server
npm run dev

# Run tests (integration — requires server to be running on port 8000)
npm test

# Watch mode
npm run test:watch

# Run a single test file
npx vitest run tests/onvif.test.ts

# Run a single test by name pattern
npx vitest run --reporter=verbose -t "GetStreamUri"
```

> Tests in `tests/onvif.test.ts` are **integration tests** — they make real HTTP requests. Start the server with `npm run dev` before running them. The default test port is `8000` (set `ONVIF_PORT=8000` in `.env`). Tests assume a camera with `id: cam1` exists in `cameras.yml`.

## Camera Configuration

Cameras are defined in `cameras.yml` (gitignored — contains credentials). Copy `cameras.yml.template` to get started:

```yaml
cameras:
  - id: cam1
    name: Driveway
    rtsp_url: rtsp://192.168.1.247:554/stream   # upstream source (consumed by MediaMTX)
    username: admin
    password: secret
```

Each camera's `id` determines its route prefix and its MediaMTX restream path (e.g. `cam1` → `rtsp://host:8554/cam1`).

## Environment

Copy `.env.template` to `.env`. Key variables:

| Variable | Default | Notes |
|---|---|---|
| `CAMERAS_CONFIG` | `./cameras.yml` | Path to cameras YAML file |
| `ONVIF_PORT` | `8080` | HTTP port for ONVIF service |
| `RTSP_STREAM_PORT` | `8554` | Port of the MediaMTX restream server |
| `HOST_IP` | auto-detected | Must be the LAN IP reachable by Protect |

## Architecture

```
cameras.yml            — camera list (id, name, rtsp_url, username, password) — gitignored
src/
  server.ts            — entry point: loads cameras, mounts per-camera routes, starts WS-Discovery
  config/
    Config.ts          — reads env vars, validates global settings
    CameraLoader.ts    — reads cameras.yml with yaml package, returns Camera[]
  domain/Camera.ts     — value object: id, name, rtspUrl, credentials, UUID; rtspUri() → MediaMTX path
  middleware/
    soap.middleware.ts — extracts SOAP action name from body; stores action+body in Hono ctx
  routes/
    device.routes.ts   — POST /onvif/{id}/device_service → DeviceController
    media.routes.ts    — POST /onvif/{id}/media_service  → MediaController
  controllers/
    DeviceController   — dispatches action string → device service functions; holds cameraId for XAddr paths
    MediaController    — dispatches action string → media service functions; holds Camera instance
  services/
    device/            — one file per ONVIF device action (GetCapabilities, GetServices, …)
    media/             — one file per ONVIF media action (GetProfiles, GetStreamUri, …)
  utils/
    envelope.ts        — wraps XML in a SOAP envelope
    soapParser.ts      — extracts action name + detects WS-Security header
    getLocalIPv4.ts    — auto-detects LAN IP when HOST_IP is not set
    deviceIdentity.ts  — shared device identity constants
ws-discovery.ts        — UDP multicast listener; answers WS-Discovery Probe with one ProbeMatch per camera
```

### Adding a New ONVIF Action

1. Create `src/services/{device|media}/getMyAction.ts` — export a function returning a SOAP XML string (use `envelope()` from `utils/envelope.ts`).
2. Add the action name to the `*Action` union type in the relevant controller.
3. Add a `case "MyAction":` branch in the controller's `handle()` switch.
4. Add an integration test in `tests/onvif.test.ts`.

### SOAP Flow

Every ONVIF request is a `POST` with a SOAP envelope. `soapMiddleware` parses the action name from `<s:Body>` and stores it in Hono context variables (`soapAction`, `soapBody`). The controller reads `soapAction` and dispatches to the appropriate service function. Responses use `Content-Type: application/soap+xml`.

### XAddr URLs and Protect Compatibility

The `XAddr` fields returned by `GetCapabilities` and `GetServices` must exactly match the server's actual endpoint paths. With per-camera routing, they include the camera ID (e.g. `http://host:8080/onvif/cam1/media_service`). The WS-Discovery `ProbeMatch` `XAddrs` field must also match. These values are how Protect discovers where to send subsequent requests.
