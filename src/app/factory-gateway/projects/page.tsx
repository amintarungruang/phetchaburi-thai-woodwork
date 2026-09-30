'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  Check,
  X,
  Layers,
  MapPin,
  Images,
  AlertCircle,
  FolderTree,
  CheckCircle2
} from 'lucide-react';
import { getProjects, saveProject, deleteProject, getCategories } from '@/lib/store';
import { Project, CategoryItem } from '@/types';
import MultiImageUploader from '@/components/admin/MultiImageUploader';
import CategoryManagerModal from '@/components/admin/CategoryManagerModal';
import CustomSelect from '@/components/ui/CustomSelect';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('gable');
  const [woodType, setWoodType] = useState('ไม้สักทองคัดพิเศษ อบแห้ง 12-14%');
  const [dimensions, setDimensions] = useState('กว้าง 3.50 ม. x สูง 2.20 ม.');
  const [priceRange, setPriceRange] = useState('45,000 - 65,000 บาท');
  const [locationName, setLocationName] = useState('อ.เมือง จ.เพชรบุรี');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [craftingTechnique, setCraftingTechnique] = useState('การเข้าเดือยไม้ลิ้นร่องโบราณ');
  const [images, setImages] = useState<string[]>([
    '/uploads/projects/proj-window-teak-cf50.jpg',
  ]);

  const loadData = async () => {
    const [projectData, catData] = await Promise.all([
      getProjects(),
      getCategories('project')
    ]);
    setProjects(projectData);
    setCategories(catData);
    if (catData.length > 0 && !category) {
      setCategory(catData[0].id);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('woodwork_store_updated', loadData);
    return () => window.removeEventListener('woodwork_store_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory(categories[0]?.id || 'gable');
    setWoodType('ไม้สักทองคัดพิเศษ อบแห้ง 12-14%');
    setDimensions('กว้าง 3.50 ม. x สูง 2.20 ม.');
    setPriceRange('45,000 - 65,000 บาท');
    setLocationName('อ.เมือง จ.เพชรบุรี');
    setDescription('สถาปัตยกรรมไม้สักทองแท้ แกะสลักลวดลายกนกเปลวเพลิงเอกลักษณ์ช่างเมืองเพชรบุรี เข้าเดือยไม้โบราณไม่ใช้ตะปู');
    setCraftingTechnique('การเข้าเดือยไม้ลิ้นร่องโบราณ');
    setIsFeatured(false);
    setImages([]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setCategory(p.category);
    setWoodType(p.wood_type);
    setDimensions(p.dimensions_info);
    setPriceRange(p.price_range);
    setLocationName(p.location_name);
    setDescription(p.description);
    setCraftingTechnique(p.crafting_technique || 'การเข้าเดือยไม้ลิ้นร่องโบราณ');
    setIsFeatured(p.is_featured);
    const allImgs = p.gallery_urls && p.gallery_urls.length > 0 
      ? p.gallery_urls 
      : p.image_url ? [p.image_url] : [];
    setImages(allImgs);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('กรุณากรอกชื่อผลงาน');
      return;
    }

    if (images.length === 0) {
      setFormError('กรุณาอัปโหลดรูปภาพผลงานอย่างน้อย 1 รูป (รูปแรกจะถูกใช้เป็นรูปหน้าปก)');
      return;
    }

    setIsSaving(true);

    const matchedCat = categories.find(c => c.id === category);
    const categoryNameTh = matchedCat?.name_th || 'งานไม้สัก';

    const projectData: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      title: title.trim(),
      category,
      category_name_th: categoryNameTh,
      description: description.trim(),
      wood_type: woodType.trim(),
      dimensions_info: dimensions.trim(),
      price_range: priceRange.trim(),
      image_url: images[0], // First image is always the Cover
      gallery_urls: images, // Complete ordered gallery
      location_name: locationName.trim(),
      installation_year: editingProject ? editingProject.installation_year : new Date().getFullYear(),
      is_featured: isFeatured,
      crafting_technique: craftingTechnique.trim(),
      created_at: editingProject ? editingProject.created_at : new Date().toISOString(),
    };

    try {
      const saved = await saveProject(projectData, !editingProject);
      setProjects(prev => {
        const idx = prev.findIndex(p => p.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setModalOpen(false);
      setSaveSuccess(`บันทึกผลงาน "${saved.title}" เรียบร้อยแล้ว`);
      setTimeout(() => setSaveSuccess(null), 3500);
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const ok = await confirm({
      title: 'ยืนยันการลบผลงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบผลงาน "${project.title}" ?\n(รูปภาพและข้อมูลที่เกี่ยวข้องจะถูกลบออกจากระบบ)`,
      confirmText: 'ลบผลงาน',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      if (project.gallery_urls && project.gallery_urls.length > 0) {
        for (const url of project.gallery_urls) {
          if (url.startsWith('/uploads/projects/')) {
            fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url }),
            }).catch(console.error);
          }
        }
      }

      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setSaveSuccess(`ลบผลงาน "${project.title}" ออกจากระบบแล้ว`);
      setTimeout(() => setSaveSuccess(null), 3000);
      await loadData();
    }
  };

  const filtered = projects.filter((p) => {
    const matchCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wood-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wood-950 font-serif">
            จัดการแคตตาล็อกผลงาน (Portfolio CMS)
          </h1>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            เพิ่ม แก้ไข และลบผลงานไม้สัก พร้อมอัปโหลดรูปภาพหลายรูปและกำหนดรูปหน้าปก
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCatModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-wood-300 bg-white text-wood-800 hover:bg-wood-50 font-semibold text-xs transition-all shadow-2xs"
          >
            <FolderTree className="w-4 h-4 text-gold-600" />
            <span>จัดการหมวดหมู่</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gold text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผลงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-wood-200 shadow-2xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-wood-950 text-white shadow-xs'
                : 'bg-wood-50 text-wood-700 hover:bg-wood-100 border border-wood-200'
            }`}
          >
            ทั้งหมด ({projects.length})
          </button>
          {categories.map((cat) => {
            const count = projects.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-wood-950 text-white shadow-xs'
                    : 'bg-wood-50 text-wood-700 hover:bg-wood-100 border border-wood-200'
                }`}
              >
                {cat.name_th} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-wood-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผลงาน, หมวดหมู่, หรือเกรดไม้..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-wood-300 text-xs text-wood-950 bg-wood-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-wood-200 p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-wood-100 text-wood-400 uppercase font-semibold">
              <th className="pb-3">รูปหน้าปก & แกลเลอรี</th>
              <th className="pb-3">ชื่อผลงาน</th>
              <th className="pb-3">หมวดหมู่</th>
              <th className="pb-3">เกรดไม้ & สเปก</th>
              <th className="pb-3">สถานที่ติดตั้ง</th>
              <th className="pb-3 text-center">สถานะ</th>
              <th className="pb-3 text-right">การกระทำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-wood-50/60 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-wood-900 border border-wood-200 shrink-0">
                      <Image
                        src={item.image_url || item.gallery_urls?.[0] || '/images/thai-house-model.png'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {item.gallery_urls && item.gallery_urls.length > 1 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-wood-100 text-wood-700 text-[10px] font-bold">
                        <Images className="w-3 h-3" />
                        <span>{item.gallery_urls.length} รูป</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 font-semibold text-wood-950 max-w-xs">
                  <div>{item.title}</div>
                  <div className="text-[10px] text-wood-400 line-clamp-1">{item.description}</div>
                </td>
                <td className="py-3">
                  <span className="px-2.5 py-1 rounded-md bg-wood-100 text-wood-800 font-medium">
                    {item.category_name_th}
                  </span>
                </td>
                <td className="py-3 text-wood-600">
                  <div className="font-medium text-wood-900">{item.wood_type}</div>
                  <div className="text-[10px] text-wood-500">{item.dimensions_info}</div>
                </td>
                <td className="py-3 text-wood-600">
                  <div className="flex items-center gap-1 font-medium text-gold-700">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{item.location_name}</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  {item.is_featured ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-800 border border-gold-300">
                      <Sparkles className="w-3 h-3" />
                      ผลงานเด่น
                    </span>
                  ) : (
                    <span className="text-wood-400 text-[11px]">-</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-wood-600 hover:text-wood-950 hover:bg-wood-100 transition-colors"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-wood-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="ลบผลงาน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Project */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-wood-200">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-4 sm:p-6 border-b border-wood-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wood-100 text-gold-700">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-wood-950 font-serif">
                    {editingProject ? 'แก้ไขผลงานไม้สัก' : 'เพิ่มผลงานใหม่เข้าสู่แคตตาล็อก'}
                  </h2>
                  <p className="text-xs text-wood-500">
                    อัปโหลดรูปภาพหลายรูป จัดการรูปหน้าปก และกำหนดรายละเอียดชิ้นงาน
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-wood-400 hover:text-wood-950 hover:bg-wood-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Multi-Image Upload from Device */}
              <div className="space-y-2">
                <MultiImageUploader
                  images={images}
                  onChange={setImages}
                  maxImages={8}
                />
              </div>

              {/* 2. Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-wood-100">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    ชื่อผลงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น หน้าจั่วทรงไทยเมืองเพชร ลายกนกเปลวเพลิงแกะสลัก"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-wood-900">
                      หมวดหมู่ผลงาน <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCatModalOpen(true)}
                      className="text-[11px] text-gold-700 hover:underline font-semibold"
                    >
                      + จัดการหมวดหมู่
                    </button>
                  </div>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name_th,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    เกรดไม้สักทอง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ไม้สักทองคัดพิเศษ อบแห้ง 12-14%"
                    value={woodType}
                    onChange={(e) => setWoodType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">ขนาด / สเปก</label>
                  <input
                    type="text"
                    placeholder="เช่น กว้าง 3.50 ม. x สูง 2.20 ม."
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">ช่วงราคาโดยประมาณ</label>
                  <input
                    type="text"
                    placeholder="เช่น 45,000 - 65,000 บาท"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">สถานที่ติดตั้งจริง</label>
                  <input
                    type="text"
                    placeholder="เช่น วัดมหาธาตุวรวิหาร จ.เพชรบุรี"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">เทคนิคช่างเฉพาะ</label>
                  <input
                    type="text"
                    placeholder="เช่น การเข้าเดือยไม้ลิ้นร่องโบราณ, แกะสลักมือ"
                    value={craftingTechnique}
                    onChange={(e) => setCraftingTechnique(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-wood-900 mb-1">รายละเอียดชิ้นงาน</label>
                  <textarea
                    rows={3}
                    placeholder="ระบุความประณีตของชิ้นงาน การทนแดดทนฝน ปลวกไม่กิน..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500 leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-bold text-wood-900 cursor-pointer">
                    แสดงเป็นผลงานเด่น (Featured Showcase)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-wood-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-800 text-xs font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl btn-gold text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลผลงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        type="project"
        title="จัดการหมวดหมู่ผลงานแคตตาล็อก"
        onCategoriesChanged={loadData}
      />
    </div>
  );
}
