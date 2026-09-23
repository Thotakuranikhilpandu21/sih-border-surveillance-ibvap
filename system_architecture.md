# System Architecture & Technical Specification

## Project Title
**IBVAP — Intelligent Border Video Analytics Platform**  
*(SIH Problem Statement ID: SIH26187)*

---

## 1. High-Level System Architecture

The IBVAP system follows an asynchronous, event-driven, microservices-style architecture designed for low latency, high throughput, and fault tolerance at edge locations (Border Out Posts - BOPs).

```
+---------------------------------------------------------------------------------------------------+
|                                      EDGE CAMERA NETWORK                                          |
|  [ IP Camera 1 ]        [ IP Camera 2 ]        [ PTZ Camera 3 ]       [ Thermal Camera 4 ]          |
|  (RTSP/ONVIF Stream)    (RTSP/ONVIF Stream)    (RTSP/ONVIF Stream)    (RTSP/ONVIF Stream)            |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  INGESTION & DECODING LAYER                                      |
|  - FFmpeg / GStreamer Hardware Accelerated Decoders (NVDEC/VAAPI/OpenVINO)                         |
|  - Frame Downsampling, Resizing & Format Conversion (YUV420p -> RGB)                             |
|  - Adaptive Frame Dropping Buffer (Dynamic FPS adjustment based on system load)                   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  AI INFERENCE ENGINE PIPELINE                                     |
|                                                                                                   |
|  +---------------------------+  +---------------------------+  +-------------------------------+  |
|  | Multi-Object Detection    |  | Feature Extraction &      |  | Optical Character             |  |
|  | & Tracking                |  | Face Embedding            |  | Recognition (ANPR)            |  |
|  | (YOLOv8/v10 + ByteTrack)  |  | (ArcFace / InsightFace)   |  | (PaddleOCR / Fast-Plate-OCR)  |  |
|  +---------------------------+  +---------------------------+  +-------------------------------+  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | Spatial & Temporal Logic Engine                                                             |  |
|  | - Polygon ROI Boundary Intersection Algorithm (Ray-Casting)                                 |  |
|  | - Tripwire Directional Crossing Analytics                                                   |  |
|  | - Loitering & Stationary Time Accumulator                                                    |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                               MESSAGE BUS & VECTOR DATABASE SERVER                                |
|  - Redis Pub/Sub (Real-time stream event publishing)                                             |
|  - FAISS / Chroma DB (Vector Similarity Index for Face Watchlist matching)                         |
|  - SQLite / PostgreSQL (Relational metadata, configs, logs, snapshot references)                   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  FASTAPI APPLICATION SERVER                                       |
|  - WebSockets Server (Real-time alert dispatch to UI <500ms)                                      |
|  - RESTful API Endpoints (Camera management, zone setup, historical search, system state)         |
|  - Auth & Access Control Layer (JWT, Role-Based Access Control - RBAC)                            |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                REACT & TAILWIND FRONTEND DASHBOARD                                |
|  - Live Command Multi-Grid Stream Viewer (Canvas bounding box rendering)                          |
|  - Interactive Vector Zone Drawing Engine (Fabric.js / Canvas API)                                |
|  - Real-Time Sound & Visual Alert Triage Center                                                   |
|  - ANPR & FRS Historical Intelligence Querying Module                                            |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Ingestion & Preprocessing Engine

### 2.1 Video Ingestion Pipeline
- **RTSP Reader Threading:** Each registered active camera runs on an isolated daemon process using Python's `multiprocessing` or C++ bindings to avoid Python's Global Interpreter Lock (GIL).
- **Zero-Copy Frame Handling:** Decoded frames are directly held in shared GPU memory (CUDA Tensors) or SharedMemory blocks in RAM to avoid expensive CPU-to-GPU memory copy overhead.
- **Auto-Reconnection Logic:** Handles network packet drops or camera restarts gracefully with an exponential backoff reconnect policy.

### 2.2 Night-Time & Thermal Image Preprocessing
- **Contrast Limited Adaptive Histogram Equalization (CLAHE):** Applied dynamically when low light is detected (calculated using mean pixel intensity of the luminance channel Y in YUV space).
- **Noise Reduction:** Fast Non-Local Means Denoising applied selectively to high-noise nighttime channels before passing to detection models.

---

## 3. Computer Vision & Intelligence Pipeline

```
Raw Frame 
  │
  ├──> [ YOLOv8/v10 Detector ] ──> Bounding Boxes + Class IDs + Confidence
  │                                     │
  │                                     ▼
  ├──> [ ByteTrack Tracker ] ─────────> Track IDs + Trajectory Vectors
  │                                     │
  ├─── If Class == "Vehicle" ───────────┼─> [ License Plate Detector ] ──> [ PaddleOCR ] ──> License Text
  │                                     │
  ├─── If Class == "Person" ────────────┼─> [ Face Detector (RetinaFace) ] ──> [ ArcFace ] ──> 512d Vector ──> [ FAISS Match ]
  │                                     │
  └─────────────────────────────────────┴─> [ ROI / Virtual Fence Evaluator ]
                                                │
                                                ├─> Polygon Intersection Check
                                                ├─> Directional Line-Cross Check
                                                └─> Trigger Alert Event if Breach = True
```

### 3.1 Model Stack Specifications
1. **Primary Object Detector:** YOLOv8/YOLOv10 (TensorRT optimized format `.engine`). Target FPS: $\ge 30\text{ FPS}$ on GPU.
2. **Multi-Object Tracking (MOT):** ByteTrack algorithm maintaining object ID continuity across occlusions.
3. **ANPR Pipeline:** 
   - Step 1: Detect plate bounding box using specialized light YOLO model.
   - Step 2: Perspective transform & deskew plate crop.
   - Step 3: Run PaddleOCR/EasyOCR for character recognition.
4. **Facial Recognition (FRS) Pipeline:**
   - Step 1: Detect faces using RetinaFace / YuNet.
   - Step 2: Extract 512-dimensional embedding using ArcFace.
   - Step 3: Query FAISS Index using Cosine Similarity ($\text{threshold} \ge 0.72$).

---

## 4. Real-time Event & Alert Dispatch

1. **Detection Event Triggered:** When a rule violation occurs (e.g., person inside Restricted Polygon Zone `BOP_ALPHA_01`), an event JSON payload is created.
2. **Snapshot Capture:** The exact video frame and cropped bounding box image are saved to local persistent storage (`/data/snapshots/YYYY/MM/DD/`).
3. **Redis Event Broadcast:** Event payload is pushed to Redis channel `alerts:live`.
4. **WebSocket Server Dispatch:** FastAPI WebSocket server listens on Redis pub/sub and pushes structured JSON to all active web clients within $< 100\text{ms}$.