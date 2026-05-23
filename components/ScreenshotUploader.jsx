'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ImagePlus, X, Sparkles } from 'lucide-react';

export default function ScreenshotUploader({ onAnalyzed, isAnalyzing, setIsAnalyzing }) {
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [error, setError] = useState(null);
  const [aiDone, setAiDone] = useState(false);
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setError(null);
    setAiDone(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setPreview(base64);
      setImageBase64(base64);
      analyzeWithAI(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeWithAI = async (base64) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setAiDone(true);
      onAnalyzed(data);
    } catch (err) {
      setError('AI gagal membaca grafik: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setImageBase64(null);
    setAiDone(false);
    setError(null);
  };

  // Handle Ctrl+V paste
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          processFile(file);
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [processFile]);

  // Handle drag & drop
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  };

  const handleClick = () => {
    if (!preview) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  };

  return (
    <div className="glass-card stagger-1">
      <div className="section-title">📸 Screenshot Grafik Mesin</div>

      <div
        ref={dropzoneRef}
        className={`dropzone ${preview ? 'dropzone--has-image' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {isAnalyzing ? (
          <div className="ai-analyzing">
            <div className="ai-spinner" />
            <div className="ai-analyzing-text">ANALYZING TELEMETRY...</div>
          </div>
        ) : preview ? (
          <>
            <div className="dropzone-preview">
              <img src={preview} alt="Performance Graph" />
              <button className="dropzone-clear" onClick={(e) => { e.stopPropagation(); clearImage(); }}>
                <X size={14} />
              </button>
            </div>
            {aiDone && (
              <div className="ai-result-badge">
                <Sparkles size={12} /> AI berhasil membaca grafik
              </div>
            )}
          </>
        ) : (
          <>
            <div className="dropzone-icon"><ImagePlus size={40} strokeWidth={1.2} /></div>
            <div className="dropzone-title">Paste atau Upload Screenshot</div>
            <div className="dropzone-sub">
              Tekan <span className="dropzone-kbd">Ctrl</span> + <span className="dropzone-kbd">V</span> untuk paste, 
              atau klik di sini untuk upload gambar grafik Performance dari game.
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--color-danger)' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
