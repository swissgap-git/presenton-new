
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationConfig, Presentation, Theme, AdminTemplate, LLMGateway } from "../types";
import JSZip from "jszip";

/**
 * Analysiert eine PPTX Datei und erstellt mittels KI eine Vorlage
 */
export const analyzePptxTemplate = async (file: File): Promise<AdminTemplate> => {
  const zip = await JSZip.loadAsync(file);
  
  // Extrahiere relevante XML Teile für die KI
  const themeXml = await zip.file("ppt/theme/theme1.xml")?.async("string") || "";
  const slide1Xml = await zip.file("ppt/slides/slide1.xml")?.async("string") || "";
  
  // Wir senden nur Ausschnitte an die KI, um Token-Limits zu sparen und Fokus zu setzen
  const xmlSample = `
    THEME_COLORS: ${themeXml.substring(0, 2000)}
    SLIDE_STRUCTURE: ${slide1Xml.substring(0, 2000)}
  `;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      parts: [{ 
        text: `Analysiere diesen PowerPoint XML Code. Extrahiere das Farbschema, den Stil (modern, konservativ, technisch) und die inhaltliche Tonalität.
        Erstelle darauf basierend eine App-Vorlage.
        XML: ${xmlSample}` 
      }] 
    }],
    config: {
      systemInstruction: "Du bist ein Experte für Corporate Design und PowerPoint Strukturen. Antworte ausschließlich im JSON Format passend zum AdminTemplate Interface.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          baseTheme: { type: Type.STRING, enum: ["light", "dark", "royal_blue", "soft_green"] },
          systemPrompt: { type: Type.STRING }
        },
        required: ["name", "description", "baseTheme", "systemPrompt"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return {
    ...result,
    id: Math.random().toString(36).substr(2, 9)
  };
};

/**
 * Hilfsfunktion für generische API-Calls (für Proxies/Nicht-Google Provider)
 */
const callGatewayProxy = async (gateway: LLMGateway, payload: any): Promise<any> => {
  const response = await fetch(gateway.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'X-Gateway-Provider': gateway.provider,
      'X-Gateway-Model': gateway.model
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Gateway Error (${response.status}): ${errData.message || response.statusText}`);
  }

  return response.json();
};

export const generateImage = async (prompt: string, gateway?: LLMGateway): Promise<string> => {
  if (!gateway || (gateway.provider === 'Google' && gateway.endpoint === 'native')) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `Professional high-quality presentation visual for: ${prompt}. Style: Corporate, Clean, Swiss Government compliant.` }] }],
        config: { imageConfig: { aspectRatio: "4:3" } }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    } catch (error) {
      console.warn("Native Image Gen failed", error);
    }
  } else {
    try {
      const result = await callGatewayProxy(gateway, { prompt, task: 'image_generation' });
      return result.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/600`;
    } catch (error) {
      console.warn("Gateway Image Gen failed", error);
    }
  }
  return `https://picsum.photos/seed/${Math.random()}/800/600`;
};

export const generatePresentation = async (
  config: GenerationConfig, 
  template?: AdminTemplate,
  gateway?: LLMGateway
): Promise<Presentation> => {
  const systemInstruction = template 
    ? template.systemPrompt 
    : "You are a professional presentation assistant for the Swiss Federal Administration.";

  const promptText = `Erstelle eine detaillierte Präsentation zum Thema: "${config.prompt}".
                 Sprache: ${config.language}.
                 Anzahl Folien: ${config.slideCount}.
                 Jede Folie braucht einen prägnanten Titel, 3-5 Bulletpoints und einen beschreibenden Prompt für ein KI-Bild.`;

  if (!gateway || (gateway.provider === 'Google' && gateway.endpoint === 'native')) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = gateway?.model || "gemini-3-pro-preview";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["title", "content", "imagePrompt"]
              }
            }
          },
          required: ["title", "slides"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    const slidePromises = (data.slides || []).map(async (slide: any) => ({
      ...slide,
      imageUrl: await generateImage(slide.imagePrompt, gateway)
    }));

    return {
      id: crypto.randomUUID(),
      title: data.title || config.prompt,
      theme: config.theme,
      slides: await Promise.all(slidePromises),
      createdAt: Date.now()
    };
  } else {
    const payload = {
      system: systemInstruction,
      messages: [{ role: 'user', content: promptText }],
      config: { temperature: 0.7, max_tokens: 4000 }
    };
    const data = await callGatewayProxy(gateway, payload);
    const slides = await Promise.all((data.slides || []).map(async (s: any) => ({
      ...s,
      imageUrl: await generateImage(s.imagePrompt, gateway)
    })));
    return {
      id: crypto.randomUUID(),
      title: data.title || config.prompt,
      theme: config.theme,
      slides,
      createdAt: Date.now()
    };
  }
};

export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = base64Image.split(',')[1] || base64Image;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'image/png' } },
        { text: prompt },
      ],
    },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part) throw new Error("Edit failed");
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateVideoWithVeo = async (prompt: string, imageBase64?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  };
  if (imageBase64) {
    payload.image = { imageBytes: imageBase64.split(',')[1], mimeType: 'image/png' };
  }
  let operation = await ai.models.generateVideos(payload);
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  const link = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoRes = await fetch(`${link}&key=${process.env.API_KEY}`);
  return URL.createObjectURL(await videoRes.blob());
};
