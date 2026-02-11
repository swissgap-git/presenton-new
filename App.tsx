
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { GeneratorForm } from './components/GeneratorForm';
import { PresentationViewer } from './components/PresentationViewer';
import { AdminView } from './components/AdminView';
import { PresentationLibrary } from './components/PresentationLibrary';
import { Presentation, GenerationConfig, Slide, User, AdminSettings, Theme } from './types';
import { generatePresentation } from './services/geminiService';

const DEFAULT_SETTINGS: AdminSettings = {
  gateways: [
    { id: '1', provider: 'Google', model: 'gemini-3-pro-preview', endpoint: 'native', active: true },
    { id: '2', provider: 'On-Prem Proxy', model: 'llama-3-fed', endpoint: 'https://gateway.internal.admin.ch/v1', active: false },
  ],
  templates: [
    { id: '1', name: 'Federal Standard', description: 'Clean layout for official reports', baseTheme: Theme.LIGHT, systemPrompt: 'You are a formal assistant for the Swiss Confederation. Use clear, official language. Avoid jargon. Focus on structure and precision.' },
    { id: '2', name: 'Creative Workshop', description: 'Dynamic visuals and bold statements', baseTheme: Theme.ROYAL, systemPrompt: 'Use inspiring and visionary language. Focus on digital transformation and innovation.' }
  ],
  permissions: [
    { id: '1', identity: 'Hans Muster', type: 'User', role: 'Admin' },
    { id: '2', identity: 'BIT-Präsentation-Autoren', type: 'Group', role: 'Editor' },
  ]
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [savedPresentations, setSavedPresentations] = useState<Presentation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const checkApiKey = async () => {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    };
    checkApiKey();

    const storedDocs = localStorage.getItem('presenton_federal_docs');
    if (storedDocs) {
      try {
        setSavedPresentations(JSON.parse(storedDocs));
      } catch (e) {
        console.error("Failed to load presentations", e);
      }
    }

    const storedSettings = localStorage.getItem('presenton_federal_settings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }

    const checkAuth = async () => {
      setTimeout(() => {
        setUser({
          id: "CH-9921-001",
          displayName: "Hans Muster",
          role: "Admin",
          organization: "Admin CH - eIAM Verified"
        });
      }, 500);
    };
    checkAuth();
  }, []);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasApiKey(true);
  };

  useEffect(() => {
    localStorage.setItem('presenton_federal_docs', JSON.stringify(savedPresentations));
  }, [savedPresentations]);

  useEffect(() => {
    localStorage.setItem('presenton_federal_settings', JSON.stringify(settings));
  }, [settings]);

  const handleGenerate = async (config: GenerationConfig) => {
    setLoading(true);
    setError(null);
    try {
      const template = settings.templates.find(t => t.id === config.templateId);
      const gateway = settings.gateways.find(g => g.id === config.gatewayId);
      
      const result = await generatePresentation(config, template, gateway);
      setCurrentPresentation(result);
      setSavedPresentations(prev => [result, ...prev]);
    } catch (err: any) {
      console.error("Generation failed:", err);
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setHasApiKey(false);
      }
      setError(err.message || "Fehler beim Erstellen der Präsentation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Möchten Sie diese Präsentation unwiderruflich löschen?")) {
      setSavedPresentations(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateSlide = (index: number, updatedSlide: Partial<Slide>) => {
    if (!currentPresentation) return;
    const newSlides = [...currentPresentation.slides];
    newSlides[index] = { ...newSlides[index], ...updatedSlide };
    const updatedPres = { ...currentPresentation, slides: newSlides };
    setCurrentPresentation(updatedPres);
    setSavedPresentations(prev => prev.map(p => p.id === updatedPres.id ? updatedPres : p));
  };

  const handleAddSlide = () => {
    if (!currentPresentation) return;
    const newSlide: Slide = {
      title: "Neue Folie",
      content: ["Inhalt hier einfügen..."],
      imageUrl: "https://picsum.photos/800/600"
    };
    const updatedPres = {
      ...currentPresentation,
      slides: [...currentPresentation.slides, newSlide]
    };
    setCurrentPresentation(updatedPres);
    setSavedPresentations(prev => prev.map(p => p.id === updatedPres.id ? updatedPres : p));
  };

  const reset = () => {
    setCurrentPresentation(null);
    setIsAdminMode(false);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-2xl">
          +
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">API Key erforderlich</h1>
        <p className="text-slate-600 mb-8 max-w-md">
          Für die Nutzung von Gemini 3 Pro und Veo Video-Generierung in der Federal Edition ist ein Abrechnungskonto erforderlich.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSelectKey}
            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition transform active:scale-95"
          >
            API Key auswählen
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
            Dokumentation zur Abrechnung
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4 shadow-xl animate-bounce">
          +
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">eIAM Authentication</h1>
        <p className="text-slate-500">Initialisierung...</p>
      </div>
    );
  }

  return (
    <Layout user={user} onAdminClick={() => setIsAdminMode(!isAdminMode)} isAdminActive={isAdminMode}>
      {isAdminMode ? (
        <AdminView settings={settings} onUpdateSettings={setSettings} />
      ) : !currentPresentation ? (
        <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-700">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Presenton <span className="text-blue-600">Federal</span>
            </h1>
            <p className="text-xl text-slate-600">Sicheres Dokumenten-Management für die Schweizer Verwaltung.</p>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <GeneratorForm onSubmit={handleGenerate} isLoading={loading} settings={settings} />
          </div>
          {error && (
            <div className="mt-6 max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-bold">
              {error}
            </div>
          )}
          <PresentationLibrary presentations={savedPresentations} onSelect={setCurrentPresentation} onDelete={handleDelete} />
        </div>
      ) : (
        <PresentationViewer presentation={currentPresentation} onBack={reset} onAddSlide={handleAddSlide} onUpdateSlide={handleUpdateSlide} />
      )}
    </Layout>
  );
};

export default App;
