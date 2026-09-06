import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { compressImage } from '../lib/imageCompress';
import { supabase } from '../lib/supabase';

interface FileUploadProps {
  bucket: string;
  folder?: string;
  accept?: string;
  multiple?: boolean;
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  required?: boolean;
  error?: string;
  maxFiles?: number;
}

export default function FileUpload({
  bucket,
  folder = 'uploads',
  accept = '*',
  multiple = false,
  compress = false,
  maxWidth = 1600,
  maxHeight = 1600,
  value,
  onChange,
  label,
  required,
  error,
  maxFiles = 10,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const fileArray = Array.from(files).slice(0, maxFiles - value.length);
      if (fileArray.length === 0) return;

      setUploadErrors([]);
      const newUrls: string[] = [];
      const newUploading: string[] = [];

      for (const file of fileArray) {
        const key = file.name;
        newUploading.push(key);
        setUploading((prev) => [...prev, key]);
        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
      }

      for (const file of fileArray) {
        const key = file.name;
        try {
          let uploadFile: File | Blob = file;

          if (compress && file.type.startsWith('image/')) {
            setUploadProgress((prev) => ({ ...prev, [key]: 20 }));
            const { blob } = await compressImage(file, { maxWidth, maxHeight });
            uploadFile = blob;
            setUploadProgress((prev) => ({ ...prev, [key]: 50 }));
          } else {
            setUploadProgress((prev) => ({ ...prev, [key]: 50 }));
          }

          const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
          const rawName = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
          const cleanName = rawName
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[\s\(\)\[\]]+/g, '-')
            .replace(/-+/g, '-');
          const safeName = `${cleanName || 'file'}${ext.toLowerCase()}`;
          const filePath = `${folder}/${Date.now()}-${safeName}`;
          const { error: upError } = await supabase.storage.from(bucket).upload(filePath, uploadFile);
          if (upError) throw upError;

          setUploadProgress((prev) => ({ ...prev, [key]: 80 }));
          const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            newUrls.push(publicUrlData.publicUrl);
          }
          setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
        } catch (err) {
          setUploadErrors((prev) => [...prev, `${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`]);
        }
      }

      if (newUrls.length > 0) {
        onChange(multiple ? [...value, ...newUrls] : newUrls);
      }
      setUploading([]);
      setUploadProgress({});
    },
    [bucket, folder, compress, maxWidth, maxHeight, multiple, maxFiles, value, onChange]
  );

  const removeFile = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  const isImage = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].split('#')[0];
    return (
      !!cleanUrl.match(/\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i) ||
      url.startsWith('data:image') ||
      url.includes('/job-images/') ||
      url.includes('/images/')
    );
  };

  const isPdf = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].split('#')[0];
    return !!cleanUrl.match(/\.pdf$/i) || url.includes('/pdf/') || url.includes('/job-pdfs/');
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading.length > 0 ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-slate-600 font-medium">Uploading files...</p>
            {uploading.map((name) => (
              <div key={name} className="flex items-center gap-2 max-w-xs mx-auto">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${uploadProgress[name] || 0}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{uploadProgress[name] || 0}%</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">
              {isDragging ? 'Drop files here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {compress ? 'Images will be compressed automatically' : 'Supported: images, PDFs'}
            </p>
          </>
        )}
      </div>

      {/* Upload errors */}
      {uploadErrors.length > 0 && (
        <div className="space-y-1">
          {uploadErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">{err}</p>
          ))}
        </div>
      )}

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, idx) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50"
            >
              {isImage(url) ? (
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : isPdf(url) ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-3">
                  <FileText className="w-8 h-8 text-red-500 mb-1" />
                  <span className="text-xs text-slate-500 text-center truncate w-full">PDF</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3">
                  <FileText className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500 text-center truncate w-full">File</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(url)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {uploadProgress[url] === 100 && (
                <div className="absolute bottom-1 right-1 p-0.5 bg-emerald-500 text-white rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
