import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCameras, fetchAlerts, fetchZones } from '../services/api';
import { soundEngine } from '../services/audio';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('live'); // live, zones, triage, anpr, analytics
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('cam-1');
  const [alerts, setAlerts] = useState([]);
  const [zones, setZones] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bboxOverlayEnabled, setBboxOverlayEnabled] = useState(true);
  const [nightFilterEnabled, setNightFilterEnabled] = useState(false);
  const [gridMode, setGridMode] = useState('2x2'); // 2x2, single

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      const [camData, alertData, zoneData] = await Promise.all([
        fetchCameras(),
        fetchAlerts(),
        fetchZones()
      ]);
      setCameras(camData);
      setAlerts(alertData);
      setZones(zoneData);
    } catch (e) {
      console.error("Error loading application state:", e);
    }
  };

  const loadAlerts = async () => {
    try {
      const alertData = await fetchAlerts();
      setAlerts(prev => {
        if (soundEnabled && alertData.length > prev.length) {
          const newCritical = alertData.find(a => a.severity === 'CRITICAL' && a.status === 'NEW');
          if (newCritical) {
            soundEngine.playCriticalAlert();
          }
        }
        return alertData;
      });
    } catch (e) {
      console.error("Error updating alerts:", e);
    }
  };

  const addLiveAlert = (newAlert) => {
    setAlerts(prev => {
      if (prev.some(a => a.id === newAlert.id)) return prev;
      if (soundEnabled && newAlert.severity === 'CRITICAL') {
        soundEngine.playCriticalAlert();
      }
      return [newAlert, ...prev];
    });
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      cameras,
      setCameras,
      selectedCameraId,
      setSelectedCameraId,
      alerts,
      setAlerts,
      zones,
      setZones,
      soundEnabled,
      setSoundEnabled,
      bboxOverlayEnabled,
      setBboxOverlayEnabled,
      nightFilterEnabled,
      setNightFilterEnabled,
      gridMode,
      setGridMode,
      addLiveAlert,
      refreshZones: async () => {
        const data = await fetchZones();
        setZones(data);
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
