
import React, { useState, useRef } from 'react';
import { Presentation, Theme, Slide } from '../types';
import { editImageWithGemini, generateVideoWithVeo } from '../services/geminiService';
import { exportToPPTX } from '../services/exportService';

interface Props {
  presentation: Presentation;
  onBack: () => void;
  onAddSlide: () => void;
  onUpdateSlide: (index: number, updatedSlide: Partial<Slide>) => void;
}

export const PresentationViewer: React.FC<Props> = ({ presentation, onBack, onAddSlide, onUpdateSlide }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [editingImage, setEditingImage] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeClasses = {
    [Theme.LIGHT]: 'bg-white text-slate-900 border-slate-200',
    [Theme.DARK]: 'bg-slate-900 text-white border-slate-700',
    [Theme.ROYAL]: 'bg-indigo-950 text-white border-indigo-800',
    [Theme.SOFT]: 'bg-emerald-50 text-slate-800 border-emerald-200'
  };

  const slide = presentation.slides[activeSlide];

  const handleExport = async () => {
    setProcessing('PowerPoint wird exportiert...');
    try {
      await exportToPPTX(presentation);
    } catch (err) {
      console.error(err);
      alert("Export fehlgeschlagen. Bitte prüfen Sie die Browser-Berechtigungen.");
    } finally {
      setProcessing(null);
    }
  };

  const handleEditImage = async () => {
    if (!editPrompt || !slide.imageUrl) return;
    setProcessing('Bild wird bearbeitet...');
    try {
      const newUrl = await editImageWithGemini(slide.imageUrl, editPrompt);
      onUpdateSlide(activeSlide, { imageUrl: newUrl });
      setEditingImage(false);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleAnimate = async (fromCurrent: boolean) => {
    setProcessing('Veo Video wird generiert (dauert ca. 1-2 Min)...');
    try {
      const videoUrl = await generateVideoWithVeo(
        slide.imagePrompt || "Animate this scene", 
        fromCurrent ? slide.imageUrl : undefined
      );
      onUpdateSlide(activeSlide, { videoUrl });
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSlide(activeSlide, { imageUrl: reader.result as string, videoUrl: undefined });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Zurück zum Generator
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export PPTX
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        <div className="w-64 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          <button
            onClick={onAddSlide}
            className="w-full py-4 mb-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shrink-0 font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Folie hinzufügen
          </button>
          
          {presentation.slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`text-left p-3 rounded-xl border transition-all text-xs shrink-0 ${
                activeSlide === idx 
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 shadow-sm' 
                : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="font-bold mb-1 line-clamp-1">{s.title}</div>
              <div className="text-slate-400">Folie {idx + 1}</div>
            </button>
          ))}
        </div>

        <div className={`flex-1 rounded-3xl border shadow-2xl overflow-hidden flex flex-col relative ${themeClasses[presentation.theme]}`}>
          {processing && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-slate-900">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-lg animate-pulse">{processing}</p>
            </div>
          )}

          <div className="flex-1 flex items-stretch min-h-0">
            <div className="w-1/2 p-12 overflow-y-auto">
              <h2 className="text-4xl font-bold mb-8 leading-tight">{slide.title}</h2>
              <ul className="space-y-4">
                {slide.content.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-lg leading-relaxed">
                    <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-sm" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2 bg-slate-100 relative group">
               {slide.videoUrl ? (
                 <video 
                   src={slide.videoUrl} 
                   autoPlay 
                   loop 
                   muted 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <img 
                   src={slide.imageUrl} 
                   alt={slide.title} 
                   className="w-full h-full object-cover"
                 />
               )}
               
               <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white text-slate-700 hover:text-blue-600 transition"
                  title="Bild hochladen"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 
                 <button 
                  onClick={() => setEditingImage(!editingImage)}
                  className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white text-slate-700 hover:text-blue-600 transition"
                  title="Bild bearbeiten (Gemini)"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 </button>

                 <button 
                  onClick={() => handleAnimate(true)}
                  className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white text-slate-700 hover:text-blue-600 transition"
                  title="Bild animieren (Veo)"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </button>
               </div>

               {editingImage && (
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-white/90 backdrop-blur border-t animate-slide-up">
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={editPrompt}
                       onChange={(e) => setEditPrompt(e.target.value)}
                       placeholder="z.B. Retro-Filter hinzufügen..."
                       className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                       onKeyPress={(e) => e.key === 'Enter' && handleEditImage()}
                     />
                     <button 
                       onClick={handleEditImage}
                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                     >
                       Edit
                     </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
          <div className="h-12 border-t flex items-center justify-center text-xs opacity-50 px-8">
            {presentation.title} • Folie {activeSlide + 1} von {presentation.slides.length}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center items-center gap-8">
        <button 
          disabled={activeSlide === 0}
          onClick={() => { setActiveSlide(s => s - 1); setEditingImage(false); }}
          className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition active:scale-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-slate-500 font-bold bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
          {activeSlide + 1} <span className="mx-2 text-slate-300">/</span> {presentation.slides.length}
        </div>
        <button 
          disabled={activeSlide === presentation.slides.length - 1}
          onClick={() => { setActiveSlide(s => s + 1); setEditingImage(false); }}
          className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition active:scale-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};
