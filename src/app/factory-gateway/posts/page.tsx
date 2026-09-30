'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Rss, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Facebook as FacebookIcon, 
  Pin, 
  Lock, 
  Globe, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  Upload, 
  Tag, 
  User, 
  Sparkles,
  FileText,
  Play,
  Layers,
  Link2,
  Eye
} from 'lucide-react';
import { getPosts, savePost, deletePost, togglePinPost } from '@/lib/store';
import { FactoryPost, PostVisibility } from '@/types';
import RichTextEditor from '@/components/RichTextEditor';
import PostDetailModal from '@/components/PostDetailModal';
import CustomSelect from '@/components/ui/CustomSelect';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export default function FactoryPostsCMS() {
  const [posts, setPosts] = useState<FactoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMedia, setFilterMedia] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<FactoryPost | null>(null);
  const [previewPost, setPreviewPost] = useState<FactoryPost | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formMediaUrls, setFormMediaUrls] = useState<string[]>([]);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formFacebookUrl, setFormFacebookUrl] = useState('');
  const [formVisibility, setFormVisibility] = useState<PostVisibility>('public');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formAuthor, setFormAuthor] = useState('ช่างเอส (เจ้าของโรงงาน)');
  const [formTags, setFormTags] = useState('');
  const [formPinToTop, setFormPinToTop] = useState(false);

  // Media upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPosts(true); // Include private/scheduled
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('woodwork_store_updated', loadData);
    return () => window.removeEventListener('woodwork_store_updated', loadData);
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormCaption('');
    setFormMediaUrls([]);
    setFormVideoUrl('');
    setFormFacebookUrl('');
    setFormVisibility('public');
    // Default scheduled time to tomorrow at 09:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setFormScheduledAt(tomorrow.toISOString().slice(0, 16));
    setFormAuthor('ช่างเอส (เจ้าของโรงงาน)');
    setFormTags('');
    setFormPinToTop(false);
    setUploadError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (post: FactoryPost) => {
    setEditingPost(post);
    setFormTitle(post.title || '');
    setFormCaption(post.caption || '');
    setFormMediaUrls(post.media_urls || []);
    setFormVideoUrl(post.video_url || '');
    setFormFacebookUrl(post.facebook_post_url || '');
    setFormVisibility(post.visibility || 'public');
    setFormScheduledAt(
      post.scheduled_at
        ? new Date(post.scheduled_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    setFormAuthor(post.author_name || 'ช่างเอส (เจ้าของโรงงาน)');
    setFormTags(post.tags ? post.tags.join(', ') : '');
    setFormPinToTop(!!post.pin_to_top);
    setUploadError('');
    setIsModalOpen(true);
  };

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folder', 'posts');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
      }

      if (data.urls && data.urls.length > 0) {
        setFormMediaUrls((prev) => [...prev, ...data.urls]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Video Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('files', files[0]);
      formData.append('folder', 'posts');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'อัปโหลดวิดีโอไม่สำเร็จ');
      }

      if (data.urls && data.urls.length > 0) {
        setFormVideoUrl(data.urls[0]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove media item
  const handleRemoveMedia = (urlToRemove: string) => {
    setFormMediaUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const { confirm, alert: customAlert } = useConfirmDialog();

  // Save Post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      await customAlert({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกหัวข้อโพสต์ก่อนบันทึก',
        variant: 'warning',
      });
      return;
    }

    setIsSaving(true);
    try {
      const tagsArray = formTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Auto-detect post_type based on attached content
      let derivedType: 'photo' | 'video' | 'facebook' | 'announcement' = 'photo';
      if (formVideoUrl.trim()) {
        derivedType = 'video';
      } else if (formMediaUrls.length > 0) {
        derivedType = 'photo';
      } else if (formFacebookUrl.trim()) {
        derivedType = 'facebook';
      } else {
        derivedType = 'announcement';
      }

      const postData: FactoryPost = {
        id: editingPost?.id || `post-${Date.now()}`,
        title: formTitle.trim(),
        caption: formCaption.trim(),
        post_type: derivedType,
        media_urls: formMediaUrls,
        video_url: formVideoUrl.trim() || undefined,
        facebook_post_url: formFacebookUrl.trim() || undefined,
        visibility: formVisibility,
        scheduled_at: formVisibility === 'scheduled' ? new Date(formScheduledAt).toISOString() : undefined,
        published_at:
          formVisibility === 'scheduled'
            ? new Date(formScheduledAt).toISOString()
            : editingPost?.published_at || new Date().toISOString(),
        created_at: editingPost?.created_at || new Date().toISOString(),
        author_name: formAuthor.trim() || 'ช่างเอส',
        tags: tagsArray,
        likes_count: editingPost?.likes_count || 0,
        pin_to_top: formPinToTop,
      };

      await savePost(postData);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      await customAlert({
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถบันทึกโพสต์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
        variant: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (post: FactoryPost) => {
    const ok = await confirm({
      title: 'ยืนยันการลบโพสต์',
      message: `คุณต้องการลบโพสต์ "${post.title}" ใช่หรือไม่?\nข้อมูลและรูปภาพในโพสต์นี้จะถูกลบออกจากระบบ`,
      confirmText: 'ลบโพสต์',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      await deletePost(post.id);
      await loadData();
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id: string) => {
    await togglePinPost(id);
    await loadData();
  };

  // Filter logic
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    let matchesMedia = true;
    if (filterMedia === 'video') matchesMedia = !!p.video_url;
    if (filterMedia === 'photo') matchesMedia = !!(p.media_urls && p.media_urls.length > 0);
    if (filterMedia === 'facebook') matchesMedia = !!p.facebook_post_url;

    const matchesVisibility = filterVisibility === 'all' || p.visibility === filterVisibility;

    return matchesSearch && matchesMedia && matchesVisibility;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD5] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#A87424] flex items-center justify-center font-bold shadow-2xs">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#2D1B0E] font-serif">
                จัดการข่าวสาร & โพสต์อัปเดตโรงงาน
              </h1>
              <p className="text-xs sm:text-sm text-[#7A6450] font-light">
                โพสต์ได้ทั้งภาพและวิดีโอพร้อมกันในโพสต์เดียว จัดแคปชั่นตัวหนา/เอียง และตั้งเวลาล่วงหน้า
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-gold flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างโพสต์ใหม่</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C735A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาโพสต์, แคปชั่น, แท็ก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8DFD5] rounded-2xl text-xs sm:text-sm text-[#2D1B0E] focus:outline-none focus:ring-2 focus:ring-[#C59139]/40"
          />
        </div>

        {/* Media Filter */}
        <CustomSelect
          value={filterMedia}
          onChange={(val) => setFilterMedia(val)}
          options={[
            {
              value: 'all',
              label: `ทุกรูปแบบสื่อ (${posts.length} โพสต์)`,
              icon: <Layers className="w-3.5 h-3.5" />,
            },
            {
              value: 'video',
              label: `มีคลิปวิดีโอ (${posts.filter((p) => p.video_url).length})`,
              icon: <VideoIcon className="w-3.5 h-3.5 text-red-500" />,
            },
            {
              value: 'photo',
              label: `มีอัลบั้มรูปภาพ (${posts.filter((p) => p.media_urls && p.media_urls.length > 0).length})`,
              icon: <ImageIcon className="w-3.5 h-3.5 text-[#C59139]" />,
            },
            {
              value: 'facebook',
              label: `ลิงก์ Facebook (${posts.filter((p) => p.facebook_post_url).length})`,
              icon: <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />,
            },
          ]}
        />

        {/* Visibility Filter */}
        <CustomSelect
          value={filterVisibility}
          onChange={(val) => setFilterVisibility(val)}
          options={[
            {
              value: 'all',
              label: 'ทุกสถานะการเผยแพร่',
              icon: <Globe className="w-3.5 h-3.5" />,
            },
            {
              value: 'public',
              label: 'เผยแพร่สาธารณะ',
              icon: <Globe className="w-3.5 h-3.5 text-emerald-600" />,
            },
            {
              value: 'scheduled',
              label: 'ตั้งเวลาล่วงหน้า (Scheduled)',
              icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
            },
            {
              value: 'private',
              label: 'ส่วนตัว (Private)',
              icon: <Lock className="w-3.5 h-3.5 text-amber-600" />,
            },
            {
              value: 'draft',
              label: 'ฉบับร่าง (Draft)',
              icon: <FileText className="w-3.5 h-3.5 text-gray-600" />,
            },
          ]}
        />
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#C59139] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8C735A]">กำลังโหลดข้อมูลโพสต์...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8DFD5] p-12 text-center space-y-3">
          <Rss className="w-10 h-10 text-[#C59139] mx-auto opacity-50" />
          <h3 className="font-bold text-base text-[#2D1B0E]">ไม่พบโพสต์ที่ค้นหา</h3>
          <p className="text-xs text-[#8C735A] max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม "สร้างโพสต์ใหม่" เพื่อเริ่มเผยแพร่ข่าวสารและผลงานของโรงงาน
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const isScheduledFuture =
              post.visibility === 'scheduled' &&
              new Date(post.scheduled_at || post.published_at) > new Date();

            const hasVideo = !!post.video_url;
            const hasPhotos = post.media_urls && post.media_urls.length > 0;
            const hasFacebook = !!post.facebook_post_url;

            return (
              <div
                key={post.id}
                className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  post.pin_to_top
                    ? 'border-[#C59139] ring-2 ring-[#C59139]/20'
                    : 'border-[#E8DFD5]'
                }`}
              >
                <div>
                  {/* Media Preview Header */}
                  <div className="relative aspect-16/10 w-full bg-[#FAF5EE] overflow-hidden">
                    {hasPhotos ? (
                      <Image
                        src={post.media_urls[0]}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : hasVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center mb-2 shadow-lg">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                        <span className="text-xs font-semibold">คลิปวิดีโอ</span>
                      </div>
                    ) : hasFacebook ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1877F2]/10 text-[#1877F2] p-4 text-center">
                        <FacebookIcon className="w-10 h-10 fill-current mb-2" />
                        <span className="text-xs font-semibold">โพสต์จากเพจ Facebook</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C735A]">
                        <FileText className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {/* Top Badges (Multi-media indicators) */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {/* Pinned Badge */}
                      {post.pin_to_top && (
                        <span className="bg-[#C59139] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>ปักหมุด</span>
                        </span>
                      )}

                      {/* Video Badge */}
                      {hasVideo && (
                        <span className="bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <VideoIcon className="w-3 h-3" />
                          <span>วิดีโอ</span>
                        </span>
                      )}

                      {/* Photo Badge */}
                      {hasPhotos && (
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{post.media_urls.length} รูป</span>
                        </span>
                      )}

                      {/* Facebook Link Badge */}
                      {hasFacebook && (
                        <span className="bg-[#1877F2] text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <FacebookIcon className="w-3 h-3 fill-current" />
                        </span>
                      )}
                    </div>

                    {/* Visibility Badge */}
                    <div className="absolute top-3 right-3">
                      {post.visibility === 'public' && (
                        <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <Globe className="w-3 h-3" />
                          <span>สาธารณะ</span>
                        </span>
                      )}
                      {post.visibility === 'scheduled' && (
                        <span
                          className={`text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs ${
                            isScheduledFuture ? 'bg-blue-600' : 'bg-emerald-600'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{isScheduledFuture ? 'ตั้งเวลาล่วงหน้า' : 'ถึงเวลาเผยแพร่แล้ว'}</span>
                        </span>
                      )}
                      {post.visibility === 'private' && (
                        <span className="bg-amber-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <Lock className="w-3 h-3" />
                          <span>ส่วนตัว (ซ่อน)</span>
                        </span>
                      )}
                      {post.visibility === 'draft' && (
                        <span className="bg-gray-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <span>ฉบับร่าง</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <h3 className="font-bold text-sm sm:text-base text-[#2D1B0E] line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    {/* Caption Preview */}
                    <div className="text-xs text-[#7A6450] line-clamp-2 font-light">
                      {post.caption.replace(/[*_#`<u>]/g, '')}
                    </div>

                    {/* Scheduled Info Notice */}
                    {post.visibility === 'scheduled' && post.scheduled_at && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                        <span>
                          กำหนดเผยแพร่วันที่:{' '}
                          <strong>
                            {new Date(post.scheduled_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            น.
                          </strong>
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {post.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="bg-[#FAF5EE] text-[#8C735A] text-[10px] px-2 py-0.5 rounded-md border border-[#E8DFD5]"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-[10px] text-[#8C735A] self-center">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD5] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(post.id)}
                    title={post.pin_to_top ? 'ยกเลิกปักหมุด' : 'ปักหมุดไว้บนสุด'}
                    className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
                      post.pin_to_top
                        ? 'bg-[#FAF0E1] text-[#C59139] font-bold'
                        : 'text-[#8C735A] hover:bg-white'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${post.pin_to_top ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">
                      {post.pin_to_top ? 'ปักหมุดแล้ว' : 'ปักหมุด'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewPost(post)}
                      title="ดูตัวอย่างโพสต์จริง"
                      className="p-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#E8DFD5] text-[#8C735A] hover:text-[#2D1B0E] text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">ดูตัวอย่าง</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(post)}
                      className="p-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#E8DFD5] text-[#2D1B0E] text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#C59139]" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      className="p-2 rounded-xl bg-white hover:bg-red-50 border border-[#E8DFD5] hover:border-red-200 text-red-600 text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E8DFD5] shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header: High-contrast Dark Teak Theme */}
            <div className="p-5 sm:p-6 bg-[#2D1B0E] border-b border-[#4A2D17] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C59139] text-[#2D1B0E] flex items-center justify-center font-bold shadow-md">
                  {editingPost ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="font-bold text-lg sm:text-xl text-white font-serif tracking-wide">
                    {editingPost ? 'แก้ไขโพสต์อัปเดต' : 'สร้างโพสต์อัปเดตใหม่'}
                  </h2>
                  <p className="text-xs text-[#E8C581] font-light mt-0.5">
                    แนบรูปภาพ วิดีโอ แคปชั่น และตั้งเวลาเผยแพร่ได้ในโพสต์เดียว
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePost} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* 1. Post Title */}
              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1.5">
                  หัวข้อโพสต์ / ชื่อกิจกรรม <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ส่งมอบศาลาทรงไทย จ.นครปฐม หรือ คลิปแกะสลักลายไม้สัก"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:outline-none focus:ring-2 focus:ring-[#C59139]/40 font-medium"
                />
              </div>

              {/* 2. Media Manager (Unified: Photos + Video + Facebook) */}
              <div className="space-y-4">
                
                {/* 2.1 Photo Gallery Upload */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D1B0E] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#C59139]" />
                      <span>อัลบั้มรูปภาพ (เลือกได้หลายรูป)</span>
                    </label>
                    <span className="text-[11px] text-[#8C735A]">
                      {formMediaUrls.length} รูปที่เลือก
                    </span>
                  </div>

                  {/* File Upload Box */}
                  <label className="block border-2 border-dashed border-[#D4C4B2] hover:border-[#C59139] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-[#C59139] mx-auto mb-1.5" />
                    <div className="text-xs font-semibold text-[#2D1B0E]">
                      {isUploading ? 'กำลังอัปโหลดรูปภาพ...' : 'คลิกเพื่อเลือกไฟล์รูปภาพจากอุปกรณ์'}
                    </div>
                    <p className="text-[11px] text-[#8C735A] mt-0.5">
                      รองรับ JPG, PNG, WEBP (ไม่เกิน 15MB ต่อรูป)
                    </p>
                  </label>

                  {/* Preview Thumbnails */}
                  {formMediaUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                      {formMediaUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[#E8DFD5]">
                          <Image src={url} alt={`Upload ${idx}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(url)}
                            className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              รูปหน้าปก
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2.2 Video Attachment */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5] space-y-3">
                  <label className="block text-xs font-bold text-[#2D1B0E] flex items-center gap-1.5">
                    <VideoIcon className="w-4 h-4 text-red-500" />
                    <span>แนบคลิปวิดีโอ (YouTube URL หรือ อัปโหลดไฟล์)</span>
                  </label>

                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="วางลิงก์วิดีโอ เช่น https://www.youtube.com/watch?v=... หรือ MP4 URL"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-xs text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                    />

                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF0E1] border border-[#E8DFD5] rounded-xl text-xs font-medium text-[#2D1B0E] cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-red-500" />
                        <span>หรือเลือกไฟล์วิดีโอ MP4 / WebM (ไม่เกิน 60MB)</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleVideoUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      {formVideoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormVideoUrl('')}
                          className="text-[11px] text-red-600 hover:underline"
                        >
                          ลบวิดีโอ
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2.3 Optional Facebook Post / Video Link or Embed Code */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-[#1877F2]/20 space-y-2">
                  <label className="block text-xs font-bold text-[#1877F2] flex items-center gap-1.5">
                    <FacebookIcon className="w-4 h-4 fill-current" />
                    <span>ดึงโพสต์ / คลิปจาก Facebook (ใส่ลิงก์โพสต์ ลิงก์คลิป หรือโค้ดฝัง iframe ได้เลย)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="วางลิงก์ เช่น https://www.facebook.com/.../videos/... หรือวางโค้ด <iframe ...></iframe>"
                    value={formFacebookUrl}
                    onChange={(e) => setFormFacebookUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-xs text-[#2D1B0E] focus:ring-2 focus:ring-[#1877F2]"
                  />
                  <p className="text-[11px] text-[#5C4A3A]">
                    <strong>คำแนะนำ:</strong> เมื่อวางลิงก์โพสต์หรือคลิป ระบบจะฝังตัวเล่นวิดีโอและแคปชั่นจาก Facebook ให้เล่นบนหน้าเว็บได้ทันที
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {uploadError}
                </div>
              )}

              {/* 3. Rich Text Caption Editor */}
              <RichTextEditor
                value={formCaption}
                onChange={setFormCaption}
                label="ข้อความแคปชั่น / รายละเอียดผลงาน (ตกแต่งตัวหนา ตัวเอียง ขีดเส้นใต้)"
                placeholder="เขียนเรื่องราว ความประณีตของงานไม้สัก ลวดลาย หรือขั้นตอนการผลิต..."
                rows={5}
              />

              {/* 4. Visibility & Scheduled Settings */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5] space-y-3.5">
                <label className="block text-xs font-bold text-[#2D1B0E]">
                  ตั้งค่าการเผยแพร่ & ความเป็นส่วนตัว
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1 text-xs ${
                      formVisibility === 'public'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600/30'
                        : 'border-[#E8DFD5] bg-white text-[#6B5745]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formVisibility === 'public'}
                      onChange={() => setFormVisibility('public')}
                      className="hidden"
                    />
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>สาธารณะ</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1 text-xs ${
                      formVisibility === 'scheduled'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-600/30'
                        : 'border-[#E8DFD5] bg-white text-[#6B5745]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="scheduled"
                      checked={formVisibility === 'scheduled'}
                      onChange={() => setFormVisibility('scheduled')}
                      className="hidden"
                    />
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>ตั้งเวลาล่วงหน้า</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1 text-xs ${
                      formVisibility === 'private'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-600/30'
                        : 'border-[#E8DFD5] bg-white text-[#6B5745]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formVisibility === 'private'}
                      onChange={() => setFormVisibility('private')}
                      className="hidden"
                    />
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>ส่วนตัว (ซ่อน)</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1 text-xs ${
                      formVisibility === 'draft'
                        ? 'border-gray-600 bg-gray-50 text-gray-900 font-bold ring-2 ring-gray-600/30'
                        : 'border-[#E8DFD5] bg-white text-[#6B5745]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="draft"
                      checked={formVisibility === 'draft'}
                      onChange={() => setFormVisibility('draft')}
                      className="hidden"
                    />
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span>ฉบับร่าง</span>
                  </label>
                </div>

                {/* If Scheduled: Show DateTime Picker */}
                {formVisibility === 'scheduled' && (
                  <div className="pt-2 border-t border-[#E8DFD5]">
                    <label className="block text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>เลือกวันและเวลาที่ต้องการให้ระบบเผยแพร่อัตโนมัติ:</span>
                    </label>
                    <input
                      type="datetime-local"
                      required={formVisibility === 'scheduled'}
                      value={formScheduledAt}
                      onChange={(e) => setFormScheduledAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-blue-700 mt-1 font-light">
                      *โพสต์จะยังไม่แสดงบนหน้าเว็บหลักจนกว่าจะถึงเวลาที่กำหนด
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Extra Metadata (Pin to top, Author, Tags) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Author */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B0E] mb-1">
                    ชื่อผู้โพสต์ / ผู้เขียน
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-xs text-[#2D1B0E] focus:ring-1 focus:ring-[#C59139]"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B0E] mb-1">
                    แท็กหัวข้อ (คั่นด้วยเครื่องหมายจุลภาค)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ศาลาทรงไทย, ไม้สักทอง, ส่งมอบงาน"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-xs text-[#2D1B0E] focus:ring-1 focus:ring-[#C59139]"
                  />
                </div>
              </div>

              {/* Pin to Top Switch */}
              <label className="flex items-center gap-3 p-3 bg-[#FAF5EE] rounded-xl border border-[#E8DFD5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formPinToTop}
                  onChange={(e) => setFormPinToTop(e.target.checked)}
                  className="w-4 h-4 text-[#C59139] rounded border-gray-300 focus:ring-[#C59139]"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#2D1B0E] flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-[#C59139]" />
                    <span>ปักหมุดโพสต์นี้ให้อยู่บนสุดของหน้าเว็บ</span>
                  </div>
                  <div className="text-[#8C735A] font-light">
                    โพสต์ที่ปักหมุดจะแสดงเป็นอันดับแรกในฟีดข่าวสารหน้าเว็บ
                  </div>
                </div>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8DFD5] text-xs font-semibold text-[#6B5745] hover:bg-[#FAF7F2] transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกและเผยแพร่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Post Detail Modal for Admin Live Preview */}
      <PostDetailModal
        post={previewPost}
        isOpen={!!previewPost}
        onClose={() => setPreviewPost(null)}
      />
    </div>
  );
}
