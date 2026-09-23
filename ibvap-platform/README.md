# IBVAP Platform — Intelligent Border Video Analytics Platform

**SIH Problem Statement ID: SIH26187**

IBVAP is a production-grade AI video analytics platform engineered for military border outpost (BOP) surveillance, checkpost ANPR inspection, and virtual fence perimeter security.

## 📁 Repository Layout

```
ibvap-platform/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── schemas.py
│   │   └── ORM_models.py
│   ├── vision_engine/
│   │   ├── stream_manager.py
│   │   ├── object_detector.py
│   │   ├── virtual_fence.py
│   │   ├── anpr_engine.py
│   │   ├── frs_engine.py
│   │   └── frame_enhancer.py
│   └── routers/
│       ├── cameras.py
│       ├── alerts.py
│       ├── zones.py
│       ├── intelligence.py
│       └── ws.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

## 🚀 Quick Launch via Docker

```bash
docker-compose up --build
```
- Frontend Web App: `http://localhost:3000`
- FastAPI REST Backend: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)
