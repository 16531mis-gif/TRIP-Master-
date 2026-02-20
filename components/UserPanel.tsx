
import React, { useState } from 'react';
import TripForm from './TripForm';
import { TripData, AppSettings } from '../types';
import { saveToGoogleSheets } from '../services/googleSheetsService';

interface UserPanelProps {
  onAddTrip: (trip: TripData) => Promise<boolean>;
  settings: AppSettings;
  currentUserId: string;
}

const UserPanel: React.FC<UserPanelProps> = ({ onAddTrip, settings, currentUserId }) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

  const handleSubmit = async (data: TripData) => {
    setStatus({ type: 'idle', message: 'Encrypting Payload...' });
    const success = await onAddTrip(data);
    if (success) {
      if (settings.googleSheetsUrl) saveToGoogleSheets(data, settings.googleSheetsUrl);
      setStatus({ type: 'success', message: 'Data Saved and Cleaned.' });
    } else {
      setStatus({ type: 'error', message: 'Sync failed.' });
    }
    setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-zinc-900/40 backdrop-blur-3xl p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/5 relative">
        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.4)]">
              <i className="fas fa-plus-square text-white text-3xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Trip Entry</h2>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Active Terminal: {currentUserId}</p>
            </div>
          </div>
        </div>

        {status.message && (
          <div className="mb-10 p-6 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-600/20 text-xs font-black uppercase tracking-widest flex items-center space-x-4 animate-pulse">
            <i className="fas fa-circle-notch fa-spin"></i>
            <span>{status.message}</span>
          </div>
        )}

        <TripForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default UserPanel;
