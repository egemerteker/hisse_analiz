'use client';
import { useCallback, useState } from 'react';
import { Upload, ImageIcon, X, AlertCircle } from 'lucide-react';

interface Props {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onUpload, isLoading }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
      return 'Sadece PNG, JPEG ve WEBP desteklenmektedir.';
    if (file.size > 10 * 1024 * 1024) return 'Dosya boyutu 10MB\'ı aşmamalıdır.';
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClear = () => { setPreview(null); setSelectedFile(null); setError(null); };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
            dragOver
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-slate-600 bg-slate-800/50 hover:border-blue-500/60 hover:bg-slate-800'
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            disabled={isLoading}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-500/20 rounded-full">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-200">Finansal görseli buraya sürükleyin</p>
              <p className="text-sm text-slate-400 mt-1">veya tıklayarak dosya seçin</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {['Hisse Grafiği', 'Bilanço', 'Gelir Tablosu', 'Finansal Özet'].map(t => (
                <span key={t} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">{t}</span>
              ))}
            </div>
            <p className="text-xs text-slate-500">PNG, JPEG, WEBP · Maks 10MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700">
            <img src={preview} alt="Yüklenen görsel" className="w-full max-h-80 object-contain bg-slate-900" />
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-red-500/80 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <ImageIcon className="w-4 h-4" />
              <span>{selectedFile.name}</span>
              <span className="text-slate-600">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
            </div>
          )}
          <button
            onClick={() => selectedFile && onUpload(selectedFile)}
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
              isLoading
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Claude Vision ile analiz ediliyor...
              </span>
            ) : 'Finansal Analiz Başlat'}
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
