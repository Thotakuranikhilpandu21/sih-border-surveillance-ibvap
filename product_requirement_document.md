# Product Requirement Document (PRD)

## Project Title

**IBVAP — Intelligent Border Video Analytics Platform**

*(SIH Problem Statement ID: SIH26187)*

## 1. Executive Summary & Problem Context

### 1.1 Context & Pain Points

Border security forces deploy CCTV infrastructure across **Border Out Posts (BOPs)**, strategic check posts, and remote transit roads. However, traditional systems:

* Require continuous human visual monitoring, leading to fatigue and delayed responses.

* Rely on recording rather than real-time threat detection.

* Lack automated identification features like Facial Recognition Systems (FRS), Automatic Number Plate Recognition (ANPR), and Virtual Fencing without expensive dedicated hardware.

### 1.2 The Solution

**IBVAP** is an AI-driven, software-only video analytics platform. It hooks directly into standard IP-based CCTV cameras (RTSP/ONVIF streams) and transforms existing passive infrastructure into an intelligent surveillance network without requiring hardware upgrades.

## 2. Core Functional Requirements

### 2.1 Video Ingestion & Stream Management

* **RTSP/ONVIF Stream Ingestion:** Multi-camera ingestion pipeline supporting standard RTSP streams.

* **Low Latency Streaming:** Real-time visual monitoring using WebRTC / HLS streaming protocols.

* **Adaptive Frame Skipping / Resampling:** Dynamically adjusts stream frame rates during low-bandwidth conditions without degrading AI accuracy.

### 2.2 Computer Vision Engine

* **Human & Vehicle Detection/Classification:** Detection of pedestrians, intruders, and vehicles (cars, trucks, bikes, military crafts) with bounding box tracking using YOLOv8 / YOLOv10 and ByteTrack/DeepSORT.

* **Virtual Fence Intrusion Detection:** User-defined digital tripwires and polygon Region-of-Interest (ROI) zones for real-time line-crossing and zone-intrusion alerts.

* **Automatic Number Plate Recognition (ANPR):** Detection, cropping, and optical character recognition (OCR) of license plates on moving vehicles using PaddleOCR / EasyOCR.

* **Face Detection & Recognition (FRS):** Face detection, embedding generation, and cross-matching against watchlist vector databases (using FAISS / Chroma DB).

* **Suspicious Activity & Loitering Analytics:** Detection of stationary loitering in restricted zones and directional anomaly detection.

* **Night-Time / Low-Light Processing:** Automated frame contrast enhancement (CLAHE / Gamma correction) for night vision surveillance.

### 2.3 Real-Time Alerting & Command Center

* **WebSocket Event Bus:** Push notifications with latency < 500ms for critical intrusion and match alerts.

* **Alert Prioritization Engine:** Tiered severity levels:

  * 🔴 **CRITICAL:** Virtual fence breach, Watchlist Face Match.

  * 🟡 **HIGH:** ANPR suspicious hit, unauthorized vehicle loitering.

  * 🔵 **MEDIUM/LOW:** Motion anomaly, camera obstruction.

* **Event Logging & Snapshot Capture:** Automatic storage of cropped snapshots, video clips, confidence scores, camera ID, and timestamp.

## 3. Web Application Architecture & UX/UI Specifications

### 3.1 Tech Stack

* **Frontend:** React.js, Tailwind CSS, Lucide Icons, Recharts, Canvas API / HTML5 Video player.

* **Backend API:** FastAPI (Python), WebSockets, Uvicorn.

* **Processing Pipeline:** OpenCV, PyTorch, YOLOv8, ByteTrack, PaddleOCR, FAISS.

* **Cache & Event Queue:** Redis / Async In-Memory Queue.

* **Database:** SQLite / PostgreSQL (Metadata, Users, Alerts, Camera Configs).

### 3.2 Key Views & Layout Strategy

1. **Live Command Center (Multi-Grid Dashboard):**

   * 2x2, 3x3, or 4x4 customizable video feeds.

   * Interactive Canvas overlay showing real-time bounding boxes, velocity vectors, and digital tripwires.

2. **Interactive Zone/ROI Configurator:**

   * Visual tool allowing operators to click and draw custom polygon ROI zones and tripwire lines directly over live video feeds.

3. **Real-time Alert Triage Panel:**

   * Right-side sliding feed showing incoming alerts with visual snapshots, confidence ratings, and quick actions ("Acknowledge", "Dispatch Team", "Dismiss").

4. **ANPR & FRS Intelligence Hub:**

   * Search and filter historical vehicle plate logs and facial detection records with search by date, camera, and plate number.

5. **Analytics & Heatmap Dashboard:**

   * Statistical visual charts (hourly activity, breach frequency by zone, vehicle/person ratios).

## 4. Non-Functional Requirements

* **Latency:** End-to-end alert trigger under 1 second from frame acquisition.

* **Hardware Agnostic:** Capability to run inference on edge servers or local workstation GPUs (NVIDIA CUDA support / CPU fallback via OpenVINO / ONNX runtime).

* **Security & Privacy:** Role-Based Access Control (RBAC) with hashed passwords (bcrypt) and encrypted video stream tokens.

* **Scalability:** Modular architecture allowing addition of new camera nodes without stopping the engine.

## 5. Development Roadmap for Hackathon Execution

| **Phase** | **Core Objective** | **Key Deliverables** | 
| **Phase 1** | Ingestion & Core UI | Dashboard layout, Mock video stream feeds, Camera Grid, Web interface setup | 
| **Phase 2** | Computer Vision Integration | YOLOv8 pipeline, ByteTrack tracker, Interactive ROI canvas overlays | 
| **Phase 3** | Intelligence Layer | ANPR OCR, FAISS Face Search, Virtual Fence breaches | 
| **Phase 4** | Real-Time Alerting | WebSocket integration, alert audio/visual cues, triage drawer | 
| **Phase 5** | Polish & Analytics | Heatmaps, statistical charts, exportable PDF/CSV reports | 
