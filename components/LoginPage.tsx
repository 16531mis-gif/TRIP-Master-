
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (success: boolean, userId: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // User 145531: Import Permission
    // User 245212: Copy Permission
    const isValidUser1 = adminId === '145531' && password === '2271';
    const isValidUser2 = adminId === '245212' && password === '1234';

    if (isValidUser1 || isValidUser2) {
      onLogin(true, adminId);
    } else {
      setError('Invalid Access Credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
      <div className="bg-zinc-900 p-10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
        
        <div className="text-center mb-12 relative">
          <h2 className="text-6xl font-black text-white tracking-tighter mb-4 leading-none uppercase italic" 
              style={{ 
                textShadow: '0 1px 0 #333, 0 2px 0 #222, 0 3px 0 #111, 0 4px 0 #000, 0 5px 0 #000, 0 8px 15px rgba(0,0,0,.8)' 
              }}>
            TRIP ENTRY
          </h2>

          <div className="flex justify-center my-8">
            <div className="relative">
               <i className="fas fa-truck-fast text-7xl text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"></i>
               <div className="absolute -bottom-4 w-full h-2 bg-blue-600/30 blur-2xl rounded-full"></div>
            </div>
          </div>

          <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">RFL Group</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-black uppercase tracking-widest text-center animate-shake">
            <i className="fas fa-shield-halved mr-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Login ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-zinc-500">
                <i className="fas fa-fingerprint"></i>
              </span>
              <input
                type="text"
                placeholder="ID CODE"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-black border border-white/5 rounded-2xl text-white placeholder-zinc-700 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono tracking-widest"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-zinc-500">
                <i className="fas fa-key"></i>
              </span>
              <input
                type="password"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-black border border-white/5 rounded-2xl text-white placeholder-zinc-700 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono tracking-widest"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-1 active:scale-95 flex items-center justify-center text-sm uppercase tracking-[0.3em]"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
