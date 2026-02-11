
import React, { useState } from 'react';
import { Theme, GenerationConfig, AdminSettings } from '../types';

interface Props {
  onSubmit: (config: GenerationConfig) => void;
  isLoading: boolean;
  settings: AdminSettings;
}

export const GeneratorForm: React.FC<Props> = ({ onSubmit, isLoading, settings }) => {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [language, setLanguage] = useState('German');
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(settings.templates[0]?.id || '');
  const [selectedGateway, setSelectedGateway] = useState<string>(settings.gateways.find(g => g.active)?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ 
      prompt, 
      slideCount, 
      language, 
      theme, 
      templateId: selectedTemplate,
      gatewayId: selectedGateway
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Thema der Präsentation</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="z.B. Die Auswirkungen von Cloud Native auf die Bundesverwaltung..."
          className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none outline-none"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Template (Organisation)</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {settings.templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">KI Gateway / Endpoint</label>
          <select
            value={selectedGateway}
            onChange={(e) => setSelectedGateway(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {settings.gateways.map(g => (
              <option key={g.id} value={g.id}>{g.provider} - {g.model}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Anzahl Folien</label>
          <input
            type="number"
            min="3"
            max="15"
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value))}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Sprache</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option>German</option>
            <option>English</option>
            <option>Italian</option>
            <option>French</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Visuelles Theme</label>
          <div className="flex gap-2">
            {Object.values(Theme).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex-1 h-10 rounded-lg border transition ${
                  theme === t ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 bg-white'
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${
                    t === Theme.LIGHT ? 'bg-white border' : 
                    t === Theme.DARK ? 'bg-slate-800' : 
                    t === Theme.ROYAL ? 'bg-blue-800' : 'bg-emerald-100'
                  }`} />
                  <span className="text-[10px] capitalize">{t.replace('_', ' ')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className={`w-full py-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-3 shadow-lg ${
          isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Inhalte & KI-Bilder werden generiert...
          </>
        ) : (
          'Präsentation erstellen'
        )}
      </button>
    </form>
  );
};
