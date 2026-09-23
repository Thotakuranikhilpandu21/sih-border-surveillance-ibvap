import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ZoneConfig } from './pages/ZoneConfig';
import { IntelligenceHub } from './pages/IntelligenceHub';
import { Analytics } from './pages/Analytics';
import { getCameras, getZones, getHistoricalAlerts } from './services/api';
import { alertWs } from './services/websocket';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cameras, setCameras] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [telemetryStreams, setTelemetryStreams] = useState<Record<string, any>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadInitialData();

    // Connect WS
    alertWs.connect();
    const unsubscribe = alertWs.subscribe((data) => {
      if (data.event_type === 'TELEMETRY_UPDATE' && Array.isArray(data.streams)) {
        const streamMap: Record<string, any> = {};
        const incomingAlerts: any[] = [];
        data.streams.forEach((s: any) => {
          streamMap[s.camera_id] = s;
          if (s.alerts && s.alerts.length > 0) {
            incomingAlerts.push(...s.alerts);
          }
        });
        setTelemetryStreams(streamMap);

        if (incomingAlerts.length > 0) {
          setAlerts((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newOnes = incomingAlerts.filter((a) => !existingIds.has(a.id));
            if (newOnes.length > 0) {
              return [...newOnes, ...prev];
            }
            return prev;
          });
        }
      }
    });

    return () => {
      unsubscribe();
      alertWs.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [cams, hAlerts] = await Promise.all([getCameras(), getHistoricalAlerts()]);
      setCameras(cams);
      setAlerts(hAlerts);
      if (cams.length > 0) {
        const z = await getZones(cams[0].id);
        setZones(z);
      }
    } catch (e) {
      console.error("Load initial state error:", e);
    }
  };

  const refreshZones = async () => {
    if (cameras.length > 0) {
      const z = await getZones(cameras[0].id);
      setZones(z);
    }
  };

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'NEW').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F19] text-slate-100 overflow-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalAlertsCount={criticalCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'dashboard' && (
          <Dashboard
            cameras={cameras}
            telemetryStreams={telemetryStreams}
            zones={zones}
            alerts={alerts}
            onAlertUpdated={loadInitialData}
          />
        )}
        {activeTab === 'zones' && <ZoneConfig cameras={cameras} onZoneSaved={refreshZones} />}
        {activeTab === 'intelligence' && <IntelligenceHub />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
}

export default App;
