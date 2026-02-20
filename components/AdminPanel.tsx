import React, { useState } from 'react';
import { TripData, AppSettings } from '../types';
import TripForm from './TripForm';

interface AdminPanelProps {
  trips: TripData[];
  onDeleteTrip: (id: string) => void;
  onUpdateTrip: (trip: TripData) => Promise<boolean>;
  settings: AppSettings;
  currentUserId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ trips, onDeleteTrip, onUpdateTrip, settings, currentUserId }) => {
  const [editingTrip, setEditingTrip] = useState<TripData | null>(null);
  const [gpImportTrip, setGpImportTrip] = useState<TripData | null>(null);
  const [viewingTrip, setViewingTrip] = useState<TripData | null>(null);
  const [newGpNumber, setNewGpNumber] = useState('');
  const [isSavingGp, setIsSavingGp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleWhatsAppShare = (trip: TripData) => {
    const currentGp = trip.gpNumber || (trip.description.match(/^GP: (.*?)\./)?.[1] || 'N/A');
    
    const text = `*Trip Information*%0A` +
      `Date: ${trip.date}%0A` +
      `Type: ${trip.tripType}%0A` +
      `Vehicle: ${trip.vehicleNumber}%0A` +
      `DM ID: ${trip.dmId}%0A` +
      `Driver ID: ${trip.driverId}%0A` +
      `Phone: ${trip.phoneNumber}%0A` +
      `GP No: ${currentGp}%0A` +
      `Description: ${trip.description}`;
    
    const url = `https://wa.me/${settings.whatsappDefaultNumber}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyToClipboard = (text: string | undefined, label: string) => {
    if (!text || text.trim() === 'N/A') return;
    navigator.clipboard.writeText(text);
    
    // Remove any existing notifications
    document.querySelectorAll('.copy-notification').forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = "copy-notification fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl z-[200] animate-in slide-in-from-bottom-5";
    notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${label} COPIED`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  };
  
  const handleCopyGP = (trip: TripData) => {
    const gpToCopy = trip.gpNumber || (trip.description.match(/^GP: (.*?)\./)?.[1] || '');
    if (!gpToCopy) {
      alert("No GP Number available to copy.");
      return;
    }
    handleCopyToClipboard(gpToCopy, `GP [${gpToCopy}]`);
  };

  const handleGpImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gpImportTrip && newGpNumber.trim()) {
      setIsSavingGp(true);
      
      const cleanDesc = gpImportTrip.description.replace(/^GP: .*?\. /, '');
      const gpVal = newGpNumber.trim().replace(/\D/g, ''); 
      
      const updated: TripData = {
        ...gpImportTrip,
        gpNumber: gpVal,
        description: `GP: ${gpVal}. ${cleanDesc}`
      };

      const success = await onUpdateTrip(updated);
      
      if (success) {
        setGpImportTrip(null);
        setNewGpNumber('');
      } else {
        alert("Sync Failed!");
      }
      setIsSavingGp(false);
    }
  };
  
  const handleCopyVehicleNumber = (vehicleNumber?: string) => {
    if (!vehicleNumber) return;
    const lastSix = vehicleNumber.replace(/\D/g, '').slice(-6);
    if (lastSix.length > 0) {
      handleCopyToClipboard(lastSix, `ID [${lastSix}]`);
    }
  };

  const handlePrint = (trip: TripData) => {
    const currentGp = trip.gpNumber || (trip.description.match(/^GP: (.*?)\./)?.[1] || 'N/A');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Report - ${trip.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 50px; background: #fff; color: #000; }
            .card { border: 2px solid #000; padding: 40px; border-radius: 0; }
            .header { text-align: center; border-bottom: 5px solid #000; margin-bottom: 40px; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: 900; }
            .row { display: flex; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .label { font-weight: 900; width: 220px; color: #555; font-size: 12px; text-transform: uppercase; }
            .value { flex: 1; color: #000; font-weight: 700; font-size: 16px; }
            .desc { margin-top: 40px; padding: 25px; background: #f9f9f9; border: 1px solid #ddd; line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header"><h1>TRIP DATA RECORD</h1></div>
            <div class="row"><div class="label">DATE:</div><div class="value">${trip.date}</div></div>
            <div class="row"><div class="label">VEHICLE NO:</div><div class="value">${trip.vehicleNumber}</div></div>
            <div class="row"><div class="label">GP NUMBER:</div><div class="value">${currentGp}</div></div>
            <div class="desc">
              <strong>DESCRIPTION:</strong><br/>
              <p>${trip.description.replace(/\n/g, '<br/>')}</p>
            </div>
            <p style="margin-top: 60px; text-align: center; color: #aaa; font-size: 10px; font-weight: 900; letter-spacing: 2px;">TRANS EAST INTERNATIONAL • SYSTEM LOG</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const filteredTrips = trips.filter(trip => {
    const searchLower = searchTerm.toLowerCase();
    const dedicatedGp = (trip.gpNumber || '').toLowerCase();
    const extractedGp = (trip.description.match(/^GP: (.*?)\./)?.[1] || '').toLowerCase();
    
    return (
      trip.vehicleNumber.toLowerCase().includes(searchLower) ||
      trip.driverId.toLowerCase().includes(searchLower) ||
      trip.dmId.toLowerCase().includes(searchLower) ||
      dedicatedGp.includes(searchLower) ||
      extractedGp.includes(searchLower) ||
      trip.description.toLowerCase().includes(searchLower)
    );
  });

  const DetailItem = ({ label, value, colorClass = 'text-white', onCopy }: { label: string, value: string | undefined, colorClass?: string, onCopy?: (value?: string) => void }) => (
    <div className="group flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 transition-colors hover:bg-black/50">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">{label}</p>
        <p className={`font-mono font-bold ${colorClass}`}>{value || 'N/A'}</p>
      </div>
      <button 
        onClick={() => onCopy ? onCopy(value) : handleCopyToClipboard(value, label)}
        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity duration-200"
        aria-label={`Copy ${label}`}
        disabled={!value || value === 'N/A'}
      >
        <i className="fas fa-copy"></i>
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-zinc-900 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/5">
        <div className="p-10 bg-black/40 border-b border-white/5 flex flex-col md:flex-row items-center justify-between">
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic" 
              style={{ textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
            Report
          </h2>
          <div className="relative group w-full md:w-96 mt-6 md:mt-0">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-zinc-700">
              <i className="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              placeholder="SEARCH VEHICLE, ID, OR GP..." 
              className="pl-14 pr-8 py-5 bg-black border border-white/5 rounded-2xl text-white placeholder-zinc-800 focus:border-blue-500/30 outline-none w-full text-[10px] font-black tracking-[0.2em] transition-all uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {editingTrip ? (
          <div className="p-10 bg-black/60">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Modify Record</h3>
              <button onClick={() => setEditingTrip(null)} className="text-zinc-500 hover:text-white transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <TripForm 
              initialData={editingTrip} 
              isEditing={true} 
              onSubmit={async (data) => {
                const res = await onUpdateTrip(data);
                if (res) setEditingTrip(null);
              }}
              onCancel={() => setEditingTrip(null)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/80 text-zinc-700 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Type</th>
                  <th className="px-10 py-6">Vehicle</th>
                  <th className="px-10 py-6">GP Number</th>
                  <th className="px-10 py-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTrips.map((trip) => {
                  const displayGp = trip.gpNumber || (trip.description.match(/^GP: (.*?)\./)?.[1] || '');
                  return (
                    <tr key={trip.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-10 py-8">
                        <div className="text-sm font-black text-white tracking-widest">{trip.date}</div>
                        <div className="text-[9px] text-zinc-800 font-mono mt-1 uppercase">ID: {trip.id?.toString().slice(-6)}</div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-3 py-1 bg-zinc-800 text-zinc-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {trip.tripType}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-sm font-black text-blue-200 uppercase tracking-widest font-mono">{trip.vehicleNumber}</div>
                        <div className="text-[9px] text-zinc-700 mt-2 font-black uppercase tracking-[0.2em]">
                          DM: {trip.dmId} • DR: {trip.driverId}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        {displayGp ? (
                          <div className="flex items-center space-x-3">
                             <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-2">
                               <span className="text-sm font-mono font-black text-emerald-400 tracking-tighter">{displayGp}</span>
                             </div>
                             <button onClick={() => handleCopyGP(trip)} className="text-zinc-600 hover:text-white transition-all">
                               <i className="fas fa-copy"></i>
                             </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-zinc-800 italic">
                             <span className="text-[9px] font-black uppercase tracking-widest opacity-40">No GP Attached</span>
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handlePrint(trip)} className="w-9 h-9 flex items-center justify-center text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all border border-white/5"><i className="fas fa-print"></i></button>
                          <button onClick={() => setViewingTrip(trip)} className="w-9 h-9 flex items-center justify-center text-sky-500 hover:bg-sky-500/10 rounded-xl transition-all border border-white/5"><i className="fas fa-eye"></i></button>
                          {currentUserId === '145531' && (
                            <button 
                              onClick={() => {
                                setGpImportTrip(trip);
                                setNewGpNumber(displayGp.replace(/\D/g, ''));
                              }} 
                              className="w-9 h-9 flex items-center justify-center text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all border border-white/5"
                            >
                              <i className="fas fa-file-import"></i>
                            </button>
                          )}
                          <button onClick={() => setEditingTrip(trip)} className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:text-white rounded-xl transition-all border border-white/5"><i className="fas fa-pen text-[10px]"></i></button>
                          {currentUserId === '145531' && (
                            <button onClick={() => trip.id && onDeleteTrip(trip.id)} className="w-9 h-9 flex items-center justify-center text-rose-800 hover:text-rose-500 rounded-xl transition-all border border-white/5"><i className="fas fa-trash-alt text-[10px]"></i></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GP IMPORT MODAL */}
      {gpImportTrip && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <button onClick={() => setGpImportTrip(null)} disabled={isSavingGp} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
              <i className="fas fa-times text-2xl"></i>
            </button>
            
            <div className="mb-10 text-center relative">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">GP IMPORT</h2>
              <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.4em]">Vehicle: {gpImportTrip.vehicleNumber}</p>
            </div>

            <form onSubmit={handleGpImportSubmit} className="space-y-8 relative">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-zinc-600 mb-2 block tracking-widest text-center">Digit Only GP Number</label>
                <input 
                  required 
                  type="text" 
                  autoFocus
                  inputMode="numeric"
                  placeholder="000000" 
                  value={newGpNumber} 
                  disabled={isSavingGp}
                  onChange={e => setNewGpNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black border border-white/5 p-6 rounded-2xl text-white font-mono text-4xl text-center tracking-widest outline-none focus:border-blue-500/50 transition-all" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSavingGp || !newGpNumber.trim()}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center ${
                  isSavingGp ? 'bg-zinc-800 text-zinc-600' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
              >
                {isSavingGp ? (
                  <><i className="fas fa-circle-notch fa-spin mr-3"></i> Syncing...</>
                ) : (
                  <><i className="fas fa-cloud-upload-alt mr-3"></i> Save GP Record</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TRIP MODAL */}
      {viewingTrip && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <button onClick={() => setViewingTrip(null)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors z-10">
              <i className="fas fa-times text-2xl"></i>
            </button>
            
            <div className="mb-10 text-left relative">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                  <i className="fas fa-file-alt text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Trip Details</h2>
                  <p className="text-sky-500 text-[9px] font-black uppercase tracking-[0.4em]">ID: {viewingTrip.id?.toString().slice(-6)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Date" value={viewingTrip.date} />
                <DetailItem label="Trip Type" value={viewingTrip.tripType} />
                <DetailItem label="Vehicle Number" value={viewingTrip.vehicleNumber} colorClass="text-blue-300" onCopy={handleCopyVehicleNumber} />
                <DetailItem label="GP Number" value={viewingTrip.gpNumber || (viewingTrip.description.match(/^GP: (.*?)\./)?.[1] || 'N/A')} colorClass="text-emerald-400" />
                <DetailItem label="DM ID" value={viewingTrip.dmId} />
                <DetailItem label="Driver ID" value={viewingTrip.driverId} />
                <div className="md:col-span-2">
                  <DetailItem label="Phone Number" value={viewingTrip.phoneNumber} />
                </div>
                <div className="md:col-span-2">
                   <div className="group flex items-start justify-between p-4 bg-black/30 rounded-xl border border-white/5 transition-colors hover:bg-black/50 h-32">
                      <div className="flex-1 overflow-y-auto">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">Description</p>
                        <p className="text-zinc-300 whitespace-pre-wrap text-sm">{viewingTrip.description}</p>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard(viewingTrip.description, 'Description')}
                        className="ml-4 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity duration-200"
                        aria-label="Copy Description"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;