import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import cameras, alerts, anpr, watchlist, zones, analytics, websocket

app = FastAPI(
    title="IBVAP — Intelligent Border Video Analytics Platform API",
    description="Backend API engine for real-time video surveillance analytics, ANPR, face watchlist, and spatial breach detection (SIH26187)",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "IBVAP Engine",
        "version": "1.0.0",
        "bop_assignment": "BOP SECTOR 4-ALPHA",
        "docs": "/docs"
    }

app.include_router(cameras.router)
app.include_router(alerts.router)
app.include_router(anpr.router)
app.include_router(watchlist.router)
app.include_router(zones.router)
app.include_router(analytics.router)
app.include_router(websocket.router)
