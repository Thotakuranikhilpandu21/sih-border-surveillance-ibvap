# UI/UX & Frontend Architecture Specification

## Project Title
**IBVAP — Intelligent Border Video Analytics Platform**  
*(SIH Problem Statement ID: SIH26187)*

---

## 1. Design Philosophy & High-Contrast Defense Theme

The user interface is tailored for military, border security command centers, and tactical operators who monitor high-density information for extended hours.

* **Primary Theme:** Dark Military Tactical (Deep Slate `#0F172A`, Dark Onyx `#020617`, Charcoal Panels `#1E293B`).
* **Accent & Alert Colors:**
  * 🔴 **Critical Breach / Threat:** Vivid Red (`#EF4444`) with pulsing glows.
  * 🟡 **Warning / Suspicious:** Amber Gold (`#F59E0B`).
  * 🟢 **Normal Stream / Operational:** Emerald Green (`#10B981`).
  * 🔵 **Tactical System Blue:** Electric Cyan (`#06B6D4`).
* **Typography:** Clean, high-legibility sans-serif (`Inter`, `JetBrains Mono` for telemetry and system timestamps).

---

## 2. Core Dashboard Layout & Wireframe Blueprint

The main application layout follows a 3-panel command dashboard:

```
+---------------------------------------------------------------------------------------------------+
|  [SHIELD LOGO] IBVAP - BORDER SURVEILLANCE COMMAND  |  BOP: SECTOR 4-ALPHA  | 🔴 2 CRITICAL ALERTS |
+---------------------------------------------------------------------------------------------------+
|               |                                                   |                               |
| CAMERA TREE   |                 LIVE STREAM GRID                  |        REAL-TIME ALERT        |
| LIST          |               (Customizable Grid)                 |          FEED PANEL           |
|               |                                                   |                               |
| [Search...]   | +-----------------------+ +---------------------+ | +---------------------------+ |
|               | | CAM-01 (BOP North)    | | CAM-02 (Fence Line)| | | 🔴 CRITICAL - 11:22:04    | |
| [x] CAM-01    | | [ LIVE CANVAS VIDEO ] | | [ LIVE CANVAS VIDEO]| | | Polygon Breach (Zone B)   | |
| [x] CAM-02    | | Bounding Boxes (Red)  | | Tripwire Line (Yel) | | | [ Snapshot Image ]        | |
| [ ] CAM-03    | | [Target ID #104]      | |                     | | | [ ACKNOWLEDGE ] [DISPATCH]| |
| [x] CAM-04    | +-----------------------+ +---------------------+ | +---------------------------+ |
|               | +-----------------------+ +---------------------+ | | 🟡 WARNING - 11:18:20     | |
| --- ZONES --- | | CAM-03 (Thermal-East) | | CAM-04 (Checkpost)  | | | ANPR Hit: KA-04-E-1234  | |
| Zone Alpha    | | [ LOW-LIGHT FILTER ]  | | ANPR Overlay        | | | Conf: 94.2%               | |
| Zone Beta     | +-----------------------+ +---------------------+ | +---------------------------+ |
|               |                                                   |                               |
+---------------------------------------------------------------------------------------------------+
| TELEMETRY FOOTER: SYSTEM CPU: 34% | GPU: 68% | LATENCY: 24ms | STREAM STATUS: 4 ACTIVE / 0 DOWN      |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Key Interactive Components

### 3.1 Live Video Canvas Overlay Component
- **HTML5 Canvas stacked on top of Video Element.**
- Receives bounding box coordinates via WebSocket array: `[ {x1, y1, x2, y2, label, tracking_id, confidence, color} ]`.
- Canvas continuously renders bounding boxes, velocity vector trailing dots, and static polygon zones with high-contrast stroked paths and semi-transparent fills.

### 3.2 Interactive Zone & Tripwire Polygon Drawer
- Operators switch to **"Zone Setup Mode"**.
- Video frame freezes or continues in background while user clicks points to define a polygon region or draws line tripwires.
- Provides interactive handles to drag vertices, define zone names, assign threat severity, and set directional logic (e.g., Left-to-Right crossing trigger).

### 3.3 Real-Time Alert Triage & Sound System
- Audio beacon (adjustable frequency synth tone) triggers on **CRITICAL** severity events.
- Quick action buttons on each alert card:
  - **Acknowledge:** Stops sound chime and highlights card as handled.
  - **Dispatch Team:** Opens quick dispatch modal to log tactical unit dispatch.
  - **False Alarm:** Dismisses alert and logs feedback for model re-training.

### 3.4 ANPR & Facial Recognition Intelligence Hub
- **Filter Bar:** Search by license plate string, face match target, camera ID, and date-time range.
- **Card Matrix View:** Displays snapshot grid showing cropped plate/face photos alongside matched database photos with similarity percentage.