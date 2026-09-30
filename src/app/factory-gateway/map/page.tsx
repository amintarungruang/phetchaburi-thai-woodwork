'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Plus, Trash2, Edit2, Navigation, Search, Images, AlertCircle, X, FolderTree, CheckCircle2 } from 'lucide-react';
import { getPins, savePin, deletePin, getCategories } from '@/lib/store';
import { InstallationPin, CategoryItem } from '@/types';
import MultiImageUploader from '@/components/admin/MultiImageUploader';
import LocationPickerMap from '@/components/admin/LocationPickerMap';
import CategoryManagerModal from '@/components/admin/CategoryManagerModal';
import CustomSelect from '@/components/ui/CustomSelect';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export default function AdminMapPage() {
  const [pins, setPins] = useState<InstallationPin[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<InstallationPin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('temple');
  const [province, setProvince] = useState('เพชรบุรี');
  const [locationName, setLocationName] = useState('อ.เมือง จ.เพชรบุรี');
  const [lat, setLat] = useState(13.1118);
  const [lng, setLng] = useState(99.9486);
  const [description, setDescription] = useState('');
  const [woodDetails, setWoodDetails] = useState('ไม้สักทองแท้คัดพิเศษ อบแห้ง 100%');
  const [images, setImages] = useState<string[]>([
    '/uploads/projects/proj-1788463571424-1np4u3.jpg',
  ]);

  const loadData = async () => {
    const [pinData, catData] = await Promise.all([
      getPins(),
      getCategories('map')
    ]);
    setPins(pinData);
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
    setEditingPin(null);
    setTitle('');
    setCategory(categories[0]?.id || 'temple');
    setProvince('เพชรบุรี');
    setLocationName('อ.เมือง จ.เพชรบุรี');
    setLat(13.1118);
    setLng(99.9486);
    setDescription('งานบูรณะหน้าจั่วไม้สักแกะสลักลายกนกเปลวเพลิงและฝาปะกนกุฏิสงฆ์');
    setWoodDetails('ไม้สักทองแท้คัดพิเศษ อบแห้ง 100%');
    setImages([]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (pin: InstallationPin) => {
    setEditingPin(pin);
    setTitle(pin.title);
    setCategory(pin.category);
    setProvince(pin.province);
    setLocationName(pin.location_name);
    setLat(pin.lat);
    setLng(pin.lng);
    setDescription(pin.description);
    setWoodDetails(pin.wood_details);
    const allImgs = pin.gallery_urls && pin.gallery_urls.length > 0 
      ? pin.gallery_urls 
      : pin.image_url ? [pin.image_url] : [];
    setImages(allImgs);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('กรุณากรอกชื่อสถานที่หรือผลงาน');
      return;
    }

    if (images.length === 0) {
      setFormError('กรุณาอัปโหลดรูปภาพหน้างานจริงอย่างน้อย 1 รูป');
      return;
    }

    setIsSaving(true);

    const matchedCat = categories.find(c => c.id === category);
    const categoryNameTh = matchedCat?.name_th || 'ผลงานไม้สักจริง';

    const pinData: InstallationPin = {
      id: editingPin ? editingPin.id : `pin-${Date.now()}`,
      title: title.trim(),
      category,
      category_name_th: categoryNameTh,
      province: province.trim(),
      location_name: locationName.trim(),
      lat: Number(lat),
      lng: Number(lng),
      image_url: images[0], // Cover image
      gallery_urls: images, // Complete gallery
      description: description.trim(),
      wood_details: woodDetails.trim(),
      completed_year: editingPin ? editingPin.completed_year : new Date().getFullYear(),
    };

    try {
      const saved = await savePin(pinData);
      setPins(prev => {
        const idx = prev.findIndex(p => p.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setModalOpen(false);
      setSaveSuccess(`บันทึกข้อมูลผลงาน "${saved.title}" เรียบร้อยแล้ว`);
      setTimeout(() => setSaveSuccess(null), 3500);
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError('เกิดข้อผิดพลาดในการบันทึกหมุดพิกัด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: string) => {
    const target = pins.find(p => p.id === id);
    if (!target) return;

    const ok = await confirm({
      title: 'ยืนยันการลบหมุดผลงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบหมุด "${target.title}" ?\n(รูปภาพและพิกัดที่เกี่ยวข้องจะถูกลบออกจากระบบ)`,
      confirmText: 'ลบหมุด',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      if (target.gallery_urls && target.gallery_urls.length > 0) {
        for (const url of target.gallery_urls) {
          if (url.startsWith('/uploads/projects/')) {
            fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url }),
            }).catch(console.error);
          }
        }
      }

      await deletePin(id);
      setPins(prev => prev.filter(p => p.id !== id));
      setSaveSuccess(`ลบหมุดผลงาน "${target.title}" เรียบร้อยแล้ว`);
      setTimeout(() => setSaveSuccess(null), 3000);
      await loadData();
    }
  };

  const filtered = pins.filter((p) => {
    const matchCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.province.includes(searchQuery) ||
      p.location_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wood-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wood-950 font-serif">
            จัดการหมุดแผนที่และผลงานจริง (Interactive Map CMS)
          </h1>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            ปักหมุดสถานที่ติดตั้งจริง กำหนดพิกัด GPS อัปโหลดรูปภาพหน้างาน และแก้ไขข้อมูลผลงาน
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gold font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ปักหมุดผลงานใหม่</span>
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
            ทั้งหมด ({pins.length})
          </button>
          {categories.map((cat) => {
            const count = pins.filter(p => p.category === cat.id).length;
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
          <Search className="w-4 h-4 text-wood-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสถานที่, จังหวัด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-wood-300 text-xs text-wood-950 bg-wood-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
      </div>

      {/* Pins Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-wood-200 space-y-3">
          <MapPin className="w-12 h-12 text-wood-300 mx-auto" />
          <p className="text-sm font-semibold text-wood-700">ไม่พบหมุดผลงานในหมวดหมู่นี้</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl btn-gold text-xs font-bold"
          >
            ปักหมุดผลงานแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pin) => {
            const allImages = pin.gallery_urls && pin.gallery_urls.length > 0 
              ? pin.gallery_urls 
              : [pin.image_url || '/images/thai-house-model.png'];

            return (
              <div
                key={pin.id}
                className="bg-white rounded-2xl border border-wood-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-48 w-full bg-wood-900 overflow-hidden">
                  <Image
                    src={allImages[0]}
                    alt={pin.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-wood-950/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
                    {pin.category_name_th}
                  </div>

                  {allImages.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Images className="w-3 h-3 text-gold-400" />
                      <span>{allImages.length} รูป</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-white/95 text-wood-950 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                    <Navigation className="w-3 h-3 text-gold-600" />
                    <span>{pin.province}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-wood-950 line-clamp-1">{pin.title}</h3>
                    <p className="text-xs text-gold-800 font-semibold mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{pin.location_name}</span>
                    </p>
                    <p className="text-xs text-wood-600 mt-2 line-clamp-2 leading-relaxed">
                      {pin.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-wood-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-wood-500 font-mono">
                      GPS: {pin.lat.toFixed(3)}, {pin.lng.toFixed(3)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(pin)}
                        className="p-1.5 rounded-lg text-wood-600 hover:text-wood-950 hover:bg-wood-100 transition-colors"
                        title="แก้ไขข้อมูลหมุด"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pin.id)}
                        className="p-1.5 rounded-lg text-wood-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="ลบหมุด"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Pin */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-wood-200">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-4 sm:p-6 border-b border-wood-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wood-100 text-gold-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-wood-950 font-serif">
                    {editingPin ? 'แก้ไขหมุดผลงานจริง' : 'ปักหมุดผลงานใหม่บนแผนที่'}
                  </h2>
                  <p className="text-xs text-wood-500">
                    กำหนดพิกัด อัปโหลดรูปภาพหน้างานจริง และระบุรายละเอียดไม้สัก
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

              {/* 1. Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    ชื่อสถานที่ / โครงการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น พระอุโบสถวัดมหาธาตุวรวิหาร, คฤหาสน์หรูบางนา"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-wood-900">
                      หมวดหมู่สถานที่ <span className="text-red-500">*</span>
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
                    จังหวัด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เพชรบุรี, กรุงเทพมหานคร, เชียงใหม่"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    ที่อยู่ / จุดสังเกตหน้างาน
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ริมแม่น้ำเพชรบุรี อ.เมือง จ.เพชรบุรี"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* 2. Interactive Map Coordinates */}
              <div className="space-y-2 pt-2 border-t border-wood-100">
                <LocationPickerMap
                  lat={lat}
                  lng={lng}
                  onChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                />
              </div>

              {/* 3. Multi-Image Upload from Device */}
              <div className="space-y-2 pt-2 border-t border-wood-100">
                <MultiImageUploader
                  images={images}
                  onChange={setImages}
                  maxImages={8}
                />
              </div>

              {/* 4. Description & Wood Details */}
              <div className="space-y-4 pt-2 border-t border-wood-100">
                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    รายละเอียดงานไม้สักที่ติดตั้ง
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ไม้สักทองแท้คัดพิเศษ อบแห้ง 100%, ประตูแกะสลักหนา 2 นิ้ว"
                    value={woodDetails}
                    onChange={(e) => setWoodDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    คำอธิบายผลงาน / ประวัติการติดตั้ง
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ระบุความประทับใจ ความท้าทาย หรือเทคนิคการเข้าเดือยไม้ช่างเมืองเพชร..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500 leading-relaxed"
                  />
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
        type="map"
        title="จัดการหมวดหมู่หมุดแผนที่"
        onCategoriesChanged={loadData}
      />
    </div>
  );
}
