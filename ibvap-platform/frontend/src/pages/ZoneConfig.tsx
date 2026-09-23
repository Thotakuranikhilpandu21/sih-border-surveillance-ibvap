import React from 'react';
import { ZoneConfiguratorCanvas } from '../components/ZoneConfiguratorCanvas';

interface ZoneConfigProps {
  cameras: any[];
  onZoneSaved: () => void;
}

export const ZoneConfig: React.FC<ZoneConfigProps> = ({ cameras, onZoneSaved }) => {
  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <ZoneConfiguratorCanvas cameras={cameras} onZoneSaved={onZoneSaved} />
    </div>
  );
};
