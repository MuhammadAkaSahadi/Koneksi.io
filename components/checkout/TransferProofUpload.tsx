"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface TransferProofUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function TransferProofUpload({ value, onChange, disabled }: TransferProofUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URL when file changes
  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);

      // Cleanup old preview URL
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return "Hanya file gambar (PNG/JPG) yang diperbolehkan";
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return "Ukuran file maksimal 2MB";
    }

    return null;
  };

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      onChange(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {!value ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging
              ? "border-primary bg-primary/5"
              : "border-slate-300 hover:border-primary hover:bg-slate-50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-slate-100">
              <Upload className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {isDragging ? "Lepaskan file di sini" : "Upload Bukti Transfer"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Klik atau drag & drop file di sini
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG atau JPG, maksimal 2MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-start gap-4">
            {/* Preview Thumbnail */}
            <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-200">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {value.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatFileSize(value.size)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">
                  Siap diupload
                </span>
              </div>
            </div>

            {/* Remove Button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex-shrink-0 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
