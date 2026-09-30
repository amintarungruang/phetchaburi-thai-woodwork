'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Star, ArrowLeft, ArrowRight, Loader2, ImagePlus, AlertCircle } from 'lucide-react';

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  maxImages?: number;
}

// Helper to compress and downscale images client-side
function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
      reader.onerror = () => resolve({ blob: file, dataUrl: '' });
      reader.readAsDataURL(file);
      return;
    }

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      canvas.toBlob(
        (blob) => {
          resolve({ blob: blob || file, dataUrl });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

export default function MultiImageUploader({
  images,
  onChange,
  maxFiles = 10,
  maxImages,
}: MultiImageUploaderProps) {
  const limit = maxImages || maxFiles;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);

    // Check maximum total images
    if (images.length + files.length > limit) {
      setErrorMessage(`สามารถอัปโหลดรูปภาพได้สูงสุด ${limit} รูป (ปัจจุบันมี ${images.length} รูป)`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);

    try {
      // 1. Client-side compress images to prevent oversized payload
      const compressedList = await Promise.all(
        Array.from(files).map((f) => compressImage(f))
      );

      // 2. Try server upload first
      const formData = new FormData();
      compressedList.forEach((item, i) => {
        const originalFile = files[i];
        const ext = originalFile.type === 'image/png' ? 'png' : 'jpg';
        const safeName = `img-${Date.now()}-${i}.${ext}`;
        formData.append('files', item.blob, safeName);
      });

      let uploadedUrls: string[] = [];
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.urls && data.urls.length > 0) {
            uploadedUrls = data.urls;
          }
        }
      } catch (networkErr) {
        console.warn('Server upload request failed, using client data URL fallback:', networkErr);
      }

      // 3. Fallback: if server did not return URLs (e.g. read-only filesystem or network issue), use compressed data URLs
      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      } else {
        const fallbackUrls = compressedList.map((c) => c.dataUrl).filter(Boolean);
        if (fallbackUrls.length > 0) {
          onChange([...images, ...fallbackUrls]);
        } else {
          throw new Error('ไม่สามารถประมวลผลไฟล์รูปภาพได้');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    onChange(reordered);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    onChange(reordered);
  };

  const handleRemove = (index: number) => {
    const removedUrl = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange(filtered);

    // Optional server delete if uploaded locally
    if (removedUrl.startsWith('/uploads/projects/')) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: removedUrl }),
      }).catch(console.error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-semibold text-wood-950 text-xs block">
            รูปภาพผลงานทั้งหมด (เลือกได้หลายรูป) *
          </label>
          <span className="text-[11px] text-wood-500">
            รูปแรก (ซ้ายสุด) จะเป็น **รูปหน้าปก (Cover)** ที่แสดงในแคตตาล็อก
          </span>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxFiles}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 text-xs font-bold shadow-xs transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังอัปโหลด...</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-3.5 h-3.5" />
              <span>+ เพิ่มรูปภาพจากเครื่อง</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-wood-300 hover:border-gold-500 rounded-2xl p-6 text-center bg-wood-50/50 hover:bg-wood-50 cursor-pointer transition-colors space-y-2"
        >
          <div className="w-10 h-10 rounded-full bg-wood-200 text-wood-700 flex items-center justify-center mx-auto">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-wood-900">
            คลิกเพื่อเลือกรูปภาพจากคอมพิวเตอร์ของคุณ
          </div>
          <div className="text-[11px] text-wood-500">
            รองรับไฟล์ JPG, JPEG, PNG, WEBP (เลือกได้พร้อมกันหลายไฟล์)
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, idx) => {
            const isCover = idx === 0;
            return (
              <div
                key={url + idx}
                className={`relative group rounded-xl overflow-hidden bg-wood-950 border-2 transition-all ${
                  isCover
                    ? 'border-gold-500 ring-2 ring-gold-400/30'
                    : 'border-wood-200 hover:border-wood-400'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-28 w-full">
                  <Image
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                </div>

                {/* Cover Badge */}
                {isCover ? (
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-gold-500 text-wood-950 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-wood-950" />
                    <span>รูปหน้าปก</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-wood-950/80 hover:bg-gold-500 text-cream-100 hover:text-wood-950 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    ตั้งเป็นรูปปก
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="ลบรูปภาพนี้"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Reordering Controls Bottom Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-wood-950/80 px-2 py-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'left')}
                    className="p-0.5 hover:text-gold-400 disabled:opacity-30"
                    title="เลื่อนซ้าย"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-wood-300">#{idx + 1}</span>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className="p-0.5 hover:text-gold-400 disabled:opacity-30"
                    title="เลื่อนขวา"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
