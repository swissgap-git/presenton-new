
import React from 'react';
import { Presentation, Theme } from '../types';

interface Props {
  presentations: Presentation[];
  onSelect: (p: Presentation) => void;
  onDelete: (id: string) => void;
}

export const PresentationLibrary: React.FC<Props> = ({ presentations, onSelect, onDelete }) => {
  if (presentations.length === 0) return null;

  const themeColors = {
    [Theme.LIGHT]: 'bg-white',
    [Theme.DARK]: 'bg-slate-800',
    [Theme.ROYAL]: 'bg-indigo-900',
    [Theme.SOFT]: 'bg-emerald-100'
  };

  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Meine Bibliothek</h2>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {presentations.length} Dokument{presentations.length === 1 ? '' : 'e'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presentations.sort((a, b) => b.createdAt - a.createdAt).map((p) => (
          <div 
            key={p.id} 
            className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div 
              className="h-32 bg-slate-100 relative cursor-pointer overflow-hidden"
              onClick={() => onSelect(p)}
            >
              {p.slides[0]?.imageUrl ? (
                <img src={p.slides[0].imageUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="" />
              ) : (
                <div className={`w-full h-full ${themeColors[p.theme]}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white font-bold text-sm truncate pr-4">
                {p.slides.length} Folien
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="font-bold text-slate-900 truncate flex-1 cursor-pointer hover:text-blue-600 transition"
                  onClick={() => onSelect(p)}
                >
                  {p.title}
                </h3>
                <button 
                  onClick={() => onDelete(p.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="capitalize">{p.theme.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
