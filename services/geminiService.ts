
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Part } from "@google/genai";
import type { ImageFile, ImageModel, SafetyLevel, ImageResolution, GeneratedPromptResponse, AspectRatioOption } from "../types";

const getAiClient = () => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

const handleApiError = (error: unknown) => {
    console.error("Internal Gemini Service Error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('400')) {
        if (msg.includes('safety')) throw new Error("The request was blocked by safety filters. Try a less sensitive prompt.");
        throw new Error("Invalid request parameters or malformed image data.");
    }
    if (msg.includes('500')) throw new Error("The AI service is currently overloaded. Please try again in a few seconds.");
    if (msg.includes('403')) throw new Error("Permission denied. Ensure your API key is valid and has billing enabled for Pro features.");
    if (msg.includes('Requested entity was not found')) throw new Error("Session expired or resource unavailable.");
    
    throw new Error(msg);
}

const extractResponse = (response: GenerateContentResponse) => {
    let editedImage: string | null = null;
    let textResponse: string | null = null;

    if (response.promptFeedback?.blockReason) {
        throw new Error(`The request was blocked by the system: ${response.promptFeedback.blockReason}.`);
    }

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No output generated. The model was unable to process this combination of image and prompt.");
    }

    const candidate = response.candidates[0];
    const finishReason = candidate.finishReason;

    // Handle blocking reasons explicitly
    if (finishReason === 'SAFETY') {
        throw new Error("Generation blocked by Safety Filter. Try a less sensitive prompt.");
    } else if (finishReason === 'RECITATION') {
        throw new Error("Generation blocked due to copyright/recitation policy.");
    }

    if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                editedImage = part.inlineData.data;
            } else if (part.text) {
                textResponse = part.text;
            }
        }
    }

    // If we have text but no image, it's likely a refusal or an explanation of failure
    if (textResponse && !editedImage) {
        throw new Error(`AI Model Refusal: ${textResponse}`);
    }

    // Success check - some models return 'OTHER' or 'STOP' on success
    if (!editedImage) {
        throw new Error(`The model completed with reason '${finishReason}' but failed to produce image data. Try simplifying your prompt or reducing the number of reference images.`);
    }

    return { editedImage, textResponse };
}

const getSafetySettings = (level: SafetyLevel) => [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: level }, 
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: level }, 
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: level }, 
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: level },
    { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: level }
];

const mapAspectRatio = (ratio: string): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
    const supported = {
        "9:16": 0.5625,
        "3:4": 0.75,
        "1:1": 1.0,
        "4:3": 1.3333,
        "16:9": 1.7777
    };
    
    try {
        const [w, h] = ratio.split(':').map(Number);
        if (!w || !h) return "1:1";
        const val = w / h;
        
        let bestKey: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";
        let minDiff = Infinity;
        
        for (const [key, sVal] of Object.entries(supported)) {
            const diff = Math.abs(val - sVal);
            if (diff < minDiff) {
                minDiff = diff;
                bestKey = key as any;
            }
        }
        return bestKey;
    } catch {
        return "1:1";
    }
};

const getSpatialHeader = (maskPresent: boolean) => 
    `[MASTER MODIFICATION PROTOCOL ACTIVE]:
     PRIMARY SUBJECT: Input 0. This is the ONLY image to be transformed.
     ${maskPresent ? 'MODIFICATION TARGET (SPATIAL MASK): Input 1. Only modify area within these pixels. The model must recognize semantic color zones within this mask (Red, Yellow, Green, Blue, Purple).' : ''}
     CONSULTATIVE CUES: Subsequent inputs are visual reference blueprints.
     
     CRITICAL DIRECTIVES:
     1. MANDATORY OUTPUT: Return exactly one transformed image part.
     2. SPATIAL ASSOCIATION: If an instruction links a color zone to an Input index, strictly use that Input as the visual blueprint for that colored region on Input 0.
     3. GROUND TRUTH: Maintain Input 0's skeletal integrity outside of morph instructions.
     4. NO MODIFICATION: Transform ONLY Input 0. References are read-only.`;

export async function styleAvatarWithGemini(
    avatar: ImageFile,
    referenceImages: ImageFile[],
    prompt: string,
    seed: number,
    model: ImageModel,
    safetyLevel: SafetyLevel,
    resolution: ImageResolution,
    aspectRatio: AspectRatioOption
): Promise<{ editedImage: string | null; textResponse: string | null; }> {
    try {
        const ai = getAiClient();
        const parts: Part[] = [];
        
        // Input 0: The Target
        parts.push({ inlineData: { data: avatar.dataUrl.split(',')[1], mimeType: avatar.mimeType } });
        
        // Input 1: Optional Mask
        if (avatar.maskDataUrl) {
            parts.push({ inlineData: { data: avatar.maskDataUrl.split(',')[1], mimeType: 'image/png' } });
        }

        // Subsequent Inputs: References
        referenceImages.forEach(ref => {
            parts.push({ inlineData: { data: ref.dataUrl.split(',')[1], mimeType: ref.mimeType } });
        });

        const spatialInstructions = getSpatialHeader(!!avatar.maskDataUrl);
        parts.push({ text: `${spatialInstructions}\n\nUSER PROMPT: ${prompt}` });

        const config: any = {
            safetySettings: getSafetySettings(safetyLevel),
            imageConfig: {
                aspectRatio: mapAspectRatio(aspectRatio)
            }
        };

        if (model === 'gemini-3-pro-image-preview') {
            config.imageConfig.imageSize = resolution;
        }

        if (typeof seed === 'number' && seed !== 0) config.seed = Math.floor(seed);
        
        const response = await ai.models.generateContent({ 
            model, 
            contents: { parts }, 
            config 
        });

        return extractResponse(response);
    } catch (error) { 
        handleApiError(error); 
        return { editedImage: null, textResponse: 'Error' }; 
    }
}

export async function editImageWithGemini(
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  base64MaskData: string | undefined,
  maskMimeType: string | undefined,
  referenceImages: ImageFile[],
  seed: number,
  model: ImageModel,
  safetyLevel: SafetyLevel,
  resolution: ImageResolution,
  aspectRatio: AspectRatioOption
): Promise<{ editedImage: string | null; textResponse: string | null; }> {
  try {
    const ai = getAiClient();
    const parts: Part[] = [];
    
    // Input 0
    parts.push({ inlineData: { data: base64ImageData, mimeType } });
    
    // Input 1
    if (base64MaskData) {
        parts.push({ inlineData: { data: base64MaskData, mimeType: maskMimeType || 'image/png' } });
    }

    // Subsequent
    referenceImages.forEach(ref => {
        parts.push({ inlineData: { data: ref.dataUrl.split(',')[1], mimeType: ref.mimeType } });
    });
    
    const spatialInstructions = getSpatialHeader(!!base64MaskData);
    parts.push({ text: `${spatialInstructions}\n\nUSER INSTRUCTION: ${prompt}` });

    const config: any = {
        safetySettings: getSafetySettings(safetyLevel),
        imageConfig: {
            aspectRatio: mapAspectRatio(aspectRatio)
        }
    };

    if (model === 'gemini-3-pro-image-preview') {
        config.imageConfig.imageSize = resolution;
    }

    if (typeof seed === 'number' && seed !== 0) config.seed = Math.floor(seed);
    
    const response = await ai.models.generateContent({ 
        model, 
        contents: { parts }, 
        config 
    });

    return extractResponse(response);
  } catch (error) { 
      handleApiError(error); 
      return { editedImage: null, textResponse: 'Error' }; 
  }
}

export async function generatePromptConfiguration(mainImage: ImageFile | null, referenceImages: ImageFile[], intent: string): Promise<GeneratedPromptResponse> {
    try {
        const ai = getAiClient();
        const parts: Part[] = [{ text: `Create a structured generation prompt configuration in JSON format for this intent: "${intent}". 
        
        The goal is a high-fidelity photographic outcome. 
        
        SCHEMA: { 
            "mainPrompt": string, 
            "config": {
                "keyElements": {
                    "subjectType": {"text": string, "weight": number},
                    ...
                }
            }
        }
        Return JSON ONLY. No markdown.` }];
        
        if (mainImage) {
            parts.push({ inlineData: { data: mainImage.dataUrl.split(',')[1], mimeType: mainImage.mimeType } });
        }
        
        referenceImages.slice(0, 3).forEach(ref => {
            parts.push({ inlineData: { data: ref.dataUrl.split(',')[1], mimeType: ref.mimeType } });
        });

        const response = await ai.models.generateContent({ 
            model: 'gemini-3-flash-preview', 
            contents: { parts }, 
            config: { 
                responseMimeType: 'application/json' 
            } 
        });

        const json = JSON.parse(response.text || '{}');
        const sanitizeField = (f: any) => ({ 
            text: f?.text || '', 
            weight: typeof f?.weight === 'number' ? f.weight : 1.0 
        });

        return { 
            mainPrompt: json.mainPrompt || '', 
            config: { 
                aspectRatio: '1:1', 
                keyElements: { 
                    subjectType: sanitizeField(json.config?.keyElements?.subjectType), 
                    outfit: sanitizeField(json.config?.keyElements?.outfit), 
                    action: sanitizeField(json.config?.keyElements?.action), 
                    environment: sanitizeField(json.config?.keyElements?.environment), 
                    lighting: sanitizeField(json.config?.keyElements?.lighting), 
                    mood: sanitizeField(json.config?.keyElements?.mood) 
                }, 
                camera: { 
                    body: sanitizeField(json.config?.camera?.body), 
                    lens: sanitizeField(json.config?.camera?.lens), 
                    aperture: sanitizeField(json.config?.camera?.aperture), 
                    shutter: { text: '', weight: 1.0 },
                    iso: { text: '', weight: 1.0 },
                    filmSimulation: sanitizeField(json.config?.camera?.filmSimulation) 
                }, 
                composition: { 
                    shotType: { text: '', weight: 1.0 }, 
                    angle: { text: '', weight: 1.0 }, 
                    focus: { text: '', weight: 1.0 }, 
                    orientation: { text: '', weight: 1.0 }, 
                    camera3D: { 
                        enabled: false, azimuth: 0, elevation: 0, distance: 1, lightAzimuth: 45, objectRotation: 180 
                    } 
                }, 
                style: { 
                    genre: { text: '', weight: 1.0 }, 
                    aesthetic: { text: '', weight: 1.0 } 
                } 
            } 
        };
    } catch (e) { 
        handleApiError(e); 
        throw e; 
    }
}
