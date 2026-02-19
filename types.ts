
export interface ImageFile {
  dataUrl: string;
  mimeType: string;
  maskDataUrl?: string;
}

export interface MarkupEntry {
    id: number;
    image: ImageFile;
    mask: ImageFile | null;
    timestamp: number;
}

export type ImageModel = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
export type SafetyLevel = 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_NONE';
export type ImageResolution = '1K' | '2K' | '4K';
export type AspectRatioOption = '1:1' | '4:5' | '5:4' | '3:4' | '4:3' | '2:3' | '3:2' | '9:16' | '16:9' | '9:21' | '21:9' | '1:2' | '2:1' | '10:16' | '16:10' | '2.35:1' | '1:2.35' | '2.39:1' | '1:2.39' | '3:1' | '1:3' | '4:7';

export enum AppMode {
  CREATE = 'edit',
  STYLE = 'style',
  ELEMENTS = 'elements',
}

interface HistoryEntryBase {
  id: number;
  type: 'edit' | 'style' | 'remix' | 'elements';
  prompt: string;
  thumbnail: string;
  textResponse: string | null;
  favorite?: boolean;
  seed: number;
  model?: ImageModel;
  safetyLevel?: SafetyLevel;
  resolution?: ImageResolution;
}

export interface EditHistoryEntry extends HistoryEntryBase {
    type: 'edit';
    originalImage: ImageFile;
    maskImage: ImageFile | null;
    editedImage: string;
}

export interface StyleHistoryEntry extends HistoryEntryBase {
    type: 'style';
    avatarImage: ImageFile;
    referenceImages: ImageFile[];
    editedImage: string;
}

export interface RemixHistoryEntry extends HistoryEntryBase {
    type: 'remix';
    sceneImage: ImageFile;
    sceneMask: ImageFile;
    insertImage: ImageFile;
    editedImage: string;
}

export interface ElementsHistoryEntry extends HistoryEntryBase {
    type: 'elements';
    baseImage: ImageFile;
    maskImage: ImageFile;
    elementImage: ImageFile;
    editedImage: string;
}

export type HistoryEntry = EditHistoryEntry | StyleHistoryEntry | RemixHistoryEntry | ElementsHistoryEntry;

export interface WeightedField {
    text: string;
    weight: number;
}

export interface Camera3DParams {
    enabled: boolean;
    azimuth: number;    
    elevation: number;  
    distance: number;   
    lightAzimuth: number; 
    objectRotation: number; 
}

export interface PromptConfig {
    aspectRatio: AspectRatioOption;
    keyElements: {
        subjectType: WeightedField;
        outfit: WeightedField;
        action: WeightedField;
        environment: WeightedField;
        lighting: WeightedField;
        mood: WeightedField;
    };
    camera: {
        body: WeightedField;
        lens: WeightedField;
        aperture: WeightedField;
        shutter: WeightedField;
        iso: WeightedField;
        filmSimulation: WeightedField;
    };
    composition: {
        shotType: WeightedField;
        angle: WeightedField;
        focus: WeightedField;
        orientation: WeightedField;
        camera3D: Camera3DParams;
    };
    style: {
        genre: WeightedField;
        aesthetic: WeightedField;
    };
}

export interface ZoneData {
  text: string;
  image: ImageFile | null;
}

export interface ZonePrompts {
  red: ZoneData;
  yellow: ZoneData;
  green: ZoneData;
  blue: ZoneData;
  purple: ZoneData;
}

export interface IdentityLockConfig {
    enabled: boolean;
    structureWeight: number;
    textureWeight: number;
    geometryReinforcement: number;
    microAsymmetry: boolean;
    midfaceLock: 'hard' | 'soft' | 'off';
    cheekboneLock: 'maximum' | 'standard' | 'off';
    jawlineLock: 'maximum' | 'standard' | 'off';
    expressionTolerance: 'stability' | 'flexible';
    forbidEyeWidening: boolean;
    angleStability: boolean;
}

export interface GarmentLockConfig {
    enabled: boolean;
    fabricWeight: number;
    silhouetteWeight: number;
    detailWeight: number;
    stitchingPrecision: boolean;
    physicsMatch: boolean;
    colorLock: boolean;
}

export interface PoseLockConfig {
    enabled: boolean;
    poseWeight: number;
    anatomyMatch: number;
    limbPrecision: boolean;
    preserveSubjectAnatomy: boolean;
}

export interface SceneLockConfig {
    enabled: boolean;
    layoutWeight: number;
    lightingWeight: number;
    atmosphereWeight: number;
    geometryLock: boolean;
    preserveShadows: boolean;
}

export interface AdvancedReferenceBucket {
    enabled: boolean;
    images: ImageFile[];
}

export interface AdvancedReferencesState {
    hair: AdvancedReferenceBucket;
    nails: AdvancedReferenceBucket;
    makeup: AdvancedReferenceBucket;
    jewelry: AdvancedReferenceBucket;
    details: AdvancedReferenceBucket;
    shoes: AdvancedReferenceBucket;
    multiAngle: AdvancedReferenceBucket;
    other: AdvancedReferenceBucket;
}

export interface RealismConfig {
    enabled: boolean;
    preserveIdentityMarks: boolean;
    intensity: number;
    ageProfile: 'teen' | 'adult' | 'older';
    preset: 'NATURAL REALISM' | 'BEAUTY CLEAN' | 'EDITORIAL' | 'RAW DETAIL';
    modules: {
        toneVariation: {
            enabled: boolean;
            mottlingScale: number;
            cheekWarmth: number;
            noseRedness: number;
        };
        poreTexture: {
            enabled: boolean;
            poreStrength: number;
            nosePores: number;
            cheekPores: number;
        };
        fineLines: {
            enabled: boolean;
            creaseSoftness: number;
            blemishProbability: number;
        };
        naturalSheen: {
            enabled: boolean;
            foreheadShine: number;
            noseShine: number;
        };
    };
    cleanup: {
        removeArtifacts: { enabled: boolean; strength: number; };
        adaptiveSmoothing: { enabled: boolean; strength: number; };
        tonalBalance: { enabled: boolean; strength: number; };
    };
}

export interface GeneratedPromptResponse {
    mainPrompt: string;
    config: PromptConfig;
}
