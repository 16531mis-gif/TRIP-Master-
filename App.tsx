import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import SettingsPanel from './components/SettingsPanel';
import LoginPage from './components/LoginPage';
import { TripData, AppSettings } from './types';
import { fetchTripsFromSupabase, insertTripToSupabase, updateTripInSupabase, deleteTripFromSupabase } from './services/supabaseService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_auth') === 'true';
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('user_id') || '';
  });
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    // Using new user-provided credentials as default
    return saved ? JSON.parse(saved) : {
      whatsappDefaultNumber: '8801',
      googleSheetsUrl: '',
      supabaseUrl: 'https://dexxlaogicqzkaunlfau.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleHhsYW9naWNxemthdW5sZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODY3ODAsImV4cCI6MjA4NDc2Mjc4MH0.ArNQxQDamPoS6-EfdAvc8FbvLvNEjaowfB8rk4_Suxk'
    };
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  const loadTrips = async () => {
    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      setLoading(true);
      try {
        const data = await fetchTripsFromSupabase(settings);
        setTrips(data);
        localStorage.setItem('trips', JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch from Supabase:", err);
        const savedTrips = localStorage.getItem('trips');
        if (savedTrips) setTrips(JSON.parse(savedTrips));
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTrips();
    }
  }, [isAuthenticated, settings.supabaseUrl, settings.supabaseAnonKey]);

  const handleLogin = (success: boolean, userId: string) => {
    if (success) {
      setIsAuthenticated(true);
      setCurrentUserId(userId);
      localStorage.setItem('is_auth', 'true');
      localStorage.setItem('user_id', userId);
      navigate('/');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserId('');
    localStorage.removeItem('is_auth');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  const addTrip = async (trip: TripData): Promise<boolean> => {
    try {
      if (settings.supabaseUrl && settings.supabaseAnonKey) {
        setLoading(true);
        await insertTripToSupabase(trip, settings);
        await loadTrips();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Supabase Save Error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (updatedTrip: TripData): Promise<boolean> => {
    if (settings.supabaseUrl && settings.supabaseAnonKey && updatedTrip.id) {
      setLoading(true);
      try {
        await updateTripInSupabase(updatedTrip.id, updatedTrip, settings);
        await loadTrips();
        return true;
      } catch (err) {
        console.error("Update Error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    }
    return false;
  };

  const deleteTrip = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      setLoading(true);
      try {
        await deleteTripFromSupabase(id, settings);
        await loadTrips();
      } finally {
        setLoading(false);
      }
    }
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-blue-500/30">
      {isAuthenticated && (
        <nav className="bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl no-print sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  <i className="fas fa-truck-fast text-white text-xl"></i>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl tracking-tighter text-white uppercase italic">Trip Master</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={loadTrips} 
                  className="px-3 py-2 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all duration-300 disabled:cursor-not-allowed disabled:text-blue-500"
                  title="Refresh Data"
                  disabled={loading}
                >
                  <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                </button>
                <Link to="/" className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center ${location.pathname === '/' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>
                  <i className="fas fa-plus-circle mr-2"></i>Entry
                </Link>
                <Link to="/admin" className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center ${location.pathname === '/admin' ? 'bg-emerald-600' : 'hover:bg-white/5'}`}>
                  <i className="fas fa-chart-bar mr-2"></i>Report
                </Link>
                <Link to="/settings" className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center ${location.pathname === '/settings' ? 'bg-zinc-700' : 'hover:bg-white/5'}`}>
                  <i className="fas fa-cog mr-2"></i>Config
                </Link>
                <button onClick={handleLogout} className="ml-4 p-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-xl transition-all">
                  <i className="fas fa-power-off"></i>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-blue-950 overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loading_1.5s_infinite_linear]" style={{width: '30%', transformOrigin: '0 0'}}></div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%) scaleX(1); }
          50% { transform: translateX(0) scaleX(1.5); }
          100% { transform: translateX(400%) scaleX(1); }
        }
      `}</style>

      <main className={`flex-grow container mx-auto px-4 py-8 ${!isAuthenticated ? 'flex items-center justify-center' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/" element={<UserPanel onAddTrip={addTrip} settings={settings} currentUserId={currentUserId} />} />
          <Route path="/admin" element={<AdminPanel trips={trips} onDeleteTrip={deleteTrip} onUpdateTrip={updateTrip} settings={settings} currentUserId={currentUserId} />} />
          <Route path="/settings" element={<SettingsPanel settings={settings} onUpdateSettings={updateSettings} />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
