'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Heart, 
  Share2, 
  Calendar, 
  User, 
  Pin, 
  Video as VideoIcon, 
  Image as ImageIcon, 
  Facebook as FacebookIcon, 
  ExternalLink, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  ZoomIn
} from 'lucide-react';
import { FactoryPost } from '@/types';
import RichTextRenderer from './RichTextRenderer';
import { useLanguage } from '@/context/LanguageContext';

interface PostDetailModalProps {
  post: FactoryPost | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (postId: string) => void;
  isLiked?: boolean;
}

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onLike,
  isLiked = false,
}: PostDetailModalProps) {
  const { t, isEn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'video' | 'photo'>('video');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Extract YouTube ID if applicable
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : null;
  };

  const hasVideo = !!post?.video_url;
  const hasPhotos = !!(post?.media_urls && post.media_urls.length > 0);
  const youtubeEmbed = getYouTubeEmbedUrl(post?.video_url);
  const isDirectVideo = post?.video_url && !youtubeEmbed;

  // Set default active tab when post opens
  useEffect(() => {
    if (post) {
      setActivePhotoIdx(0);
      setIsLightboxOpen(false);
      if (hasVideo) {
        setActiveTab('video');
      } else {
        setActiveTab('photo');
      }
    }
  }, [post?.id, hasVideo]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
      if (isOpen && activeTab === 'photo' && post?.media_urls && post.media_urls.length > 1) {
        if (e.key === 'ArrowLeft') {
          setActivePhotoIdx((prev) => (prev - 1 + post.media_urls.length) % post.media_urls.length);
        }
        if (e.key === 'ArrowRight') {
          setActivePhotoIdx((prev) => (prev + 1) % post.media_urls.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLightboxOpen, onClose, activeTab, post?.media_urls]);

  if (!isOpen || !post) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.caption.slice(0, 100),
          url: typeof window !== 'undefined' ? `${window.location.origin}#feed` : '',
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(
        typeof window !== 'undefined' ? `${window.location.origin}#feed` : ''
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const photos = post.media_urls || [];
  const currentPhoto = photos[activePhotoIdx] || photos[0];

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E8DFD5] shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Modal Header */}
          <div className="p-4 sm:p-5 bg-[#2D1B0E] text-white flex items-center justify-between shrink-0 border-b border-[#4A2D17]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C59139] text-[#2D1B0E] flex items-center justify-center font-bold shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>{post.author_name || (isEn ? 'Master S (Factory Owner)' : 'ช่างเอส (เจ้าของโรงงาน)')}</span>
                  <span className="w-4 h-4 rounded-full bg-[#C59139] text-[#2D1B0E] text-[10px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <div className="text-[11px] text-[#E8C581] flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C59139]" />
                    <span>
                      {new Date(post.published_at).toLocaleDateString(isEn ? 'en-US' : 'th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </span>
                  {post.pin_to_top && (
                    <span className="bg-[#C59139] text-[#2D1B0E] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Pin className="w-2.5 h-2.5 fill-current" />
                      <span>{isEn ? 'Pinned' : 'ปักหมุด'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* 1. Media Section */}
            {(hasVideo || hasPhotos) && (
              <div className="space-y-3">
                {/* Media Switcher Tabs if BOTH video & photos exist */}
                {hasVideo && hasPhotos && (
                  <div className="flex items-center justify-center gap-2 bg-[#FAF5EE] p-1.5 rounded-2xl border border-[#E8DFD5] w-fit mx-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('video')}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                        activeTab === 'video'
                          ? 'bg-[#2D1B0E] text-white shadow-sm'
                          : 'text-[#6B5745] hover:text-[#2D1B0E]'
                      }`}
                    >
                      <VideoIcon className="w-4 h-4 text-red-500" />
                      <span>{isEn ? 'Video' : 'คลิปวิดีโอ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('photo')}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                        activeTab === 'photo'
                          ? 'bg-[#2D1B0E] text-white shadow-sm'
                          : 'text-[#6B5745] hover:text-[#2D1B0E]'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-[#C59139]" />
                      <span>{isEn ? `Photos (${photos.length})` : `อัลบั้มรูปภาพ (${photos.length} รูป)`}</span>
                    </button>
                  </div>
                )}

                {/* View A: Video Player */}
                {hasVideo && activeTab === 'video' && (
                  <div className="relative w-full h-[280px] sm:h-[380px] md:h-[440px] rounded-2xl overflow-hidden bg-black shadow-lg border border-[#E8DFD5]">
                    {youtubeEmbed ? (
                      <iframe
                        src={youtubeEmbed}
                        title={post.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : isDirectVideo ? (
                      <video
                        src={post.video_url}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        poster={photos[0]}
                      />
                    ) : null}
                  </div>
                )}

                {/* View C: Facebook Live Embed if only Facebook Post */}
                {!hasVideo && !hasPhotos && post.facebook_post_url && (
                  <div className="w-full bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5] overflow-hidden flex items-center justify-center p-2 min-h-[420px]">
                    <iframe
                      src={
                        post.facebook_post_url.includes('plugins/post.php') || post.facebook_post_url.includes('plugins/video.php')
                          ? post.facebook_post_url
                          : post.facebook_post_url.includes('/videos/') || post.facebook_post_url.includes('/reel/') || post.facebook_post_url.includes('/watch')
                          ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(post.facebook_post_url)}&show_text=true&width=500&t=0`
                          : `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(post.facebook_post_url)}&show_text=true&width=500`
                      }
                      width="100%"
                      height="500"
                      style={{ border: 'none', overflow: 'hidden' }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      className="w-full min-h-[460px] max-w-[500px] mx-auto"
                    />
                  </div>
                )}

                {/* View B: High-Res Photo Gallery Viewer */}
                {hasPhotos && (activeTab === 'photo' || !hasVideo) && (
                  <div className="space-y-3">
                    {/* Main Big Photo Frame */}
                    <div className="relative w-full h-[360px] sm:h-[480px] md:h-[560px] rounded-2xl overflow-hidden bg-[#1A110B] shadow-lg border border-[#E8DFD5] flex items-center justify-center group">
                      {currentPhoto ? (
                        <Image
                          src={currentPhoto}
                          alt={`${post.title} - รูปที่ ${activePhotoIdx + 1}`}
                          fill
                          className="object-contain transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-white text-xs">ไม่พบรูปภาพ</div>
                      )}

                      {/* Zoom & Lightbox Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-colors z-20"
                        title="คลิกเพื่อขยายรูปใหญ่เต็มจอ"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>คลิกขยายรูปใหญ่</span>
                      </button>

                      {/* Previous / Next Arrow Controls */}
                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all shadow-lg z-20 active:scale-95"
                            title="รูปก่อนหน้า"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIdx((prev) => (prev + 1) % photos.length);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all shadow-lg z-20 active:scale-95"
                            title="รูปถัดไป"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>

                          {/* Index Indicator */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md z-20">
                            รูปที่ {activePhotoIdx + 1} จากทั้งหมด {photos.length} รูป
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Strip Selector */}
                    {photos.length > 1 && (
                      <div className="p-2 bg-[#FAF5EE] rounded-2xl border border-[#E8DFD5]">
                        <div className="text-[11px] font-semibold text-[#8C735A] mb-1.5 px-1 flex items-center justify-between">
                          <span>คลิกเลือกดูภาพด้านล่าง:</span>
                          <span className="text-[#C59139]">{activePhotoIdx + 1}/{photos.length}</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                          {photos.map((photoUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setActivePhotoIdx(pIdx)}
                              className={`relative w-20 sm:w-24 h-16 sm:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                                activePhotoIdx === pIdx
                                  ? 'border-[#C59139] ring-2 ring-[#C59139]/40 scale-102 shadow-md'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <Image src={photoUrl} alt={`Thumbnail ${pIdx + 1}`} fill className="object-cover" />
                              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                                {pIdx + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. Post Title */}
            <h2 className="font-bold text-xl sm:text-2xl md:text-3xl text-[#2D1B0E] font-serif leading-snug">
              {post.title}
            </h2>

            {/* 3. Full Rich Text Caption */}
            <div className="bg-[#FAF7F2] p-5 sm:p-7 rounded-3xl border border-[#E8DFD5]">
              <RichTextRenderer content={post.caption} className="text-sm sm:text-base leading-relaxed" />
            </div>

            {/* 4. Optional Facebook Link */}
            {post.facebook_post_url && (
              <div className="p-4 sm:p-5 bg-blue-50/70 rounded-2xl border border-[#1877F2]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 text-[#1877F2]">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold shadow-xs">
                    <FacebookIcon className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#2D1B0E]">
                      โพสต์นี้เชื่อมโยงกับเพจ เสี่ยธนท์ ฝาทรงไทย
                    </div>
                    <div className="text-xs text-[#5C4A3A]">
                      สามารถเปิดดูโพสต์ต้นฉบับและแสดงความคิดเห็นบน Facebook ได้
                    </div>
                  </div>
                </div>
                <a
                  href={post.facebook_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
                >
                  <FacebookIcon className="w-4 h-4 fill-current" />
                  <span>เปิดอ่านบน Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </a>
              </div>
            )}

            {/* 5. Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-[#FAF5EE] text-[#8C735A] text-xs font-medium px-3 py-1 rounded-xl border border-[#E8DFD5]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Modal Footer Actions */}
          <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E8DFD5] flex items-center justify-between shrink-0">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => onLike && onLike(post.id)}
              className={`flex items-center gap-2 py-2 px-4 rounded-2xl transition-all ${
                isLiked
                  ? 'bg-red-50 text-red-600 font-bold border border-red-200 shadow-xs'
                  : 'bg-white text-[#6B5745] hover:bg-red-50 hover:text-red-600 border border-[#E8DFD5]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600 animate-scale' : ''}`} />
              <span className="text-xs font-semibold">{post.likes_count || 0} ถูกใจ</span>
            </button>

            {/* Share & Close Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 py-2 px-4 rounded-2xl bg-white hover:bg-[#FAF0E1] text-[#2D1B0E] border border-[#E8DFD5] text-xs font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">คัดลอกลิงก์แล้ว!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>แชร์โพสต์</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-2xl bg-[#2D1B0E] hover:bg-[#3D2513] text-white text-xs font-bold transition-colors shadow-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fullscreen Lightbox Modal for Photo Zoom */}
      {isLightboxOpen && currentPhoto && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Controls Top */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-70">
            <span className="text-white/80 text-xs font-medium">
              รูปที่ {activePhotoIdx + 1} จาก {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Fullscreen Photo */}
          <div 
            className="relative w-full h-[80vh] max-w-5xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentPhoto}
              alt="Fullscreen Zoom"
              fill
              className="object-contain"
            />

            {/* Previous/Next in Lightbox */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all shadow-xl"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev + 1) % photos.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all shadow-xl"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
