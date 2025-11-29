import React, { useEffect, useState } from 'react';
import { ActivityLog, ActivityType } from '../types';
import { StorageService } from '../services/storage';
import { Activity, Package, User as UserIcon, Settings, LogIn } from 'lucide-react';

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const loadActivities = () => {
      const logs = StorageService.getActivities();
      setActivities(logs);
    };
    
    loadActivities();
    // Poll for updates every 5 seconds or we could use an event emitter in a real app
    const interval = setInterval(loadActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'LOGIN': return <LogIn size={16} className="text-blue-500" />;
      case 'PACKAGE_ADD': 
      case 'PACKAGE_UPDATE':
      case 'PACKAGE_PICKUP': return <Package size={16} className="text-green-500" />;
      case 'USER_ADD': return <UserIcon size={16} className="text-purple-500" />;
      case 'SETTINGS_UPDATE': return <Settings size={16} className="text-gray-500" />;
      default: return <Activity size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full overflow-hidden flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Activity size={20} />
        Recent Activity
      </h3>
      
      <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>
        ) : (
          activities.map((log) => (
            <div key={log.id} className="flex gap-3 items-start text-sm border-b border-gray-50 last:border-0 pb-3 last:pb-0">
              <div className="mt-1 p-1.5 bg-gray-50 rounded-full">
                {getIcon(log.type)}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{log.description}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{log.userName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
