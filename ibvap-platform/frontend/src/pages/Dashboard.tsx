import React from 'react';
import { CameraGrid } from '../components/CameraGrid';
import { AlertTriageDrawer } from '../components/AlertTriageDrawer';

interface DashboardProps {
  cameras: any[];
  telemetryStreams: Record<string, any>;
  zones: any[];
  alerts: any[];
  onAlertUpdated: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cameras,
  telemetryStreams,
  zones,
  alerts,
  onAlertUpdated,
}) => {
  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <CameraGrid cameras={cameras} telemetryStreams={telemetryStreams} zones={zones} />
      <AlertTriageDrawer alerts={alerts} onAlertUpdated={onAlertUpdated} />
    </div>
  );
};
