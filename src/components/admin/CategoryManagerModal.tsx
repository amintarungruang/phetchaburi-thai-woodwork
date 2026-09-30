'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Check, FolderTree, AlertCircle, Save } from 'lucide-react';
import { CategoryItem } from '@/types';
import { getCategories, saveCategory, deleteCategory } from '@/lib/store';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'project' | 'map' | 'inventory';
  title?: string;
  onCategoriesChanged?: () => void;
}

export default function CategoryManagerModal({
  isOpen,
  onClose,
  type,
  title = 'จัดการหมวดหมู่',
  onCategoriesChanged,
}: CategoryManagerModalProps) {
  const { confirm } = useConfirmDialog();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameTh, setEditNameTh] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Add new state
  const [newNameTh, setNewNameTh] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    const list = await getCategories(type);
    setCategories(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setErrorMsg(null);
      setSuccessMsg(null);
      setEditingId(null);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditNameTh(cat.name_th);
    setEditDesc(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNameTh('');
    setEditDesc('');
  };

  const handleSaveEdit = async (cat: CategoryItem) => {
    if (!editNameTh.trim()) {
      setErrorMsg('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    const updated: CategoryItem = {
      ...cat,
      name_th: editNameTh.trim(),
      description: editDesc.trim(),
    };

    await saveCategory(updated);
    setEditingId(null);
    setSuccessMsg(`บันทึกการแก้ไขหมวดหมู่ "${updated.name_th}" สำเร็จ`);
    setTimeout(() => setSuccessMsg(null), 3000);
    await loadData();
    onCategoriesChanged?.();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newNameTh.trim()) {
      setErrorMsg('กรุณากรอกชื่อหมวดหมู่ที่ต้องการเพิ่ม');
      return;
    }

    // Auto-generate key id
    const genId = `cat_${Date.now().toString(36)}`;
    const newCat: CategoryItem = {
      id: genId,
      name_th: newNameTh.trim(),
      type: type,
      description: newDesc.trim(),
      order_index: categories.length + 1,
    };

    await saveCategory(newCat);
    setNewNameTh('');
    setNewDesc('');
    setSuccessMsg(`เพิ่มหมวดหมู่ "${newCat.name_th}" สำเร็จ`);
    setTimeout(() => setSuccessMsg(null), 3000);
    await loadData();
    onCategoriesChanged?.();
  };

  const handleDeleteCategory = async (id: string, nameTh: string) => {
    if (categories.length <= 1) {
      setErrorMsg('ไม่สามารถลบหมวดหมู่ทั้งหมดได้ ต้องมีอย่างน้อย 1 หมวดหมู่');
      return;
    }

    const isOk = await confirm({
      title: 'ยืนยันการลบหมวดหมู่',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${nameTh}"? ข้อมูลที่อยู่ในหมวดหมู่นี้อาจได้รับผลกระทบ`,
      confirmText: 'ลบหมวดหมู่',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });

    if (isOk) {
      await deleteCategory(id, type);
      setSuccessMsg(`ลบหมวดหมู่ "${nameTh}" เรียบร้อย`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadData();
      onCategoriesChanged?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-wood-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-wood-950 to-wood-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-wood-800 text-gold-400 border border-gold-500/30">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{title}</h3>
              <p className="text-xs text-wood-300">เพิ่ม ลบ และแก้ไขหมวดหมู่สำหรับระบบนี้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-wood-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Existing Categories List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-wood-900 pb-1 border-b border-wood-100">
              <span>หมวดหมู่ที่มีอยู่ทั้งหมด ({categories.length} รายการ)</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;

                if (isEditing) {
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl bg-wood-50 border-2 border-gold-500 space-y-2.5 shadow-xs"
                    >
                      <div className="font-bold text-wood-950">แก้ไขหมวดหมู่</div>
                      <input
                        type="text"
                        value={editNameTh}
                        onChange={(e) => setEditNameTh(e.target.value)}
                        placeholder="ชื่อหมวดหมู่ (เช่น หน้าจั่วทรงไทย)"
                        className="w-full px-3 py-1.5 rounded-xl border border-wood-300 text-xs text-wood-950 bg-white"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                        className="w-full px-3 py-1.5 rounded-xl border border-wood-300 text-xs text-wood-950 bg-white"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-xl bg-wood-200 hover:bg-wood-300 text-wood-800 text-xs font-semibold"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={() => handleSaveEdit(cat)}
                          className="px-3 py-1.5 rounded-xl bg-wood-950 hover:bg-wood-800 text-gold-400 text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>บันทึก</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-white border border-wood-200 hover:border-gold-400/80 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div>
                      <div className="font-bold text-xs text-wood-950 flex items-center gap-2">
                        <span>{cat.name_th}</span>
                        <span className="text-[10px] text-wood-400 font-mono font-normal">({cat.id})</span>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-wood-600 font-light mt-0.5">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-wood-600 hover:text-wood-950 hover:bg-wood-100 transition-colors"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name_th)}
                        className="p-1.5 rounded-lg text-wood-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="ลบหมวดหมู่"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Category Form */}
          <div className="p-4 rounded-2xl bg-wood-50/80 border border-wood-200 space-y-3">
            <div className="font-bold text-xs text-wood-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-gold-600" />
              <span>เพิ่มหมวดหมู่ใหม่</span>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-2.5">
              <div>
                <label className="block text-wood-700 font-medium mb-1">
                  ชื่อหมวดหมู่ภาษาไทย <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ซุ้มประตูวัด, ไม้สักทองสวนป่า"
                  value={newNameTh}
                  onChange={(e) => setNewNameTh(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs text-wood-950 bg-white focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-wood-700 font-medium mb-1">คำอธิบายหมวดหมู่ (ไม่บังคับ)</label>
                <input
                  type="text"
                  placeholder="เช่น สเปกงานสั่งทำพิเศษ"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs text-wood-950 bg-white focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-gold text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มหมวดหมู่นี้ลงในระบบ</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-wood-50 border-t border-wood-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-wood-900 text-white hover:bg-wood-800 font-semibold text-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
