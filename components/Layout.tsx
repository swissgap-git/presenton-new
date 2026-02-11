
import React from 'react';
import { User } from '../types';

interface Props {
  children: React.ReactNode;
  user?: User | null;
  onAdminClick?: () => void;
  isAdminActive?: boolean;
}

export const Layout: React.FC<Props> = ({ children, user, onAdminClick, isAdminActive }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl text-slate-900 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-lg leading-none">
              +
            </div>
            <div className="flex flex-col leading-tight">
              <span>Presenton</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Federal Edition</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {user && (user.role === 'Admin' || user.role === 'Application Specialist') && (
              <button 
                onClick={onAdminClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  isAdminActive 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {isAdminActive ? 'App verlassen' : 'Admin'}
              </button>
            )}

            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Cluster Status</span>
              <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                ON-PREM SECURE
              </span>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900 leading-none">{user.displayName}</span>
                  <span className="text-[10px] text-slate-500">{user.organization}</span>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                  {user.displayName.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 grayscale opacity-60">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Powered by eIAM</div>
             <div className="h-4 w-px bg-slate-200"></div>
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin CH Compliance</div>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; 2024 Presenton K8s Edition • Version 2.5.0-federal
          </p>
        </div>
      </footer>
    </div>
  );
};
