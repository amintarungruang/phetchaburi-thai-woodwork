'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Rss, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Facebook as FacebookIcon, 
  Pin, 
  Heart, 
  Share2, 
  ExternalLink, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Check, 
  Sparkles,
  Layers,
  ZoomIn
} from 'lucide-react';
import { getPosts, likePost } from '@/lib/store';
import { FactoryPost } from '@/types';
import RichTextRenderer from './RichTextRenderer';
import FacebookEmbedCard from './FacebookEmbedCard';
import PostDetailModal from './PostDetailModal';
import { useLanguage } from '@/context/LanguageContext';

export default function FactoryFeedSection() {
  const { t, isEn } = useLanguage();
  const [posts, setPosts] = useState<FactoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'photo' | 'facebook'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMediaIndices, setActiveMediaIndices] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [selectedPost, setSelectedPost] = useState<FactoryPost | null>(null);

  const loadPublicPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts(false); // Only public / reached scheduled time
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicPosts();
    window.addEventListener('woodwork_store_updated', loadPublicPosts);
    return () => window.removeEventListener('woodwork_store_updated', loadPublicPosts);
  }, []);

  const handleNextPhoto = (postId: string, total: number) => {
    setActiveMediaIndices((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % total,
    }));
  };

  const handlePrevPhoto = (postId: string, total: number) => {
    setActiveMediaIndices((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + total) % total,
    }));
  };

  const handleLike = async (postId: string) => {
    if (likedPosts[postId]) return; // Already liked this session
    setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    const newCount = await likePost(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: newCount } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => prev ? { ...prev, likes_count: newCount } : null);
    }
  };

  const handleShare = (post: FactoryPost) => {
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
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const [showAllPosts, setShowAllPosts] = useState(false);
  const INITIAL_POST_LIMIT = 6;

  // Filter posts
  const filtered = posts.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'video') return !!p.video_url;
    if (activeFilter === 'photo') return !!(p.media_urls && p.media_urls.length > 0);
    if (activeFilter === 'facebook') return !!p.facebook_post_url;
    return true;
  });

  // Posts to display based on expand/collapse toggle
  const visiblePosts = showAllPosts ? filtered : filtered.slice(0, INITIAL_POST_LIMIT);

  // Helper to strip markdown/HTML tags for preview
  const getCleanSnippet = (text: string, maxLen = 140) => {
    if (!text) return '';
    const clean = text
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .replace(/[*_#`~]/g, '') // remove markdown characters
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length > maxLen ? `${clean.slice(0, maxLen)}...` : clean;
  };

  // Extract YouTube ID if applicable
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0`
      : null;
  };

  return (
    <section id="feed" className="py-16 sm:py-24 bg-[#FAF7F2] border-b border-[#E8DFD5] relative overflow-hidden">
      {/* Background Decorative Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-linear-to-tr from-[#C59139]/8 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0E1] border border-[#C59139]/30 text-[#A87424] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C59139]" />
            <span>{t.feed.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1B0E] font-serif">
            {t.feed.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6450] mt-2 font-light leading-relaxed">
            {t.feed.desc}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('all');
              setShowAllPosts(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all touch-target flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-[#2D1B0E] text-white shadow-md'
                : 'bg-white text-[#6B5745] hover:bg-[#FAF0E1] border border-[#E8DFD5]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C59139]" />
            <span>{t.feed.allTab} ({posts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('photo');
              setShowAllPosts(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all touch-target flex items-center gap-1.5 ${
              activeFilter === 'photo'
                ? 'bg-[#2D1B0E] text-white shadow-md'
                : 'bg-white text-[#6B5745] hover:bg-[#FAF0E1] border border-[#E8DFD5]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C59139]" />
            <span>{isEn ? 'Photos' : 'มีรูปภาพ'} ({posts.filter((p) => p.media_urls && p.media_urls.length > 0).length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('video');
              setShowAllPosts(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all touch-target flex items-center gap-1.5 ${
              activeFilter === 'video'
                ? 'bg-[#2D1B0E] text-white shadow-md'
                : 'bg-white text-[#6B5745] hover:bg-[#FAF0E1] border border-[#E8DFD5]'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5 text-red-500" />
            <span>{isEn ? 'Videos' : 'มีคลิปวิดีโอ'} ({posts.filter((p) => p.video_url).length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('facebook');
              setShowAllPosts(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all touch-target flex items-center gap-1.5 ${
              activeFilter === 'facebook'
                ? 'bg-[#1877F2] text-white shadow-md'
                : 'bg-white text-[#1877F2] hover:bg-blue-50 border border-[#1877F2]/30'
            }`}
          >
            <FacebookIcon className="w-3.5 h-3.5 fill-current" />
            <span>{isEn ? 'Facebook Posts' : 'โพสต์จาก Facebook'} ({posts.filter((p) => p.facebook_post_url).length})</span>
          </button>
        </div>

        {/* Posts Content Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#C59139] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8C735A]">{t.common.loading}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8DFD5] p-12 text-center space-y-3 max-w-lg mx-auto shadow-sm">
            <Rss className="w-10 h-10 text-[#C59139] mx-auto opacity-50" />
            <h3 className="font-bold text-base text-[#2D1B0E]">{t.feed.noPosts}</h3>
            <p className="text-xs text-[#8C735A]">
              {isEn ? 'Choose another filter or check our Facebook page for updates.' : 'เลือกหมวดหมู่อื่น หรือติดตามข่าวสารเพิ่มเติมได้ที่เพจ Facebook ของโรงงานครับ'}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {visiblePosts.map((post) => {
                const activeImgIdx = activeMediaIndices[post.id] || 0;
                const hasPhotos = post.media_urls && post.media_urls.length > 0;
                const hasMultiplePhotos = post.media_urls && post.media_urls.length > 1;
                const youtubeEmbed = getYouTubeEmbedUrl(post.video_url);
                const isDirectVideo = post.video_url && !youtubeEmbed;
                const hasVideo = !!post.video_url;

                // If only Facebook post without custom media
                if (!hasPhotos && !hasVideo && post.facebook_post_url) {
                  return (
                    <div key={post.id} className="relative group h-full flex flex-col">
                      {post.pin_to_top && (
                        <div className="absolute -top-3 left-4 z-20 bg-[#C59139] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>{isEn ? 'Pinned' : 'ปักหมุด'}</span>
                        </div>
                      )}
                      <FacebookEmbedCard
                        facebookPostUrl={post.facebook_post_url}
                        title={post.title}
                        caption={post.caption}
                        previewImage={post.media_urls?.[0]}
                        publishedAt={post.published_at}
                        authorName={post.author_name}
                      />
                    </div>
                  );
                }

                return (
                  <article
                    key={post.id}
                    className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl h-full ${
                      post.pin_to_top
                        ? 'border-[#C59139] ring-2 ring-[#C59139]/20'
                        : 'border-[#E8DFD5]'
                    }`}
                  >
                    <div>
                      {/* Media Container */}
                      <div 
                        onClick={() => setSelectedPost(post)}
                        className="relative h-72 sm:h-84 md:h-96 w-full bg-[#FAF5EE] overflow-hidden cursor-pointer group select-none"
                      >
                        {/* 1. If has Video: Show Video Player */}
                        {hasVideo ? (
                          youtubeEmbed ? (
                            <div className="relative w-full h-full">
                              <iframe
                                src={youtubeEmbed}
                                title={post.title}
                                className="w-full h-full border-0 pointer-events-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : isDirectVideo ? (
                            <div className="relative w-full h-full">
                              <video
                                src={post.video_url}
                                className="w-full h-full object-cover pointer-events-none"
                                poster={post.media_urls?.[0]}
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/90 text-[#2D1B0E] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : null
                        ) : (
                          /* 2. Photo Gallery Carousel */
                          hasPhotos && (
                            <div className="relative w-full h-full">
                              <Image
                                src={post.media_urls[activeImgIdx]}
                                alt={`${post.title} - ${activeImgIdx + 1}`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-103"
                              />

                              {/* Carousel Controls if multiple photos */}
                              {hasMultiplePhotos && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrevPhoto(post.id, post.media_urls.length);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNextPhoto(post.id, post.media_urls.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
                                    {activeImgIdx + 1} / {post.media_urls.length}
                                  </div>
                                </>
                              )}

                              {/* Zoom / Full view indicator */}
                              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity z-10 shadow-xs">
                                <ZoomIn className="w-3.5 h-3.5 text-[#E8C581]" />
                                <span>{isEn ? 'Tap for full view' : 'แตะเพื่อดูรูปเต็ม'}</span>
                              </div>
                            </div>
                          )
                        )}

                        {/* Media Type Badges & Pin ribbon */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                          {post.pin_to_top && (
                            <div className="bg-[#C59139] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <Pin className="w-3 h-3 fill-current" />
                              <span>แนะนำ / ปักหมุด</span>
                            </div>
                          )}
                          {hasVideo && hasPhotos && (
                            <div className="bg-black/70 backdrop-blur-xs text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                              <Layers className="w-3 h-3" />
                              <span>มีทั้งคลิป & {post.media_urls.length} รูป</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* If post has BOTH Video and Photos: Show Photo Strip below video */}
                      {hasVideo && hasPhotos && (
                        <div 
                          onClick={() => setSelectedPost(post)}
                          className="p-2.5 bg-[#FAF5EE] border-b border-[#E8DFD5] cursor-pointer hover:bg-[#FAF0E1] transition-colors"
                        >
                          <div className="text-[11px] font-semibold text-[#8C735A] mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-[#C59139]" />
                              <span>รูปภาพเพิ่มเติม ({post.media_urls.length} ภาพ):</span>
                            </span>
                            <span className="text-[10px] text-[#A87424] font-medium hover:underline">คลิกดูรูปขยายใหญ่ ↗</span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                            {post.media_urls.map((photoUrl, pIdx) => (
                              <div
                                key={pIdx}
                                className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 border border-[#E8DFD5] hover:scale-105 transition-transform"
                              >
                                <Image src={photoUrl} alt={`Photo ${pIdx}`} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Post Meta & Content */}
                      <div className="p-5 sm:p-6 space-y-3">
                        {/* Author & Date */}
                        <div className="flex items-center justify-between text-xs text-[#8C735A] pb-2.5 border-b border-[#F0E6D8]">
                          <span className="font-semibold text-[#2D1B0E] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#C59139]" />
                            <span>{post.author_name || (isEn ? 'Master S (Factory Owner)' : 'ช่างเอส (เจ้าของโรงงาน)')}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-light">
                            <Calendar className="w-3 h-3 text-[#C59139]" />
                            <span>
                              {new Date(post.published_at).toLocaleDateString(isEn ? 'en-US' : 'th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </span>
                        </div>

                        {/* Title (Clickable) */}
                        <h3 
                          onClick={() => setSelectedPost(post)}
                          className="font-bold text-base sm:text-lg text-[#2D1B0E] leading-snug font-serif hover:text-[#C59139] cursor-pointer transition-colors line-clamp-2"
                        >
                          {post.title}
                        </h3>

                        {/* Caption Preview (Clean Plaintext Snippet) */}
                        <div className="text-xs sm:text-sm text-[#5C4A3A] leading-relaxed">
                          <p className="line-clamp-3 font-normal">
                            {getCleanSnippet(post.caption, 160)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedPost(post)}
                            className="text-xs font-semibold text-[#A87424] hover:text-[#8C5D19] underline mt-1.5 inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{t.feed.readMore} ↗</span>
                          </button>
                        </div>

                        {/* Optional Facebook direct button if linked */}
                        {post.facebook_post_url && (
                          <div className="pt-1">
                            <a
                              href={post.facebook_post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#1877F2] font-semibold hover:underline"
                            >
                              <FacebookIcon className="w-3.5 h-3.5 fill-current" />
                              <span>{isEn ? 'View post on Facebook' : 'ดูโพสต์นี้บน Facebook'}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          </div>
                        )}

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2.5 py-0.5 bg-[#FAF5EE] text-[#8C735A] rounded-full border border-[#E8DFD5]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-5 sm:px-6 py-3 bg-[#FAF5EE] border-t border-[#E8DFD5] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all touch-target ${
                          likedPosts[post.id]
                            ? 'text-red-500 bg-red-50 font-bold'
                            : 'text-[#8C735A] hover:text-red-500 hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} />
                        <span>{post.likes_count || 0}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleShare(post)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[#8C735A] hover:text-[#2D1B0E] hover:bg-white transition-all touch-target"
                          title="แชร์โพสต์นี้"
                        >
                          {copiedId === post.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[11px] text-emerald-600 font-bold">{isEn ? 'Copied' : 'คัดลอกแล้ว'}</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{isEn ? 'Share' : 'แชร์'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Expand / Collapse Control Button */}
            {filtered.length > INITIAL_POST_LIMIT && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowAllPosts(!showAllPosts)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#2D1B0E] hover:bg-[#3D2513] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-98"
                >
                  {showAllPosts ? (
                    <>
                      <span>{isEn ? `Show Less (${INITIAL_POST_LIMIT} posts)` : `ย่อการแสดงผล (แสดง ${INITIAL_POST_LIMIT} โพสต์แรก)`}</span>
                      <span>▲</span>
                    </>
                  ) : (
                    <>
                      <span>{isEn ? `View All (${filtered.length} posts)` : `ดูโพสต์ทั้งหมด (${filtered.length} โพสต์)`}</span>
                      <span>▼</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Facebook Page CTA Banner */}
        <div className="mt-14 bg-[#2D1B0E] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-[#C59139]/40">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <FacebookIcon className="w-4 h-4 fill-current text-[#1877F2]" />
              <span>Official Facebook Fanpage</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
              ติดตามภาพผลงานและเรื่องราวงานไม้เพิ่มเติม
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/80 font-light">
              กดติดตามเพจ <strong>เสี่ยธนท์ ฝาทรงไทย</strong> เพื่อไม่พลาดผลงานส่งมอบและโปรโมชั่นพิเศษ
            </p>
          </div>

          <a
            href="https://www.facebook.com/seiy.thnth.fa.thrng.thiy?locale=th_TH"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold shrink-0 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center gap-2"
          >
            <FacebookIcon className="w-4 h-4 fill-current" />
            <span>ไปที่เพจ Facebook โรงงาน</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Full Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onLike={handleLike}
        isLiked={selectedPost ? !!likedPosts[selectedPost.id] : false}
      />
    </section>
  );
}


