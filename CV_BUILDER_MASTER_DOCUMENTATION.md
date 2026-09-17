# JobNews.lk Smart CV Builder - Project Documentation 📄🎨

**System Version:** 2.0  
**Last Updated:** September 18, 2026  
**Target Page:** `/create-cv` (`src/pages/CvBuilder.tsx`)  

---

## 📌 Feature Summary & Architecture

### 1. Photo Protection & Canvas Repositioning
- **Default Mode (`photoFit: 'contain'`)**: 100% full uncropped image display preventing head, hair, face, or shoulder cut-offs.
- **Crop Mode (`photoFit: 'cover'`)**: Optional full box crop fill mode.
- **Interactive Drag & Drop**: Mouse handlers (`handlePhotoMouseDown`, `handlePhotoMouseMove`, `handlePhotoMouseUp`) for centering and positioning.
- **Sliders & Shapes**: Zoom (100-200%), X & Y offsets (-60 to +60), and Frame Shapes (`rounded`, `circle`, `square`).

### 2. Dynamic Theme Colors (`PRESET_COLORS`)
- Preset Swatches:
  - `Royal Deep Blue`: `#1b2b65`
  - `Emerald Green`: `#047857`
  - `Slate Charcoal`: `#1e293b`
  - `Royal Indigo`: `#3b82f6`
  - `Crimson Red`: `#9f1239`
- Dynamic binding via `style={{ backgroundColor: cv.themeColor }}` and `style={{ color: cv.themeColor }}` across all 4 templates.

### 3. Templates Included
1. `executive` (Richard Sanchez Style)
2. `fresher` (Francisco Andrade Style with 8-dot skill ratings)
3. `srilankan` (Mariana Anderson Style)
4. `classic` (Donna Stroupe Style)

### 4. Client Auto-Save & PDF Export
- Auto-saves all input state to `localStorage` key `jobnews_cv_builder_data`.
- Print CSS optimized for A4 single/multi-page PDF downloads (`window.print()`).

---

## 🛠️ Verification & Status
- **TypeScript:** 0 Errors (`npx tsc --noEmit`)
- **Vite Production Build:** Success (`npm run build`)
