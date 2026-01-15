import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { MedicineDetails, MapLocation } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Image Enhancement & Analysis
 */
export const analyzeMedicineImage = async (base64Image: string): Promise<MedicineDetails> => {
  // Schema for structured medicine data
  const medicineSchema = {
    type: Type.OBJECT,
    properties: {
      brandName: { type: Type.STRING, description: "The brand name of the medicine" },
      genericName: { type: Type.STRING, description: "The generic composition" },
      usage: { type: Type.STRING, description: "Primary use case/purpose" },
      dosage: { type: Type.STRING, description: "General dosage guidelines found on package or standard knowledge" },
      sideEffects: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of common side effects"
      },
      warnings: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Critical safety warnings"
      },
      manufacturer: { type: Type.STRING, description: "Manufacturer name if visible" }
    },
    required: ["brandName", "genericName", "usage", "dosage", "sideEffects", "warnings"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Deep analysis model
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this medicine packaging. Extract key details carefully. If text is blurry, infer from visible branding or distinctive packaging features."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: medicineSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as MedicineDetails;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Chat with Medicine Assistant
 */
export const chatWithMedicineAssistant = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are Medicinal AI, a professional medical assistant. Provide concise, safe, and accurate information."
    }
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};

/**
 * Check Drug Interactions
 */
export const checkDrugInteraction = async (drugA: string, drugB: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the interaction between ${drugA} and ${drugB}. Are they safe to take together? List potential risks and severity. Keep it concise.`,
    config: {
      systemInstruction: "You are a safety checking AI. Be direct about risks. Use markdown for formatting."
    }
  });

  return response.text || "Unable to analyze interactions at this time.";
};

/**
 * Hospital Finder (Maps Grounding)
 */
export const findNearbyMedicalFacilities = async (lat: number, lng: number): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Find the nearest top-rated hospitals and 24/7 pharmacies near me. List them with address and ratings.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    }
  });

  return response.text || "Could not find location data.";
};

/**
 * Live API Connection Helper
 */
export const connectLiveSession = async (
  onMessage: (msg: LiveServerMessage) => void,
  onOpen: () => void,
  onClose: () => void,
  onError: (e: ErrorEvent) => void
) => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: onOpen,
      onmessage: onMessage,
      onclose: onClose,
      onerror: onError
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      },
      systemInstruction: "You are a helpful, calm medical assistant capable of explaining complex medical terms simply."
    }
  });
};