# IBVAP — Intelligent Border Video Analytics Platform (SIH26187)

AI-driven, software-only video analytics platform for border surveillance across Border Out Posts (BOPs), strategic check posts, and perimeter fences. Hooks into IP CCTV cameras (RTSP/ONVIF) without requiring expensive dedicated hardware.

## 🚀 Key Features

- **Live Tactical Multi-Camera Grid:** Synthetic RTSP/ONVIF video simulation streaming AI bounding boxes, tracking vectors, and polygon zone overlays over WebSockets (<100ms latency).
- **Interactive Zone & Tripwire Configurator:** Visual click-and-draw polygon ROI and directional tripwires with Ray-Casting spatial breach algorithms.
- **Real-Time Alert Triage Console:** Prioritized incident feed (Critical, High, Medium) with Web Audio synthesized sirens, visual snapshots, and 1-click dispatch/acknowledge.
- **ANPR & FRS Intelligence Hub:** Vehicle plate optical character recognition (OCR) and suspect face vector watchlist matching (512-dim ArcFace embeddings with cosine distance index).
- **Surveillance Analytics Dashboard:** Recharts metrics, hourly intrusion trends, breach frequency per zone, and exportable PDF/CSV reports.
- **Tactical Dark Theme:** High-contrast military design (#0B0F19 background, CLAHE night vision filter simulation).

## 🛠️ Tech Stack

- **Backend:** Python 3 (FastAPI, WebSockets, Uvicorn, SQLite)
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, HTML5 Canvas API, Web Audio API

## ⚡ Quick Start

### 1. Backend Server Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend API will be live on `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Dashboard will be live on `http://localhost:3000`.
