
import React, { useState, useRef } from 'react';
import { AdminSettings, LLMGateway, AdminTemplate, PermissionEntry, Theme } from '../types';
import { analyzePptxTemplate } from '../services/geminiService';

interface Props {
  settings: AdminSettings;
  onUpdateSettings: (s: AdminSettings) => void;
}

export const AdminView: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'gateways' | 'templates' | 'permissions'>('gateways');
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplate | null>(null);
  const [editingGateway, setEditingGateway] = useState<LLMGateway | null>(null);
  const [editingPermission, setEditingPermission] = useState<PermissionEntry | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pptxInputRef = useRef<HTMLInputElement>(null);

  // --- Gateway Actions ---
  const saveGateway = (gw: LLMGateway) => {
    const exists = settings.gateways.find(g => g.id === gw.id);
    const newGateways = exists 
      ? settings.gateways.map(g => g.id === gw.id ? gw : g)
      : [...settings.gateways, gw];
    
    onUpdateSettings({ ...settings, gateways: newGateways });
    setEditingGateway(null);
  };

  const removeGateway = (id: string) => {
    if (window.confirm("Diesen Endpunkt wirklich entfernen?")) {
      onUpdateSettings({ ...settings, gateways: settings.gateways.filter(g => g.id !== id) });
    }
  };

  const createNewGateway = () => {
    setEditingGateway({
      id: Math.random().toString(36).substr(2, 9),
      provider: 'Google',
      model: 'gemini-3-pro-preview',
      endpoint: 'native',
      active: true
    });
  };

  // --- Template Actions ---
  const saveTemplate = (tmpl: AdminTemplate) => {
    const exists = settings.templates.find(t => t.id === tmpl.id);
    const newTemplates = exists 
      ? settings.templates.map(t => t.id === tmpl.id ? tmpl : t)
      : [...settings.templates, tmpl];
    
    onUpdateSettings({ ...settings, templates: newTemplates });
    setEditingTemplate(null);
  };

  const removeTemplate = (id: string) => {
    if (window.confirm("Dieses Template wirklich löschen?")) {
      onUpdateSettings({ ...settings, templates: settings.templates.filter(t => t.id !== id) });
    }
  };

  const createNewTemplate = () => {
    setEditingTemplate({
      id: Math.random().toString(36).substr(2, 9),
      name: 'Neue Vorlage',
      description: 'Beschreibung hier eingeben...',
      baseTheme: Theme.LIGHT,
      systemPrompt: 'Du bist ein hilfreicher Assistent...'
    });
  };

  const handlePptxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    try {
      const newTemplate = await analyzePptxTemplate(file);
      onUpdateSettings({
        ...settings,
        templates: [...settings.templates, newTemplate]
      });
      alert(`Erfolg! Vorlage "${newTemplate.name}" wurde durch KI-Analyse erstellt.`);
    } catch (err) {
      console.error(err);
      alert("Analyse fehlgeschlagen. Ist die Datei eine gültige PPTX?");
    } finally {
      setIsAnalyzing(false);
      if (pptxInputRef.current) pptxInputRef.current.value = '';
    }
  };

  // --- Permission Actions ---
  const savePermission = (perm: PermissionEntry) => {
    const exists = settings.permissions.find(p => p.id === perm.id);
    const newPermissions = exists 
      ? settings.permissions.map(p => p.id === perm.id ? perm : p)
      : [...settings.permissions, perm];
    
    onUpdateSettings({ ...settings, permissions: newPermissions });
    setEditingPermission(null);
  };

  const removePermission = (id: string) => {
    if (window.confirm("Diese Berechtigung wirklich entziehen?")) {
      onUpdateSettings({ ...settings, permissions: settings.permissions.filter(p => p.id !== id) });
    }
  };

  const createNewPermission = () => {
    setEditingPermission({
      id: Math.random().toString(36).substr(2, 9),
      identity: '',
      type: 'User',
      role: 'Viewer'
    });
  };

  const simulateEiamSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("eIAM Synchronisation abgeschlossen.");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Administration</h2>
          <button onClick={() => setActiveTab('gateways')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'gateways' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            KI Endpunkte
          </button>
          <button onClick={() => setActiveTab('templates')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'templates' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            Vorlagen
          </button>
          <button onClick={() => setActiveTab('permissions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'permissions' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Rechte
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[600px]">
          {activeTab === 'gateways' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">KI Endpunkte</h3>
                  <p className="text-slate-500 text-sm">Zentrales Management der eIAM-abgesicherten Gateways.</p>
                </div>
                <button onClick={createNewGateway} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition">
                  Neuer Endpunkt
                </button>
              </div>
              <div className="overflow-hidden border border-slate-100 rounded-2xl text-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Provider</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Modell</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {settings.gateways.map(gw => (
                      <tr key={gw.id} className="hover:bg-slate-50 transition group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700">{gw.provider}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{gw.endpoint}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{gw.model}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${gw.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            {gw.active ? 'AKTIV' : 'INAKTIV'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => setEditingGateway(gw)} className="text-xs font-bold text-blue-500 hover:underline">Edit</button>
                            <button onClick={() => removeGateway(gw.id)} className="text-xs font-bold text-red-400 hover:underline">Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Vorlagen Management</h3>
                  <p className="text-slate-500 text-sm">Klassische Vorlagen oder innovativer KI-Import.</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={createNewTemplate} className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition">
                    Manuell erstellen
                   </button>
                </div>
              </div>

              {/* PPTX MAGIC IMPORT ZONE */}
              <div className={`relative overflow-hidden group p-10 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-4 ${isAnalyzing ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-400 hover:bg-slate-50'}`}>
                {isAnalyzing && <div className="absolute inset-0 scan-line" />}
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition transform group-hover:scale-110 ${isAnalyzing ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                  {isAnalyzing ? '⚡' : '📂'}
                </div>
                
                <div className="text-center">
                  <h4 className="font-bold text-slate-900 text-lg">PPTX KI-Magic Import</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">Lade eine PPTX hoch. Unsere KI extrahiert das Corporate Design und erstellt automatisch ein App-Template.</p>
                </div>

                <input type="file" ref={pptxInputRef} onChange={handlePptxImport} accept=".pptx" className="hidden" />
                
                <button 
                  disabled={isAnalyzing}
                  onClick={() => pptxInputRef.current?.click()}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm shadow-xl transition active:scale-95 ${isAnalyzing ? 'bg-slate-200 text-slate-400' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  {isAnalyzing ? 'Analysiere PPTX Struktur...' : 'PPTX Datei wählen'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {settings.templates.map(tmpl => (
                  <div key={tmpl.id} className="p-6 border border-slate-100 rounded-2xl hover:border-red-200 transition group bg-slate-50/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${tmpl.baseTheme === Theme.ROYAL ? 'bg-indigo-600' : 'bg-red-500'}`}>
                         {tmpl.name.charAt(0)}
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setEditingTemplate(tmpl)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                         <button onClick={() => removeTemplate(tmpl.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                       </div>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{tmpl.name}</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{tmpl.description}</p>
                    <div className="bg-white p-3 rounded-lg text-[10px] font-mono text-slate-400 line-clamp-2 border border-slate-100">
                      {tmpl.systemPrompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Rollen & Rechte</h3>
                  <p className="text-slate-500 text-sm">Synchronisiert mit eIAM Identity Management.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={simulateEiamSync} disabled={isSyncing} className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition">
                    {isSyncing ? 'Syncing...' : 'Sync eIAM'}
                  </button>
                  <button onClick={createNewPermission} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition">
                    Nutzer hinzufügen
                  </button>
                </div>
              </div>
              <div className="overflow-hidden border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Identität</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Typ</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Rolle</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {settings.permissions.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition group">
                        <td className="px-6 py-4 font-semibold text-slate-700">{p.identity || 'Unbekannt'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${p.type === 'Group' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                            {p.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{p.role}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => setEditingPermission(p)} className="text-xs font-bold text-blue-500 hover:underline">Edit</button>
                            <button onClick={() => removePermission(p.id)} className="text-xs font-bold text-red-400 hover:underline">Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- GATEWAY MODAL --- */}
      {editingGateway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingGateway(null)} />
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Endpunkt konfigurieren</h3>
              <button onClick={() => setEditingGateway(null)} className="text-slate-400 hover:text-slate-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Provider</label>
                  <select 
                    value={editingGateway.provider}
                    onChange={(e) => setEditingGateway({...editingGateway, provider: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="Google">Google (Native)</option>
                    <option value="Azure">Microsoft Azure</option>
                    <option value="OpenAI">OpenAI</option>
                    <option value="On-Prem Proxy">Internal Proxy</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Modell</label>
                  <input 
                    type="text" 
                    value={editingGateway.model}
                    onChange={(e) => setEditingGateway({...editingGateway, model: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Endpoint URL ('native' für Direktzugriff)</label>
                <input 
                  type="text" 
                  value={editingGateway.endpoint}
                  onChange={(e) => setEditingGateway({...editingGateway, endpoint: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setEditingGateway({...editingGateway, active: !editingGateway.active})}
                  className={`w-12 h-6 rounded-full transition relative ${editingGateway.active ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingGateway.active ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-sm font-bold">Status: {editingGateway.active ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingGateway(null)} className="px-6 py-2 font-bold text-slate-600">Abbrechen</button>
              <button onClick={() => saveGateway(editingGateway)} className="px-6 py-2 rounded-xl font-bold bg-slate-900 text-white">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TEMPLATE MODAL --- */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingTemplate(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Vorlage anpassen</h3>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                  <input type="text" value={editingTemplate.name} onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Basis-Design</label>
                  <select value={editingTemplate.baseTheme} onChange={(e) => setEditingTemplate({...editingTemplate, baseTheme: e.target.value as Theme})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white">
                    {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Prompt</label>
                <textarea rows={6} value={editingTemplate.systemPrompt} onChange={(e) => setEditingTemplate({...editingTemplate, systemPrompt: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none font-mono text-sm focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingTemplate(null)} className="px-6 py-2 font-bold text-slate-600">Abbrechen</button>
              <button onClick={() => saveTemplate(editingTemplate)} className="px-6 py-2 rounded-xl font-bold bg-slate-900 text-white shadow-lg">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PERMISSION MODAL --- */}
      {editingPermission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingPermission(null)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Berechtigung verwalten</h3>
              <button onClick={() => setEditingPermission(null)} className="text-slate-400 hover:text-slate-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Identität (User/Gruppe)</label>
                <input 
                  type="text" 
                  value={editingPermission.identity}
                  onChange={(e) => setEditingPermission({...editingPermission, identity: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="E-Mail oder Gruppen-ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Typ</label>
                  <select 
                    value={editingPermission.type}
                    onChange={(e) => setEditingPermission({...editingPermission, type: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="User">User</option>
                    <option value="Group">Group</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rolle</label>
                  <select 
                    value={editingPermission.role}
                    onChange={(e) => setEditingPermission({...editingPermission, role: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingPermission(null)} className="px-6 py-2 font-bold text-slate-600">Abbrechen</button>
              <button onClick={() => savePermission(editingPermission)} className="px-6 py-2 rounded-xl font-bold bg-slate-900 text-white">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
