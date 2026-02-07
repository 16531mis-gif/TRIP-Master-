
import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full px-5 py-4 bg-blue-950/40 border border-white/10 rounded-2xl text-white placeholder-blue-300/20 focus:bg-blue-900/60 focus:ring-4 focus:ring-blue-500/30 outline-none transition-all shadow-inner";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/70 mb-3 ml-1";

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20">
        <div className="flex items-center space-x-4 mb-10 border-b border-white/10 pb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <i className="fas fa-cogs text-white text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">System Configuration</h2>
            <p className="text-blue-300/50 text-[10px] font-black uppercase tracking-widest">Global Parameters</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
               <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center">
                 <i className="fas fa-database mr-2"></i> Supabase Cloud Node (Primary)
               </h3>
            </div>
            
            <div>
              <label className={labelClass}>Supabase URL</label>
              <input
                type="url"
                placeholder="https://your-id.supabase.co"
                className={inputClass}
                value={formData.supabaseUrl}
                onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                className={inputClass}
                value={formData.supabaseAnonKey}
                onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 border-t border-white/5 pt-6 mt-4">
               <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center">
                 <i className="fas fa-link mr-2"></i> Secondary Connectors
               </h3>
            </div>

            <div>
              <label className={labelClass}>Google Sheets Endpoint</label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                className={inputClass}
                value={formData.googleSheetsUrl}
                onChange={(e) => setFormData({ ...formData, googleSheetsUrl: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Default WhatsApp Vector</label>
              <input
                type="text"
                placeholder="8801XXXXXXXXX"
                className={inputClass}
                value={formData.whatsappDefaultNumber}
                onChange={(e) => setFormData({ ...formData, whatsappDefaultNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] py-5 px-6 rounded-2xl transition-all shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.6)] transform hover:-translate-y-1 active:translate-y-0.5 flex items-center justify-center text-xs"
            >
              {saved ? (
                <>
                  <i className="fas fa-check-circle mr-3 text-lg"></i> Configuration Applied
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt mr-3"></i> Sync All Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;
