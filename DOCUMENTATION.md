# SAMSARA Documentation

**SAMSARA** is a cutting-edge AI-powered photo editing application built with React, TypeScript, and the Google Gemini API. It leverages the "Nano Banana" (Gemini 2.5 Flash) and "Nano Banana Pro" (Gemini 3.0 Pro Image) models to provide advanced image manipulation capabilities, including inpainting, style transfer, and scene remixing.

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Getting Started](#getting-started)
3. [User Guide](#user-guide)
    - [Modes](#modes)
    - [Tools & Workspace](#tools--workspace)
    - [Avatar Library](#avatar-library)
    - [History & Management](#history--management)
4. [Technical Architecture](#technical-architecture)
5. [Configuration & Settings](#configuration--settings)
6. [Troubleshooting](#troubleshooting)

---

## Features Overview

*   **AI Inpainting:** Intelligently modify specific parts of an image using a brush mask and text prompt.
*   **Style Transfer:** Apply the aesthetic, lighting, and texture of reference images to a target avatar.
*   **Scene Remix:** Insert objects into scenes with context-aware blending and lighting.
*   **Dual Model Support:** Switch between `Flash` (Fast/Free) and `Pro` (High-Res/Paid) models.
*   **Advanced Editing Tools:** 
    *   Brush/Eraser masking with adjustable size.
    *   Lasso and Rectangle selection tools.
    *   Advanced Image Cropper with standard aspect ratios.
*   **Upscaling:** Upscale generated images to 4K resolution (Pro model feature).
*   **History Management:** Local session history with bulk download, delete, and favorites.
*   **Dark/Light Mode:** Fully responsive UI with theming support.

---

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   A Google Gemini API Key

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env.local` file in the root directory:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run Locally:**
    ```bash
    npm run dev
    ```
    The app will start at `http://localhost:3000`.

---

## User Guide

### Modes

SAMSARA operates in two primary modes:

#### 1. Inpainting Edit (Sparkles Icon)
Used for modifying existing images.
*   **Upload:** Drag & drop or click to upload a base image.
*   **Mask:** Use the brush tool to paint over the area you want to change.
*   **Prompt:** Describe what should fill the masked area.
*   **Generate:** The AI preserves the unmasked area and regenerates the masked region based on your text.

#### 2. Style Transfer (Palette Icon)
This mode has two sub-modes:

*   **Character Style:**
    *   **Input:** Upload an Avatar (or select from the Library) and Reference Images.
    *   **Action:** The AI transfers the style (lighting, texture, clothing style) from the references to the avatar.
*   **Scene Remix:**
    *   **Input:** Upload a Scene Image (background) and an Insert Image (object/person).
    *   **Mask:** Mask the area on the Scene where the object should go.
    *   **Action:** The AI blends the Insert Image into the masked area of the Scene.

### Tools & Workspace

*   **Canvas Navigation:**
    *   Scroll wheel to Zoom.
    *   Hold `Spacebar` + Click & Drag to Pan.
*   **Masking Tools:**
    *   **Brush:** Freehand masking.
    *   **Eraser:** Remove mask.
    *   **Lasso:** Polygon selection tool.
    *   **Rectangle:** Box selection tool.
*   **Crop:** Available for input images and reference images. Supports aspect ratio locking (1:1, 16:9, etc.).

### Avatar Library

Click the **Library** button in Style Transfer mode to access pre-loaded high-quality avatars.
*   **Categories:** Chani, Adel, Weyinimi, Jedidiah.
*   **Sub-boards:** Close-up, Full Body, Action, Lifestyle, etc.
*   *Note:* Images are sourced from Unsplash to ensure high quality and CORS compatibility.

### History & Management

*   **Session History:** All generations are saved temporarily in the bottom panel.
*   **Actions:**
    *   **Select:** Click an item to restore its settings and prompt.
    *   **Download:** Download individual images or bulk download selected items as a ZIP.
    *   **Favorite:** Star images to filter and keep them visible.
    *   **Upscale:** Click the Upscale icon on a result to redraw it in higher resolution.

---

## Technical Architecture

### Core Technologies
*   **Frontend:** React 19, TypeScript, Vite.
*   **Styling:** Tailwind CSS.
*   **Icons:** Lucide React.
*   **AI SDK:** `@google/genai` (Google Gemini SDK).

### Key Components

*   **`App.tsx`**: The main controller. Handles global state, model selection, and orchestrates the API calls.
*   **`services/geminiService.ts`**:
    *   Abstraction layer for the Gemini API.
    *   Handles `generateContent` calls for edits, styling, and remixing.
    *   Manages `GoogleGenAI` client instantiation to ensure fresh API keys are used.
*   **`components/EditingWorkspace.tsx`**:
    *   HTML5 Canvas-based editor.
    *   Handles image rendering, masking logic, coordinate mapping, and zoom/pan transformations.
*   **`components/ReferenceEditor.tsx`**:
    *   Advanced editor for reference images, allowing precise masking and cropping before sending to the API.

### Data Flow
1.  User uploads images -> converted to Base64 data URLs.
2.  User paints mask -> Canvas exports binary mask data.
3.  User clicks Generate -> `App.tsx` gathers state -> calls `geminiService`.
4.  `geminiService` constructs `Part` objects (Text, Image, Mask) -> Sends to Gemini API.
5.  Response -> Extracted Base64 image -> Displayed in `ImageDisplay`.

---

## Configuration & Settings

### Models

*   **Nano Banana (Flash)** (`gemini-2.5-flash-image`):
    *   Fast, efficient, lower cost.
    *   Best for rapid iteration.
*   **Nano Banana (Pro)** (`gemini-3-pro-image-preview`):
    *   High fidelity, supports native 2K/4K output.
    *   **Requirement:** Users must select a paid project API key via the `window.aistudio` interface.

### Advanced Settings

Located in the collapsible panel above the generate button:
*   **Safety Filter:** Adjust blocking thresholds (Strict, Standard, Permissive, Off).
*   **Resolution (Pro only):** Select output size (1K, 2K, 4K).
*   **Seed:** Manually set a seed number for reproducible results.

---

## Troubleshooting

| Issue | Possible Cause | Solution |
| :--- | :--- | :--- |
| **"Permission denied" / 403** | Using Pro model with free key. | Switch to Flash model or select a paid API key in the dialog. |
| **"Failed to load library image"** | CORS restriction. | The app uses a proxy canvas method. Ensure the source URL allows cross-origin access (Unsplash is safe). |
| **Image is black/empty** | Safety filter triggered. | Check "Advanced Settings" and lower the Safety Filter level. |
| **Canvas drawing is offset** | Browser zoom level. | Ensure browser zoom is 100% or refresh the page to recalibrate canvas coordinates. |
