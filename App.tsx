
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ReferenceImageUploader } from './components/ReferenceImageUploader';
import { ModeSelector, type Mode } from './components/ModeSelector';
import { EditingWorkspace } from './components/EditingWorkspace';
import { PromptInput } from './components/PromptInput';
import { PromptBuilder } from './components/PromptBuilder';
import { IdentityLockPanel } from './components/IdentityLockPanel';
import { GarmentLockPanel } from './components/GarmentLockPanel';
import { PoseLockPanel } from './components/PoseLockPanel';
import { SceneLockPanel } from './components/SceneLockPanel';
import { RealismPanel } from './components/RealismPanel';
import { ActionButtons } from './components/ActionButtons';
import { ImageDisplay } from './components/ImageDisplay';
import { Spinner } from './components/Spinner';
import { HistoryPanel } from './components/HistoryPanel';
import { ZoomViewer } from './components/ZoomViewer';
import { RepositoryModal } from './components/RepositoryModal';
import { ErrorAlert } from './components/ErrorAlert';
import { PromptGeneratorModal } from './components/PromptGeneratorModal';
import { AdvancedImageCropper } from './components/AdvancedImageCropper';
import { editImageWithGemini, styleAvatarWithGemini, generatePromptConfiguration } from './services/geminiService';
import type { ImageFile, MarkupEntry, HistoryEntry, EditHistoryEntry, StyleHistoryEntry, ImageModel, SafetyLevel, ImageResolution, PromptConfig, IdentityLockConfig, GarmentLockConfig, PoseLockConfig, SceneLockConfig, RealismConfig, AdvancedReferencesState, AspectRatioOption, ZonePrompts, AdvancedReferenceBucket } from './types';
import { TrashIcon, DownloadIcon, UploadIcon, UndoIcon, CheckCircleIcon, PaintBrushIcon, HistoryIcon, ZoomInIcon, SlidersIcon, ChevronRightIcon, RefreshIcon } from './components/icons';

type Theme = 'light' | 'dark';
type LibraryTarget = 'avatar' | 'edit-base';

const createThumbnail = (dataUrl: string, width: number = 256): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const aspect = img.height / img.width;
      canvas.width = width;
      canvas.height = width * aspect;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas Error"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
};

const emptyField = { text: '', weight: 1.0 };
const initialPromptConfig: PromptConfig = {
    aspectRatio: '1:1',
    keyElements: { subjectType: {...emptyField}, outfit: {...emptyField}, action: {...emptyField}, environment: {...emptyField}, lighting: {...emptyField}, mood: {...emptyField} },
    camera: { body: {...emptyField}, lens: {...emptyField}, aperture: {...emptyField}, shutter: {...emptyField}, iso: {...emptyField}, filmSimulation: {...emptyField} },
    composition: { shotType: {...emptyField}, angle: {...emptyField}, focus: {...emptyField}, orientation: {...emptyField}, camera3D: { enabled: false, azimuth: 0, elevation: 0, distance: 1, lightAzimuth: 45, objectRotation: 180 } },
    style: { genre: {...emptyField}, aesthetic: {...emptyField} }
};

const initialAdvancedRefs: AdvancedReferencesState = {
    hair: { enabled: true, images: [] }, nails: { enabled: true, images: [] }, makeup: { enabled: true, images: [] }, jewelry: { enabled: true, images: [] }, details: { enabled: true, images: [] }, shoes: { enabled: true, images: [] }, multiAngle: { enabled: true, images: [] }, other: { enabled: true, images: [] }
};

const initialZonePrompts: ZonePrompts = { red: '', yellow: '', green: '', blue: '', purple: '' };

const RATIO_GROUPS = {
    Square: ["1:1"],
    Portrait: ["4:5", "3:4", "2:3", "9:16", "9:21", "1:2", "10:16", "1:2.35", "1:2.39", "1:3", "4:7"],
    Landscape: ["5:4", "4:3", "3:2", "16:9", "21:9", "2:1", "16:10", "2.35:1", "2.39:1", "3:1"]
};

export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mode, setMode] = useState<Mode>('edit');
  const [editSubMode, setEditSubMode] = useState<'global' | 'mask'>('mask');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [zonePrompts, setZonePrompts] = useState<ZonePrompts>(initialZonePrompts);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [markupHistory, setMarkupHistory] = useState<MarkupEntry[]>([]);

  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  const [selectedHistoryIds] = useState<Set<number>>(new Set());
  const [zoomedInfo, setZoomedInfo] = useState<{ history: HistoryEntry[], startIndex: number } | { url: string } | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isRepositoryModalOpen, setIsRepositoryModalOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<LibraryTarget>('avatar');
  const [imageModel, setImageModel] = useState<ImageModel>('gemini-2.5-flash-image');
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>('BLOCK_MEDIUM_AND_ABOVE');
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('1:1');
  const [curationSeed, setCurationSeed] = useState<string>('');
  const [isPromptBuilderOpen, setIsPromptBuilderOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(initialPromptConfig);
  const [isAdvancedUploads, setIsAdvancedUploads] = useState(false);
  const [advancedRefs, setAdvancedRefs] = useState<AdvancedReferencesState>(initialAdvancedRefs);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false);
  const [generatedConfigData, setGeneratedConfigData] = useState<{ prompt: string; config: PromptConfig } | null>(null);
  
  const [croppingConfig, setCroppingConfig] = useState<{ imageUrl: string, mimeType: string, onSave: (url: string) => void, aspect?: number } | null>(null);

  const [isIdentityLockOpen, setIsIdentityLockOpen] = useState(false);
  const [identityConfig, setIdentityConfig] = useState<IdentityLockConfig>({ enabled: false, structureWeight: 0.95, textureWeight: 0.45, geometryReinforcement: 1.2, microAsymmetry: true, midfaceLock: 'hard', cheekboneLock: 'maximum', jawlineLock: 'maximum', expressionTolerance: 'stability', forbidEyeWidening: true, angleStability: true });
  const [structureImage, setStructureImage] = useState<ImageFile | null>(null);
  const [textureImage, setTextureImage] = useState<ImageFile | null>(null);
  
  const [isGarmentLockOpen, setIsGarmentLockOpen] = useState(false);
  const [garmentConfig, setGarmentConfig] = useState<GarmentLockConfig>({ enabled: false, fabricWeight: 1.0, silhouetteWeight: 1.0, detailWeight: 1.0, stitchingPrecision: true, physicsMatch: true, colorLock: true });
  const [garmentImages, setGarmentImages] = useState<ImageFile[]>([]);
  
  const [isPoseLockOpen, setIsPoseLockOpen] = useState(false);
  const [poseLockConfig, setPoseLockConfig] = useState<PoseLockConfig>({ enabled: false, poseWeight: 1.0, anatomyMatch: 1.0, limbPrecision: true, preserveSubjectAnatomy: true });
  const [poseLockImage, setPoseLockImage] = useState<ImageFile | null>(null);

  const [isSceneLockOpen, setIsSceneLockOpen] = useState(false);
  const [sceneLockConfig, setSceneLockConfig] = useState<SceneLockConfig>({ enabled: false, layoutWeight: 1.0, lightingWeight: 1.0, atmosphereWeight: 1.0, geometryLock: true, preserveShadows: true });
  const [sceneLockImage, setSceneLockImage] = useState<ImageFile | null>(null);
  
  const [isRealismOpen, setIsRealismOpen] = useState(false);
  const [realismConfig, setRealismConfig] = useState<RealismConfig>({ 
    enabled: false, 
    preserveIdentityMarks: true, 
    intensity: 0.65, 
    ageProfile: 'adult', 
    preset: 'NATURAL REALISM', 
    modules: { 
        toneVariation: { enabled: true, mottlingScale: 0.45, cheekWarmth: 0.25, noseRedness: 0.20 }, 
        poreTexture: { enabled: true, poreStrength: 0.55, nosePores: 0.75, cheekPores: 0.55 }, 
        fineLines: { enabled: true, creaseSoftness: 0.50, blemishProbability: 0.25 }, 
        naturalSheen: { enabled: true, foreheadShine: 0.35, noseShine: 0.55 } 
    }, 
    cleanup: { 
        removeArtifacts: { enabled: true, strength: 0.65 }, 
        adaptiveSmoothing: { enabled: true, strength: 0.55 }, 
        tonalBalance: { enabled: true, strength: 0.35 } 
    } 
  });
  
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [masterSourceImage, setMasterSourceImage] = useState<ImageFile | null>(null);
  const [maskImage, setMasterMaskImage] = useState<ImageFile | null>(null);
  const [avatarImage, setAvatarImage] = useState<ImageFile | null>(null);
  const [masterAvatarImage, setMasterAvatarImage] = useState<ImageFile | null>(null);
  
  const [editReferenceImages, setEditReferenceImages] = useState<ImageFile[]>([]);
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const ensureApiKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) { await window.aistudio.openSelectKey(); return true; }
    }
    return true;
  };

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode); setEditedImage(null); setPrompt(''); setError(null);
  }

  const handleApiError = async (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Requested entity was not found") && window.aistudio) {
        try { await window.aistudio.openSelectKey(); setError("Session reset. Try again."); } catch { setError("Key update failed."); }
    } else { setError(msg); }
  }

  const handleInitialUpload = (file: ImageFile, target: 'edit' | 'avatar') => {
      if (target === 'edit') {
          setOriginalImage(file);
          setMasterSourceImage(file);
          setMasterMaskImage(null);

          const entry: MarkupEntry = {
            id: Date.now(),
            image: file,
            mask: null,
            timestamp: Date.now()
          };
          setMarkupHistory(prev => [entry, ...prev]);

      } else {
          setAvatarImage(file);
          setMasterAvatarImage(file);
      }
  };

  const handleSelectFromRepository = (imageSrc: string) => {
    const file: ImageFile = { dataUrl: imageSrc, mimeType: 'image/jpeg' };
    if (libraryTarget === 'avatar') {
      handleInitialUpload(file, 'avatar');
    } else {
      handleInitialUpload(file, 'edit');
    }
  };

  const handleRevert = () => {
      if (mode === 'edit' && masterSourceImage) {
          setOriginalImage(masterSourceImage);
          setEditedImage(null);
          setMasterMaskImage(null);
      } else if (mode === 'style' && masterAvatarImage) {
          setAvatarImage(masterAvatarImage);
          setEditedImage(null);
      }
  };

  const handleCancelResult = () => {
      setEditedImage(null);
  };

  const handleCommit = () => {
      if (!editedImage) return;
      const file: ImageFile = { dataUrl: editedImage, mimeType: 'image/png' };
      if (mode === 'edit') {
          setOriginalImage(file);
          setMasterSourceImage(file);
          setMasterMaskImage(null);
      } else if (mode === 'style') {
          setAvatarImage(file);
      }
      setEditedImage(null);
  };

  const getEffectiveReferences = (basePool: ImageFile[]) => {
      let allRefs = [...basePool];
      
      if (identityConfig.enabled) {
          if (structureImage) allRefs.push(structureImage);
          if (textureImage) allRefs.push(textureImage);
      }
      if (garmentConfig.enabled && garmentImages.length > 0) {
          allRefs = [...allRefs, ...garmentImages];
      }
      if (poseLockConfig.enabled && poseLockImage) {
          allRefs.push(poseLockImage);
      }
      if (sceneLockConfig.enabled && sceneLockImage) {
          allRefs.push(sceneLockImage);
      }

      if (isAdvancedUploads) {
          (Object.values(advancedRefs) as AdvancedReferenceBucket[]).forEach(bucket => {
              if (bucket.enabled && bucket.images.length > 0) {
                  allRefs = [...allRefs, ...bucket.images];
              }
          });
      }
      return allRefs;
  };

  const constructFullPrompt = useCallback((
    userPrompt: string, 
    config: PromptConfig, 
    zones: ZonePrompts,
    iLock: IdentityLockConfig,
    gLock: GarmentLockConfig,
    pLock: PoseLockConfig,
    sLock: SceneLockConfig,
    realism: RealismConfig
  ) => {
    let parts: string[] = [userPrompt];

    if (mode === 'edit' && editSubMode === 'mask') {
        const zoneParts = [];
        if (zones.red) zoneParts.push(`[RED ZONE/REMOVAL]: ${zones.red}`);
        if (zones.yellow) zoneParts.push(`[YELLOW ZONE/TRANSFORM]: ${zones.yellow}`);
        if (zones.green) zoneParts.push(`[GREEN ZONE/ADDITION]: ${zones.green}`);
        if (zones.blue) zoneParts.push(`[BLUE ZONE/LIGHTING]: ${zones.blue}`);
        if (zones.purple) zoneParts.push(`[PURPLE ZONE/MORPH]: ${zones.purple}`);
        if (zoneParts.length > 0) parts.push(`--- SPATIAL SEMANTICS ---\n${zoneParts.join('\n')}`);
    }

    const techParts: string[] = [];
    const fmt = (f: any) => f.text ? (f.weight !== 1 ? `(${f.text}:${f.weight.toFixed(1)})` : f.text) : null;

    const keys = config.keyElements;
    const keyItems = [fmt(keys.subjectType), fmt(keys.outfit), fmt(keys.action), fmt(keys.environment), fmt(keys.lighting), fmt(keys.mood)].filter(Boolean);
    if (keyItems.length > 0) techParts.push(`[SUBJECT/SCENE]: ${keyItems.join(', ')}`);

    const cam = config.camera;
    const camItems = [fmt(cam.body), fmt(cam.lens), fmt(cam.aperture), fmt(cam.shutter), fmt(cam.iso), fmt(cam.filmSimulation)].filter(Boolean);
    if (camItems.length > 0) techParts.push(`[CAMERA]: ${camItems.join(', ')}`);

    const comp = config.composition;
    const compItems = [fmt(comp.shotType), fmt(comp.angle), fmt(comp.focus), fmt(comp.orientation)].filter(Boolean);
    if (compItems.length > 0) techParts.push(`[COMPOSITION]: ${compItems.join(', ')}`);

    const sty = config.style;
    const styItems = [fmt(sty.genre), fmt(sty.aesthetic)].filter(Boolean);
    if (styItems.length > 0) techParts.push(`[AESTHETIC]: ${styItems.join(', ')}`);

    if (comp.camera3D.enabled) {
        techParts.push(`[STAGE POV]: AZ=${comp.camera3D.azimuth}°, EL=${comp.camera3D.elevation}°, ZOOM=${comp.camera3D.distance}x, OBJ_ROT=${comp.camera3D.objectRotation}°, L_AZ=${comp.camera3D.lightAzimuth}°`);
    }

    if (techParts.length > 0) parts.push(`--- TECHNICAL SPECIFICATION ---\n${techParts.join('\n')}`);

    const engineParts: string[] = [];
    if (iLock.enabled) engineParts.push(`[IDENTITY LOCK ACTIVE]: Source facial structure and anatomy from the Identity Reference images. Maintain exact geometry with structure weight ${iLock.structureWeight} and texture reinforcement ${iLock.textureWeight}. Locks: Midface=${iLock.midfaceLock}, Cheekbones=${iLock.cheekboneLock}.`);
    if (gLock.enabled) engineParts.push(`[GARMENT LOCK ACTIVE]: Strictly transfer the fabric, silhouette, and details from the provided Garment Reference image(s). Fabric Weight=${gLock.fabricWeight}, Detail Precision=${gLock.detailWeight}. Combine stylistic cues from multiple references if present.`);
    if (pLock.enabled) engineParts.push(`[POSE LOCK ACTIVE]: Map skeletal anatomy and postural data from the Pose Reference onto Input 0. Rigidity=${pLock.poseWeight}, Preserve Proportions=${pLock.preserveSubjectAnatomy}.`);
    if (sLock.enabled) engineParts.push(`[SCENE LOCK ACTIVE]: Lock background architecture, layout, and environment geometry from the Scene Reference image. Maintain lighting consistency with match weight ${sLock.lightingWeight}. Layout Stability=${sLock.layoutWeight}.`);
    
    if (realism.enabled) {
        engineParts.push(`[REALISM ENGINE]: Intensity=${realism.intensity}, Preset=${realism.preset}, Profile=${realism.ageProfile}, MicroTexture=${realism.modules.poreTexture.poreStrength}, PoreDist(Nose:${realism.modules.poreTexture.nosePores}, Cheek:${realism.modules.poreTexture.cheekPores}), ToneVar=${realism.modules.toneVariation.mottlingScale}`);
    }

    if (engineParts.length > 0) parts.push(`--- NEURAL ENGINE PARAMETERS ---\n${engineParts.join('\n')}`);

    parts.push(`[GLOBAL ASPECT RATIO]: ${aspectRatio}`);

    return parts.join('\n\n');
  }, [mode, editSubMode, aspectRatio]);

  const handleStyleTransfer = useCallback(async () => {
    if (!avatarImage) { setError("Please upload an Avatar image first."); return; }
    if (!prompt.trim()) { setError("Please provide a prompt to guide the style curation."); return; }

    const finalPrompt = constructFullPrompt(prompt, promptConfig, zonePrompts, identityConfig, garmentConfig, poseLockConfig, sceneLockConfig, realismConfig);
    const seed = curationSeed ? parseInt(curationSeed) : Math.floor(Math.random() * 2147483647);
    
    const effectiveRefs = getEffectiveReferences(referenceImages);

    setIsLoading(true); setError(null); setEditedImage(null);
    try {
      const { editedImage: newImage, textResponse: newText } = await styleAvatarWithGemini(avatarImage, effectiveRefs, finalPrompt, seed, imageModel, safetyLevel, resolution, aspectRatio);
      if (newImage) {
        const url = `data:image/png;base64,${newImage}`; setEditedImage(url); 
        const thumb = await createThumbnail(url);
        const entry: StyleHistoryEntry = { id: Date.now(), type: 'style', prompt: finalPrompt, avatarImage, referenceImages: effectiveRefs, editedImage: url, thumbnail: thumb, textResponse: newText, seed, model: imageModel, safetyLevel, resolution };
        setHistory(prev => [entry, ...prev]); setActiveHistoryId(entry.id);
      } else if (newText) {
          setError(`AI refused generation: ${newText}`);
      }
    } catch (e) { handleApiError(e); } finally { setIsLoading(false); }
  }, [avatarImage, referenceImages, prompt, promptConfig, zonePrompts, identityConfig, garmentConfig, poseLockConfig, sceneLockConfig, realismConfig, imageModel, safetyLevel, resolution, constructFullPrompt, curationSeed, aspectRatio, isAdvancedUploads, advancedRefs, structureImage, textureImage, garmentImages, poseLockImage, sceneLockImage]);

  const handleInpaintingEdit = useCallback(async () => {
    if (!originalImage) { setError("Please upload a base image for retouching."); return; }
    if (editSubMode === 'mask' && !maskImage) { 
        setError("Please paint a selection on the canvas and click 'Confirm Selection' before generating, or switch to 'Entire Canvas' mode."); 
        return; 
    }
    if (!prompt.trim()) { setError("Please provide a prompt to guide the retouching."); return; }

    const finalPrompt = constructFullPrompt(prompt, promptConfig, zonePrompts, identityConfig, garmentConfig, poseLockConfig, sceneLockConfig, realismConfig);
    const seed = curationSeed ? parseInt(curationSeed) : Math.floor(Math.random() * 2147483647);

    const targetImage = (editSubMode === 'mask') ? originalImage : masterSourceImage!;
    const targetMask = (editSubMode === 'mask') ? maskImage : null;
    
    const effectiveRefs = getEffectiveReferences(editReferenceImages);

    setIsLoading(true); setError(null); setEditedImage(null);
    try {
      const { editedImage: newImage, textResponse: newText } = await editImageWithGemini(
        targetImage.dataUrl.split(',')[1], 
        targetImage.mimeType, 
        finalPrompt, 
        targetMask ? targetMask.dataUrl.split(',')[1] : undefined, 
        targetMask ? targetMask.mimeType : undefined, 
        effectiveRefs,
        seed, imageModel, safetyLevel, resolution, aspectRatio
      );
      if (newImage) {
        const url = `data:image/png;base64,${newImage}`; setEditedImage(url); 
        const thumb = await createThumbnail(url);
        const entry: EditHistoryEntry = { id: Date.now(), type: 'edit', prompt: finalPrompt, originalImage: targetImage, maskImage: targetMask, editedImage: url, thumbnail: thumb, textResponse: newText, seed, model: imageModel, safetyLevel, resolution };
        setHistory(prev => [entry, ...prev]); setActiveHistoryId(entry.id);
      } else if (newText) {
          setError(`AI refused edit: ${newText}`);
      }
    } catch (e) { handleApiError(e); } finally { setIsLoading(false); }
  }, [originalImage, masterSourceImage, maskImage, editSubMode, prompt, promptConfig, zonePrompts, identityConfig, garmentConfig, poseLockConfig, sceneLockConfig, realismConfig, imageModel, safetyLevel, resolution, constructFullPrompt, curationSeed, aspectRatio, editReferenceImages, isAdvancedUploads, advancedRefs, structureImage, textureImage, garmentImages, poseLockImage, sceneLockImage]);

  const handleSubmit = async () => {
    if (imageModel === 'gemini-3-pro-image-preview') await ensureApiKey();
    if (mode === 'edit') handleInpaintingEdit();
    else if (mode === 'style') handleStyleTransfer();
  };

  const handleMaskUpdate = (mask: ImageFile | null, composited?: ImageFile | null) => {
    setMasterMaskImage(mask);
    if (composited) {
        setOriginalImage(composited);
        if (mask) {
            const entry: MarkupEntry = {
                id: Date.now(),
                image: composited,
                mask: mask,
                timestamp: Date.now()
            };
            setMarkupHistory(prev => [entry, ...prev]);
        }
    }
  };

  const restoreBlueprint = (entry: MarkupEntry) => {
      setOriginalImage(entry.image);
      setMasterMaskImage(entry.mask);
      setEditedImage(null);
      if (entry.mask) setEditSubMode('mask');
  };

  const handleAppendPrompt = (text: string) => {
      setPrompt(prev => prev.trim() + (prev.trim() ? " " : "") + text);
  };

  const handleZonePromptChange = (zone: keyof ZonePrompts, val: string) => {
      setZonePrompts(prev => ({ ...prev, [zone]: val }));
  };

  const handleClearPromptAndConfig = () => {
    setPrompt('');
    setPromptConfig(initialPromptConfig);
    setZonePrompts(initialZonePrompts);
  };

  // CROPPING HANDLERS
  const handleReferenceCropRequest = (index: number) => {
      const pool = mode === 'edit' ? editReferenceImages : referenceImages;
      const target = pool[index];
      if (!target) return;
      setCroppingConfig({
          imageUrl: target.dataUrl,
          mimeType: target.mimeType,
          onSave: (url) => {
              const nextPool = [...pool];
              nextPool[index] = { ...target, dataUrl: url };
              if (mode === 'edit') setEditReferenceImages(nextPool);
              else setReferenceImages(nextPool);
              setCroppingConfig(null);
          }
      });
  };

  const handleStructureCropRequest = () => {
      if (!structureImage) return;
      setCroppingConfig({
          imageUrl: structureImage.dataUrl,
          mimeType: structureImage.mimeType,
          onSave: (url) => {
              setStructureImage({ ...structureImage, dataUrl: url });
              setCroppingConfig(null);
          }
      });
  };

  const handleTextureCropRequest = () => {
      if (!textureImage) return;
      setCroppingConfig({
          imageUrl: textureImage.dataUrl,
          mimeType: textureImage.mimeType,
          onSave: (url) => {
              setTextureImage({ ...textureImage, dataUrl: url });
              setCroppingConfig(null);
          }
      });
  };

  const handleGarmentCropRequest = (index: number) => {
      const target = garmentImages[index];
      if (!target) return;
      setCroppingConfig({
          imageUrl: target.dataUrl,
          mimeType: target.mimeType,
          onSave: (url) => {
              const next = [...garmentImages];
              next[index] = { ...target, dataUrl: url };
              setGarmentImages(next);
              setCroppingConfig(null);
          }
      });
  };

  const handlePoseCropRequest = () => {
      if (!poseLockImage) return;
      setCroppingConfig({
          imageUrl: poseLockImage.dataUrl,
          mimeType: poseLockImage.mimeType,
          onSave: (url) => {
              setPoseLockImage({ ...poseLockImage, dataUrl: url });
              setCroppingConfig(null);
          }
      });
  };

  const handleSceneCropRequest = () => {
      if (!sceneLockImage) return;
      setCroppingConfig({
          imageUrl: sceneLockImage.dataUrl,
          mimeType: sceneLockImage.mimeType,
          onSave: (url) => {
              setSceneLockImage({ ...sceneLockImage, dataUrl: url });
              setCroppingConfig(null);
          }
      });
  };

  const handleExportProject = () => {
    const projectState = {
      mode, editSubMode, prompt, zonePrompts, imageModel, safetyLevel, resolution, aspectRatio,
      promptConfig, identityConfig, garmentConfig, poseLockConfig, sceneLockConfig, realismConfig,
      originalImage, avatarImage, referenceImages: mode === 'edit' ? editReferenceImages : referenceImages,
      structureImage, textureImage, garmentImages, poseLockImage, sceneLockImage, timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(projectState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `samsara-project-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result as string);
        if (state.mode) setMode(state.mode);
        if (state.editSubMode) setEditSubMode(state.editSubMode);
        if (state.prompt !== undefined) setPrompt(state.prompt);
        if (state.zonePrompts) setZonePrompts(state.zonePrompts);
        if (state.imageModel) setImageModel(state.imageModel);
        if (state.safetyLevel) setSafetyLevel(state.safetyLevel);
        if (state.resolution) setResolution(state.resolution);
        if (state.aspectRatio) setAspectRatio(state.aspectRatio);
        if (state.promptConfig) setPromptConfig(state.promptConfig);
        if (state.identityConfig) setIdentityConfig(state.identityConfig);
        if (state.garmentConfig) setGarmentConfig(state.garmentConfig);
        if (state.poseLockConfig) setPoseLockConfig(state.poseLockConfig);
        if (state.sceneLockConfig) setSceneLockConfig(state.sceneLockConfig);
        if (state.realismConfig) setRealismConfig(state.realismConfig);
        if (state.originalImage) setOriginalImage(state.originalImage);
        if (state.avatarImage) setAvatarImage(state.avatarImage);
        if (state.referenceImages) {
          if (state.mode === 'edit') setEditReferenceImages(state.referenceImages);
          else setReferenceImages(state.referenceImages);
        }
        if (state.structureImage) setStructureImage(state.structureImage);
        if (state.textureImage) setTextureImage(state.textureImage);
        if (state.garmentImages) setGarmentImages(state.garmentImages);
        if (state.poseLockImage) setPoseLockImage(state.poseLockImage);
        if (state.sceneLockImage) setSceneLockImage(state.sceneLockImage);
        setEditedImage(null);
        setError(null);
      } catch (err) { setError("Failed to parse project file."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const isCurationReady = mode === 'style' ? !!avatarImage : (editSubMode === 'global' ? !!originalImage : !!maskImage);

  return (
    <div className={`min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg transition-colors duration-700`}>
      <Header theme={theme} onToggleTheme={() => setTheme(p => p === 'light' ? 'dark' : 'light')} />
      
      <main className="flex-grow w-full px-4 sm:px-6 py-6 md:py-10 mt-16 md:mt-20 flex flex-col gap-4 md:gap-6 max-w-[2400px] mx-auto font-light">
        {error && <div className="max-w-4xl mx-auto w-full"><ErrorAlert message={error} /></div>}
        
        <div className="w-full max-w-4xl mx-auto"><ModeSelector currentMode={mode} onModeChange={handleModeChange} /></div>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 auto-rows-min h-full">
            <div className="xl:col-span-3 flex flex-col gap-4 order-2 xl:order-1">
                <div className="bg-light-card dark:bg-dark-card rounded-md border-[0.5px] border-white/10 dark:border-white/10 overflow-hidden flex flex-col h-full xl:max-h-[88vh]">
                    <div className="p-5 border-b-[0.5px] border-dark-text/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex justify-between items-center">
                        <h2 className="text-[10px] font-extralight text-dark-text/40 dark:text-white/40 uppercase tracking-[0.5em] italic">Atelier Metadata</h2>
                        <div className="flex gap-2">
                             <button onClick={handleExportProject} className="p-1 opacity-30 hover:opacity-100 transition-opacity" title="Export Current State"><DownloadIcon className="w-3 h-3 text-dark-text dark:text-white"/></button>
                             <button onClick={() => jsonInputRef.current?.click()} className="p-1 opacity-30 hover:opacity-100 transition-opacity" title="Import Project"><UploadIcon className="w-3 h-3 text-dark-text dark:text-white"/></button>
                             <input type="file" ref={jsonInputRef} onChange={handleImportProject} accept=".json" className="hidden" />
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto custom-scrollbar max-h-[600px] xl:max-h-none">
                        {mode === 'edit' && (
                            <div className="flex flex-col">
                                <div className="p-4 border-b-[0.5px] border-dark-text/5 dark:border-white/5">
                                    <div className="flex justify-between items-center mb-4 px-1">
                                        <h3 className="text-[9px] font-extralight text-dark-text/20 dark:text-white/20 uppercase tracking-[0.4em]">Active Project</h3>
                                        {masterSourceImage && (
                                            <button onClick={handleRevert} className="text-[8px] font-black text-red-500 uppercase tracking-widest hover:underline">Full Revert</button>
                                        )}
                                    </div>
                                    {!originalImage ? (
                                        <ImageUploader onImageUpload={(f) => handleInitialUpload(f, 'edit')} />
                                    ) : (
                                        <div className="p-2 bg-black/5 dark:bg-black/20 rounded-md border border-dark-text/5 dark:border-white/5">
                                            <p className="text-[10px] font-bold text-dark-text/40 dark:text-white/40 uppercase tracking-widest text-center py-4">Image loaded into stage</p>
                                            <button onClick={() => { setOriginalImage(null); setMasterSourceImage(null); setMasterMaskImage(null); }} className="w-full py-2 bg-red-500/10 text-red-500 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Clear Base</button>
                                        </div>
                                    )}
                                </div>

                                {markupHistory.length > 0 && (
                                    <div className="p-4 border-b-[0.5px] border-dark-text/5 dark:border-white/5 bg-brand-red/5">
                                        <div className="flex justify-between items-center mb-4 px-1">
                                            <div className="flex items-center gap-2">
                                                <HistoryIcon className="w-3 h-3 text-brand-red opacity-60" />
                                                <h3 className="text-[9px] font-black text-brand-red uppercase tracking-[0.3em]">Blueprint Archive</h3>
                                            </div>
                                            <button onClick={() => setMarkupHistory([])} className="text-[8px] font-bold text-dark-text/20 dark:text-white/20 hover:text-red-500 transition-colors uppercase tracking-widest">Clear</button>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                            {markupHistory.map(entry => (
                                                <div key={entry.id} className="relative flex-shrink-0 w-20 aspect-square group">
                                                    <button 
                                                        onClick={() => restoreBlueprint(entry)}
                                                        className="w-full h-full rounded-md overflow-hidden border border-dark-text/10 dark:border-white/10 hover:border-brand-red/50 hover:scale-[1.05] transition-all"
                                                        title={entry.mask === null ? "Recal clean baseline" : `Recal blueprint from ${new Date(entry.timestamp).toLocaleTimeString()}`}
                                                    >
                                                        <img src={entry.image.dataUrl} className="w-full h-full object-cover" />
                                                        {entry.mask === null && (
                                                            <div className="absolute top-1 right-1 px-1 bg-black/60 rounded text-[6px] text-white font-black uppercase tracking-tighter">Baseline</div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                                                            <UndoIcon className="w-4 h-4 text-brand-red" />
                                                        </div>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4">
                                    <h3 className="text-[9px] font-extralight text-dark-text/20 dark:text-white/20 uppercase tracking-[0.4em] mb-4 px-1">Reference Pool</h3>
                                    <ReferenceImageUploader 
                                        referenceImages={editReferenceImages} 
                                        onReferenceImagesChange={setEditReferenceImages} 
                                        onEditRequest={() => {}} 
                                        onCropRequest={handleReferenceCropRequest} 
                                        advancedRefs={advancedRefs} 
                                        onAdvancedRefsChange={setAdvancedRefs} 
                                        isAdvanced={isAdvancedUploads} 
                                        onToggleAdvanced={setIsAdvancedUploads} 
                                    />
                                </div>
                            </div>
                        )}
                        
                        {mode === 'style' && (
                            <div className="flex flex-col">
                                <div className="p-4 border-b-[0.5px] border-dark-text/5 dark:border-white/5">
                                    <div className="flex justify-between items-center mb-4 px-1">
                                        <h3 className="text-[9px] font-extralight text-dark-text/20 dark:text-white/20 uppercase tracking-[0.4em]">Target Identity</h3>
                                        <button onClick={() => { setLibraryTarget('avatar'); setIsRepositoryModalOpen(true); }} className="text-[8px] font-medium text-brand-red uppercase tracking-widest">Library</button>
                                    </div>
                                    {!avatarImage ? <ImageUploader onImageUpload={(f) => handleInitialUpload(f, 'avatar')} /> : (
                                        <div className="relative group rounded-md overflow-hidden bg-neutral-100 dark:bg-black/20 border-[0.5px] border-dark-text/10 dark:border-white/10 aspect-[3/4] flex justify-center">
                                            <img src={avatarImage.dataUrl} className="h-full w-full object-cover" alt="Identity Preview" />
                                            <button onClick={() => setAvatarImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-xl"><TrashIcon className="w-3.5 h-3.5"/></button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-[9px] font-extralight text-dark-text/20 dark:text-white/20 uppercase tracking-[0.4em] mb-4 px-1">Style Cues</h3>
                                    <ReferenceImageUploader 
                                        referenceImages={referenceImages} 
                                        onReferenceImagesChange={setReferenceImages} 
                                        onEditRequest={() => {}} 
                                        onCropRequest={handleReferenceCropRequest} 
                                        advancedRefs={advancedRefs} 
                                        onAdvancedRefsChange={setAdvancedRefs} 
                                        isAdvanced={isAdvancedUploads} 
                                        onToggleAdvanced={setIsAdvancedUploads} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="xl:col-span-9 grid grid-cols-1 gap-4 auto-rows-min order-1 xl:order-2">
                <div className="bg-light-card dark:bg-dark-card rounded-md border-[0.5px] border-dark-text/10 dark:border-white/10 overflow-hidden min-h-[60vh] md:min-h-[75vh] flex flex-col relative group">
                    <div className="p-3 md:p-5 border-b-[0.5px] border-dark-text/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center z-10">
                         <h2 className="text-[10px] font-extralight text-dark-text/40 dark:text-white/40 uppercase tracking-[0.6em] italic">{mode === 'edit' ? 'Neural Workspace' : 'The Lookbook'}</h2>
                         {editedImage && mode === 'style' && !isLoading && (
                             <button onClick={handleCommit} className="flex items-center gap-3 bg-brand-red text-black px-8 py-3 rounded-md text-xs font-black uppercase tracking-widest shadow-[0_0_50px_rgba(246,239,18,0.5)] animate-pulse hover:scale-[1.05] active:scale-95 transition-all">
                                <CheckCircleIcon className="w-4 h-4" /> Approve New Style
                             </button>
                         )}
                    </div>
                    
                    <div className="flex-grow relative flex items-center justify-center bg-black/10 overflow-hidden">
                        {isLoading && <Spinner message="Computing Neural Patch..." />}
                        {mode === 'edit' ? (
                            <div className="w-full h-full">
                                {originalImage ? (
                                    <EditingWorkspace 
                                        image={originalImage} onMaskUpdate={handleMaskUpdate} onReset={() => { setOriginalImage(null); setMasterSourceImage(null); }} 
                                        onCropRequest={() => {}} resultImage={editedImage} onApprove={handleCommit} onCancelResult={handleCancelResult} onAppendPrompt={handleAppendPrompt}
                                        editSubMode={editSubMode} onEditSubModeChange={setEditSubMode}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-20 gap-6 opacity-20">
                                        <PaintBrushIcon className="w-24 h-24 text-dark-text dark:text-white" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-dark-text dark:text-white">Awaiting Material</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-dark-text/5 dark:bg-white/5 overflow-hidden">
                                <div className="relative flex items-center justify-center bg-black/5 overflow-hidden min-h-[30vh] md:min-h-0">
                                    {avatarImage ? <img src={avatarImage.dataUrl} className="w-full h-full object-contain p-0 opacity-40 grayscale-[0.8]" alt="Source" /> : <div className="opacity-5 uppercase tracking-[1em] text-[10px] font-medium p-4 text-center">Identity Not Set</div>}
                                </div>
                                <div className="relative flex items-center justify-center bg-black/5 overflow-hidden border-t md:border-t-0 md:border-l-[0.5px] border-dark-text/5 dark:border-white/5 min-h-[40vh] md:min-h-0">
                                    <ImageDisplay originalImageUrl={null} editedImageUrl={editedImage} avatarUrl={avatarImage?.dataUrl} referenceImages={referenceImages.map(img => img.dataUrl)} onImageClick={(url) => setZoomedInfo({ url })} onImageEdit={handleCommit} />
                                    {!editedImage && !isLoading && <div className="text-center opacity-5 p-4"><p className="text-[6vw] md:text-[3vw] font-light uppercase tracking-[2em] text-dark-text dark:text-white">Visualizing</p></div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <RealismPanel config={realismConfig} onConfigChange={setRealismConfig} isOpen={isRealismOpen} onToggle={() => { setIsRealismOpen(!isRealismOpen); setIsIdentityLockOpen(false); setIsGarmentLockOpen(false); setIsPoseLockOpen(false); setIsSceneLockOpen(false); }} />
                    <IdentityLockPanel 
                        config={identityConfig} 
                        onConfigChange={setIdentityConfig} 
                        structureImage={structureImage} 
                        onStructureImageChange={setStructureImage} 
                        onStructureCropRequest={handleStructureCropRequest} 
                        textureImage={textureImage} 
                        onTextureImageChange={setTextureImage} 
                        onTextureCropRequest={handleTextureCropRequest} 
                        isOpen={isIdentityLockOpen} 
                        onToggle={() => { setIsIdentityLockOpen(!isIdentityLockOpen); setIsGarmentLockOpen(false); setIsPoseLockOpen(false); setIsSceneLockOpen(false); setIsRealismOpen(false); }} 
                    />
                    <GarmentLockPanel 
                        config={garmentConfig} 
                        onConfigChange={setGarmentConfig} 
                        garmentImages={garmentImages} 
                        onGarmentImagesChange={setGarmentImages} 
                        onGarmentCropRequest={handleGarmentCropRequest}
                        isOpen={isGarmentLockOpen} 
                        onToggle={() => { setIsGarmentLockOpen(!isGarmentLockOpen); setIsIdentityLockOpen(false); setIsPoseLockOpen(false); setIsSceneLockOpen(false); setIsRealismOpen(false); }} 
                    />
                    <PoseLockPanel
                        config={poseLockConfig}
                        onConfigChange={setPoseLockConfig}
                        poseImage={poseLockImage}
                        onPoseImageChange={setPoseLockImage}
                        onPoseCropRequest={handlePoseCropRequest}
                        isOpen={isPoseLockOpen}
                        onToggle={() => { setIsPoseLockOpen(!isPoseLockOpen); setIsIdentityLockOpen(false); setIsGarmentLockOpen(false); setIsSceneLockOpen(false); setIsRealismOpen(false); }}
                    />
                    <span className="text-[10px] font-black uppercase text-dark-text/30 dark:text-white/30 tracking-[0.4em] mb-2 px-1">Consistency & Environmental Engines</span>
                    <SceneLockPanel 
                        config={sceneLockConfig} 
                        onConfigChange={setSceneLockConfig} 
                        sceneLockImage={sceneLockImage} 
                        onSceneLockImageChange={setSceneLockImage} 
                        onSceneCropRequest={handleSceneCropRequest}
                        isOpen={isSceneLockOpen} 
                        onToggle={() => { setIsSceneLockOpen(!isSceneLockOpen); setIsIdentityLockOpen(false); setIsGarmentLockOpen(false); setIsPoseLockOpen(false); setIsRealismOpen(false); }} 
                    />
                </div>

                <div className="bg-light-card dark:bg-dark-card rounded-md border-[0.5px] border-dark-text/10 dark:border-white/10 p-5 md:p-10 space-y-8 md:space-y-10">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center lg:items-start w-full gap-8">
                            <h3 className="text-[10px] font-extralight uppercase text-dark-text/30 dark:text-white/30 tracking-[0.5em] pb-3 border-b border-dark-text/5 dark:border-white/5 w-full">Precision Core Calibration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 w-full">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-dark-text/30 dark:text-white/30 tracking-widest pl-1">Neural Core</span>
                                    <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-lg border-[0.5px] border-gray-200 dark:border-white/5">
                                        <button onClick={() => setImageModel('gemini-2.5-flash-image')} className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-md transition-all ${imageModel === 'gemini-2.5-flash-image' ? 'bg-white dark:bg-white/5 text-brand-red shadow-lg' : 'text-gray-400 dark:text-white/20 hover:text-dark-text dark:hover:text-white/60'}`}>Flash</button>
                                        <button onClick={async () => { setImageModel('gemini-3-pro-image-preview'); await ensureApiKey(); }} className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-md transition-all ${imageModel === 'gemini-3-pro-image-preview' ? 'bg-white dark:bg-white/5 text-brand-red shadow-lg' : 'text-gray-400 dark:text-white/20 hover:text-dark-text dark:hover:text-white/60'}`}>Pro</button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-dark-text/30 dark:text-white/30 tracking-widest pl-1">Framing Protocol</span>
                                    <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-md border-[0.5px] border-gray-200 dark:border-white/5 relative items-center">
                                        <select 
                                            value={aspectRatio} 
                                            onChange={(e) => setAspectRatio(e.target.value as any)} 
                                            className="w-full bg-transparent text-[9px] font-black uppercase tracking-widest px-4 py-2.5 outline-none cursor-pointer rounded-md text-dark-text dark:text-white/80 appearance-none scrollbar-thin scrollbar-thumb-brand-red z-10"
                                        >
                                            {Object.entries(RATIO_GROUPS).map(([group, options]) => (
                                                <optgroup key={group} label={group} className="bg-white dark:bg-neutral-900 text-brand-red">
                                                    {options.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-neutral-900 text-dark-text dark:text-white">{opt}</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 pointer-events-none text-gray-400 dark:text-white/20">
                                            <ChevronRightIcon className="w-3 h-3 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex flex-col gap-2 transition-all duration-500 ${imageModel === 'gemini-3-pro-image-preview' ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-1 pointer-events-none'}`}>
                                    <span className="text-[9px] font-black uppercase text-dark-text/30 dark:text-white/30 tracking-widest pl-1">Scale Protocol</span>
                                    <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-md border-[0.5px] border-gray-200 dark:border-white/5 shadow-inner">
                                        <button onClick={() => setResolution('1K')} className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-md transition-all ${resolution === '1K' ? 'bg-white dark:bg-white/10 text-brand-red shadow-lg ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-400 dark:text-white/20 hover:text-dark-text dark:hover:text-white/60'}`}>1K</button>
                                        <button onClick={() => setResolution('2K')} className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-md transition-all ${resolution === '2K' ? 'bg-white dark:bg-white/10 text-brand-red shadow-lg ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-400 dark:text-white/20 hover:text-dark-text dark:hover:text-white/60'}`}>2K</button>
                                        <button onClick={() => setResolution('4K')} className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-md transition-all ${resolution === '4K' ? 'bg-white dark:bg-white/10 text-brand-red shadow-lg ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-400 dark:text-white/20 hover:text-dark-text dark:hover:text-white/60'}`}>4K</button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-dark-text/30 dark:text-white/30 tracking-widest pl-1">Safety Policy</span>
                                    <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-md border-[0.5px] border-gray-200 dark:border-white/5 relative items-center">
                                        <select 
                                            value={safetyLevel} 
                                            onChange={(e) => setSafetyLevel(e.target.value as any)} 
                                            className="w-full bg-transparent text-[9px] font-black uppercase tracking-widest px-4 py-2.5 outline-none cursor-pointer rounded-md text-dark-text dark:text-white/80 appearance-none z-10"
                                        >
                                            <option value="BLOCK_LOW_AND_ABOVE" className="bg-white dark:bg-neutral-900 text-dark-text dark:text-white">Strict</option>
                                            <option value="BLOCK_MEDIUM_AND_ABOVE" className="bg-white dark:bg-neutral-900 text-dark-text dark:text-white">Standard</option>
                                            <option value="BLOCK_ONLY_HIGH" className="bg-white dark:bg-neutral-900 text-dark-text dark:text-white">Permissive</option>
                                            <option value="BLOCK_NONE" className="bg-white dark:bg-neutral-900 text-red-500 font-bold">Unfiltered</option>
                                        </select>
                                        <div className="absolute right-3 pointer-events-none text-gray-400 dark:text-white/20">
                                            <ChevronRightIcon className="w-3 h-3 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-dark-text/30 dark:text-white/30 tracking-widest pl-1">Generation Seed</span>
                                    <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-md border-[0.5px] border-gray-200 dark:border-white/5 relative items-center">
                                        <div className="absolute left-3 pointer-events-none text-[8px] font-black text-gray-400 dark:text-white/20 uppercase">ID</div>
                                        <input 
                                            type="text"
                                            value={curationSeed}
                                            onChange={(e) => setCurationSeed(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="Random"
                                            className="w-full bg-transparent text-[9px] font-mono font-black tracking-widest px-8 py-2.5 outline-none rounded-md text-dark-text dark:text-white/80"
                                        />
                                        <button 
                                            onClick={() => setCurationSeed('')}
                                            title="Randomize"
                                            className={`absolute right-2 p-1.5 rounded-md transition-all ${!curationSeed ? 'text-brand-red opacity-100' : 'text-gray-400 dark:text-white/20 hover:text-brand-red'}`}
                                        >
                                            <RefreshIcon className={`w-3.5 h-3.5 ${!curationSeed ? 'animate-spin-slow' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase text-dark-text/30 dark:text-white/30 tracking-[0.4em]">Input & Global Overrides</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleClearPromptAndConfig} 
                                    className="flex items-center gap-2 px-4 py-2 rounded-md transition-all border border-gray-200 dark:border-white/10 text-gray-400 hover:border-red-500 hover:text-red-500 font-black text-[10px] uppercase tracking-widest"
                                    title="Reset Prompt and Config"
                                >
                                    <TrashIcon className="w-4 h-4" /> Reset Logic
                                </button>
                                <button onClick={() => setIsPromptBuilderOpen(!isPromptBuilderOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all border font-black text-[10px] uppercase tracking-widest ${isPromptBuilderOpen ? 'bg-brand-red text-black border-brand-red' : 'bg-transparent text-gray-400 dark:text-white/40 border-gray-200 dark:border-white/10 hover:border-brand-red hover:text-brand-red-dark dark:hover:text-white'}`}>
                                    <SlidersIcon className="w-4 h-4" /> Prompt Engineer
                                </button>
                            </div>
                        </div>
                        <PromptInput value={prompt} onChange={setPrompt} zonePrompts={zonePrompts} onZonePromptChange={handleZonePromptChange} />
                        <PromptBuilder isOpen={isPromptBuilderOpen} onClose={() => setIsPromptBuilderOpen(false)} config={promptConfig} onConfigChange={setPromptConfig} />
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <ActionButtons onEdit={handleSubmit} editedImageUrl={editedImage} isEditing={isLoading} canEdit={!isLoading && isCurationReady} mode={mode} />
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 pb-20 order-3">
            <div className="bg-light-card dark:bg-dark-card rounded-md border-[0.5px] border-dark-text/10 dark:border-white/10 p-5 md:p-10 overflow-hidden shadow-2xl">
                <HistoryPanel 
                    history={showFavorites ? history.filter(h => h.favorite) : history} totalHistoryCount={history.length} favoritesCount={history.filter(h => h.favorite).length} activeHistoryId={activeHistoryId} selectedHistoryIds={selectedHistoryIds} showFavorites={showFavorites}
                    onSelect={id => { const item = history.find(h => h.id === id); if(!item) return; setActiveHistoryId(id); setPrompt(item.prompt); setEditedImage(item.editedImage); if(item.seed) setCurationSeed(item.seed.toString()); if(item.safetyLevel) setSafetyLevel(item.safetyLevel); if(item.resolution) setResolution(item.resolution); if(item.model) setImageModel(item.model); }} 
                    onDelete={id => setHistory(history.filter(h => h.id !== id))} onClear={() => setHistory([])} onBulkDownload={() => {}} onToggleSelection={() => {}} onSelectAll={() => {}} onDeleteSelected={() => {}} onToggleFavorite={id => setHistory(history.map(h => h.id === id ? { ...h, favorite: !h.favorite } : h))} onToggleShowFavorites={() => setShowFavorites(!showFavorites)} 
                    onZoomRequest={id => { const entry = history.find(h => h.id === id); if(entry) setZoomedInfo({ history, startIndex: history.indexOf(entry) }); }}
                />
            </div>
        </div>
      </main>

      {zoomedInfo && <ZoomViewer info={zoomedInfo} onClose={() => setZoomedInfo(null)} />}
      {croppingConfig && (
          <AdvancedImageCropper 
            imageUrl={croppingConfig.imageUrl} 
            mimeType={croppingConfig.mimeType} 
            onSave={croppingConfig.onSave} 
            onClose={() => setCroppingConfig(null)} 
            defaultAspectRatio={croppingConfig.aspect}
          />
      )}
      <RepositoryModal isOpen={isRepositoryModalOpen} onClose={() => setIsRepositoryModalOpen(false)} onSelectImage={handleSelectFromRepository} />
      
      <PromptGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} onGenerate={async (intent) => {
        setIsGeneratingConfig(true); 
        try { 
            const r = await generatePromptConfiguration(avatarImage || originalImage, referenceImages, intent); 
            setGeneratedConfigData({ prompt: r.mainPrompt, config: r.config }); 
        } catch (e) { handleApiError(e); } finally { setIsGeneratingConfig(false); }
      }} isGenerating={isGeneratingConfig} generatedData={generatedConfigData} onAccept={(p, c) => { setPrompt(p); setPromptConfig(c); setIsGeneratorOpen(false); setIsPromptBuilderOpen(true); }} />
    </div>
  );
}
