'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Search,
  AlertCircle,
  X,
  Boxes,
  Minus,
  TrendingDown,
  Layers,
  FolderTree,
  LayoutGrid,
  List,
  Filter,
  Send,
  Printer,
  FileSpreadsheet,
  FileText,
  PackagePlus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  getInventory,
  saveInventoryItem,
  deleteInventoryItem,
  updateInventoryQty,
  getCategories
} from '@/lib/store';
import { InventoryItem, CategoryItem } from '@/types';
import CategoryManagerModal from '@/components/admin/CategoryManagerModal';
import TelegramSettingsModal from '@/components/admin/TelegramSettingsModal';
import InventoryReportModal from '@/components/admin/InventoryReportModal';
import InventoryReorderModal from '@/components/admin/InventoryReorderModal';
import CustomSelect from '@/components/ui/CustomSelect';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reorderItem, setReorderItem] = useState<InventoryItem | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [tgModalOpen, setTgModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<string>('timber');
  const [specification, setSpecification] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('แผ่น');
  const [minThreshold, setMinThreshold] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const loadData = async () => {
    const [invData, catData] = await Promise.all([
      getInventory(),
      getCategories('inventory')
    ]);
    setInventory(invData);
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
    setEditingItem(null);
    setItemName('');
    setCategory(categories[0]?.id || 'timber');
    setSpecification('ไม้สักทองคัดเกรด A ความชื้น 12-14% ไร้กระพี้');
    setQuantity(20);
    setUnit('แผ่น');
    setMinThreshold(5);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setItemName(item.item_name);
    setCategory(item.category);
    setSpecification(item.specification);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setMinThreshold(item.min_threshold);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!itemName.trim()) {
      setFormError('กรุณากรอกชื่อวัสดุหรือประเภทไม้สัก');
      return;
    }

    setIsSaving(true);

    const matchedCat = categories.find(c => c.id === category);
    const categoryNameTh = matchedCat?.name_th || 'วัสดุและอุปกรณ์';

    const status: InventoryItem['status'] =
      quantity === 0 ? 'out_of_stock' : quantity <= minThreshold ? 'low_stock' : 'in_stock';

    try {
      const saved = await saveInventoryItem({
        id: editingItem ? editingItem.id : `inv-${Date.now()}`,
        item_name: itemName.trim(),
        category,
        category_name_th: categoryNameTh,
        specification: specification.trim(),
        quantity: Number(quantity),
        unit: unit.trim() || 'ชิ้น',
        min_threshold: Number(minThreshold),
        status,
        last_restocked: new Date().toISOString().split('T')[0],
      });

      setModalOpen(false);
      setSaveSuccess(`บันทึกรายการสต็อก "${saved.item_name}" สำเร็จ`);
      setTimeout(() => setSaveSuccess(null), 3500);
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const ok = await confirm({
      title: 'ยืนยันการลบวัสดุ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${item.item_name}" ออกจากระบบสต็อก?`,
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      await deleteInventoryItem(id);
      setSaveSuccess(`ลบรายการ "${item.item_name}" เรียบร้อยแล้ว`);
      setTimeout(() => setSaveSuccess(null), 3000);
      await loadData();
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    await updateInventoryQty(id, delta);
    await loadData();
  };

  const handleDirectExportExcel = () => {
    if (inventory.length === 0) {
      alert('ไม่มีข้อมูลวัสดุในระบบ');
      return;
    }

    const rows = inventory.map((item, index) => ({
      'ลำดับ': index + 1,
      'ชื่อรายการวัสดุ / ไม้สัก': item.item_name,
      'หมวดหมู่': item.category_name_th || item.category,
      'สเปก / ขนาด / เกรด': item.specification || '-',
      'คงเหลือ': item.quantity,
      'หน่วยนับ': item.unit,
      'เกณฑ์เตือนขั้นต่ำ': item.min_threshold,
      'สถานะสต็อก':
        item.status === 'out_of_stock'
          ? 'หมดสต็อก'
          : item.status === 'low_stock'
          ? 'ใกล้หมด (ต้องสั่งเพิ่ม)'
          : 'พร้อมใช้งาน',
      'อัปเดตสต็อคล่าสุด': item.last_restocked || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 18 },
      { wch: 35 },
      { wch: 12 },
      { wch: 10 },
      { wch: 16 },
      { wch: 22 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'สต็อกวัสดุทั้งหมด');
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `สต็อกไม้และวัสดุ_โรงงานฝาทรงไทย_${dateStr}.xlsx`);
  };

  const filtered = inventory.filter((item) => {
    const matchSearch =
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchLowStock = !showLowStockOnly || item.status === 'low_stock' || item.status === 'out_of_stock';
    return matchSearch && matchCat && matchLowStock;
  });

  const lowStockCount = inventory.filter(
    (i) => i.status === 'low_stock' || i.status === 'out_of_stock'
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wood-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wood-950 font-serif">
            จัดการสต็อกไม้และวัสดุ (Inventory Manager)
          </h1>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            ควบคุมปริมาณสต็อกไม้สักทอง อุปกรณ์ฟิตติ้ง และระบบแจ้งเตือนของใกล้หมด
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2.5">
          {/* Action Tools Row */}
          <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
            {/* Quick Direct Excel Export */}
            <button
              onClick={handleDirectExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs transition-all shadow-2xs active:scale-95"
              title="ดาวน์โหลดรายการสต็อกทั้งหมดเป็นไฟล์ Excel (.xlsx) ทันที"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">ส่งออก Excel</span>
            </button>

            {/* Printable Stock Report Modal */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-wood-300 bg-white hover:bg-wood-50 text-wood-900 font-semibold text-xs transition-all shadow-2xs active:scale-95"
              title="เปิดหน้าต่างเลือกเงื่อนไขพิมพ์รายงานสต็อก A4 / PDF"
            >
              <Printer className="w-4 h-4 text-gold-600" />
              <span>พิมพ์รายงานสต็อก (PDF)</span>
            </button>

            <button
              onClick={() => setTgModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-xs transition-all shadow-2xs active:scale-95"
              title="ตั้งค่าแจ้งเตือน Telegram (สรุปสต็อก 08:00 น. / เตือนของใกล้หมด 3 เวลา)"
            >
              <Send className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">แจ้งเตือน Telegram</span>
            </button>

            <button
              onClick={() => setCatModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-wood-300 bg-white text-wood-800 hover:bg-wood-50 font-semibold text-xs transition-all shadow-2xs"
            >
              <FolderTree className="w-4 h-4 text-gold-600" />
              <span className="hidden sm:inline">จัดการหมวดหมู่</span>
            </button>
          </div>

          {/* Primary Action Button - Right Aligned */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gold text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 self-end"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการวัสดุใหม่</span>
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

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-wood-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-wood-100 text-wood-800">
            <Boxes className="w-6 h-6 text-gold-700" />
          </div>
          <div>
            <div className="text-xs text-wood-500 font-semibold">จำนวนรายการทั้งหมด</div>
            <div className="text-2xl font-bold text-wood-950">{inventory.length} รายการ</div>
          </div>
        </div>

        <div 
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-xs flex items-center justify-between gap-4 ${
            showLowStockOnly
              ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-400'
              : 'bg-white border-wood-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-amber-800 font-semibold flex items-center gap-1.5">
                <span>รายการที่ต้องสั่งเพิ่ม</span>
                {showLowStockOnly && (
                  <span className="text-[10px] bg-amber-700 text-white px-1.5 py-0.2 rounded-full font-bold">
                    กำลังกรอง
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-amber-600">{lowStockCount} รายการ</div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 underline">
            {showLowStockOnly ? 'แสดงทั้งหมด' : 'ดูเฉพาะกลุ่มนี้'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-wood-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-emerald-800 font-semibold">สต็อกพร้อมใช้งาน</div>
            <div className="text-2xl font-bold text-emerald-700">
              {inventory.filter((i) => i.status === 'in_stock').length} รายการ
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Switcher Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-wood-200 shadow-2xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-wood-950 text-white shadow-xs'
                : 'bg-wood-50 text-wood-700 hover:bg-wood-100 border border-wood-200'
            }`}
          >
            ทั้งหมด ({inventory.length})
          </button>
          {categories.map((cat) => {
            const count = inventory.filter((i) => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-wood-950 text-white shadow-xs'
                    : 'bg-wood-50 text-wood-700 hover:bg-wood-100 border border-wood-200'
                }`}
              >
                {cat.name_th} ({count})
              </button>
            );
          })}
        </div>

        {/* Right Controls: Low Stock Filter, Search Box & View Mode Toggle */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
          {/* Low Stock Quick Filter */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              showLowStockOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-wood-700 border-wood-200 hover:bg-amber-50/60'
            }`}
            title="กรองเฉพาะรายการของใกล้หมดหรือหมดสต็อก"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>ใกล้หมด/หมด ({lowStockCount})</span>
          </button>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-wood-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อไม้สัก, สเปก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-wood-300 text-xs text-wood-950 bg-wood-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {/* View Switcher: Cards vs Table */}
          <div className="inline-flex items-center p-1 bg-wood-100 rounded-xl border border-wood-200 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-wood-950 shadow-xs'
                  : 'text-wood-600 hover:text-wood-950'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-gold-600" />
              <span>การ์ด</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-wood-950 shadow-xs'
                  : 'text-wood-600 hover:text-wood-950'
              }`}
            >
              <List className="w-3.5 h-3.5 text-gold-600" />
              <span>ตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Cards View or Table View */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-wood-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-wood-100 flex items-center justify-center text-wood-400">
            <Boxes className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-wood-900 font-serif mb-1">
            ไม่พบรายการวัสดุที่ตรงกับการค้นหา
          </h3>
          <p className="text-xs text-wood-500 mb-4">
            ลองปรับเปลี่ยนคำค้นหา หรือยกเลิกตัวกรองหมวดหมู่และสถานะสต็อก
          </p>
          {(searchQuery || selectedCategory !== 'all' || showLowStockOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowLowStockOnly(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gold-700 bg-gold-50 border border-gold-200 hover:bg-gold-100 transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isOutOfStock = item.status === 'out_of_stock';
            const isLowStock = item.status === 'low_stock';
            const capacityRef = Math.max(item.min_threshold * 2.5, item.quantity, 10);
            const percent = Math.min(100, Math.round((item.quantity / capacityRef) * 100));

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-wood-200 hover:border-gold-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-wood-100 text-wood-800 text-[11px] font-medium">
                      {item.category_name_th}
                    </span>

                    {isOutOfStock ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
                        หมดสต็อก
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        ใกล้หมด
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        พร้อมใช้งาน
                      </span>
                    )}
                  </div>

                  {/* Material Name */}
                  <h3 className="text-base font-bold text-wood-950 group-hover:text-gold-700 transition-colors">
                    {item.item_name}
                  </h3>

                  {/* Specification */}
                  <p className="text-xs text-wood-600 mt-2 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {item.specification || 'ไม่มีรายละเอียดสเปกเพิ่มเติม'}
                  </p>

                  {/* Stock Level Bar & Visual Indicator */}
                  <div className="mt-4 p-3 rounded-2xl bg-wood-50/70 border border-wood-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-wood-500 font-medium">ระดับสต็อกคงเหลือ:</span>
                      <span className="font-bold text-wood-950">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-wood-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isOutOfStock
                            ? 'bg-red-500'
                            : isLowStock
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-wood-400">
                      <span>เตือนเมื่อ &le; {item.min_threshold} {item.unit}</span>
                      <span>อัปเดต: {item.last_restocked}</span>
                    </div>
                  </div>

                  {/* Reorder / PO Action Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => setReorderItem(item)}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-2xs border ${
                        item.status === 'out_of_stock'
                          ? 'bg-red-50 hover:bg-red-100 text-red-900 border-red-300'
                          : item.status === 'low_stock'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-wood-50 hover:bg-wood-100 text-wood-800 border-wood-200'
                      }`}
                      title="ออกใบขอสั่งซื้อ / สั่งไม้เพิ่ม (PO Slip) ส่งร้านค้าไม้"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-gold-700" />
                      <span>{item.quantity <= item.min_threshold ? '🚨 ออกใบสั่งซื้อด่วน (PO)' : 'ออกใบสั่งซื้อ/ขอเบิก (PO)'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Footer: Quick Adjust Stepper & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-wood-100 flex items-center justify-between gap-2">
                  {/* Stepper */}
                  <div className="inline-flex items-center gap-1 border border-wood-200 rounded-xl p-1 bg-wood-50">
                    <button
                      onClick={() => handleAdjustStock(item.id, -1)}
                      className="p-1.5 rounded-lg bg-white hover:bg-wood-200 text-wood-700 shadow-2xs transition-colors active:scale-95"
                      title="ลด 1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 font-bold text-xs text-wood-950 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleAdjustStock(item.id, 1)}
                      className="p-1.5 rounded-lg bg-white hover:bg-wood-200 text-wood-700 shadow-2xs transition-colors active:scale-95"
                      title="เพิ่ม 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl text-wood-600 hover:text-wood-950 hover:bg-wood-100 transition-colors"
                      title="แก้ไขข้อมูลวัสดุ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-wood-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Existing Structured Table View */
        <div className="bg-white rounded-2xl border border-wood-200 p-6 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-wood-100 text-wood-400 uppercase font-semibold">
                <th className="pb-3">รายการวัสดุ / ไม้สัก</th>
                <th className="pb-3">หมวดหมู่</th>
                <th className="pb-3">สเปกและรายละเอียด</th>
                <th className="pb-3 text-center">คงเหลือในสต็อก</th>
                <th className="pb-3 text-center">ปรับสต็อกด่วน</th>
                <th className="pb-3 text-center">สถานะ</th>
                <th className="pb-3 text-center">ใบสั่งซื้อ</th>
                <th className="pb-3 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-wood-50/60 transition-colors">
                  <td className="py-4 font-semibold text-wood-950 max-w-xs">
                    <div>{item.item_name}</div>
                    <div className="text-[10px] text-wood-400 font-normal">
                      อัปเดตล่าสุด: {item.last_restocked}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-md bg-wood-100 text-wood-800 font-medium">
                      {item.category_name_th}
                    </span>
                  </td>
                  <td className="py-4 text-wood-600 max-w-xs">
                    <p className="line-clamp-2">{item.specification}</p>
                  </td>
                  <td className="py-4 text-center">
                    <span className="font-bold text-sm text-wood-950">{item.quantity}</span>{' '}
                    <span className="text-wood-500 text-[11px]">{item.unit}</span>
                    <div className="text-[10px] text-wood-400">เตือนเมื่อ &le; {item.min_threshold}</div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="inline-flex items-center gap-1 border border-wood-200 rounded-xl p-1 bg-wood-50">
                      <button
                        onClick={() => handleAdjustStock(item.id, -1)}
                        className="p-1 rounded-lg bg-white hover:bg-wood-200 text-wood-700 shadow-2xs transition-colors"
                        title="ลด 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-bold text-xs text-wood-900">{item.quantity}</span>
                      <button
                        onClick={() => handleAdjustStock(item.id, 1)}
                        className="p-1 rounded-lg bg-white hover:bg-wood-200 text-wood-700 shadow-2xs transition-colors"
                        title="เพิ่ม 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    {item.status === 'out_of_stock' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                        หมดสต็อก
                      </span>
                    ) : item.status === 'low_stock' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        ใกล้หมด
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        พร้อมใช้งาน
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    <button
                      onClick={() => setReorderItem(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 whitespace-nowrap shadow-2xs ${
                        item.status === 'out_of_stock'
                          ? 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100'
                          : item.status === 'low_stock'
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          : 'bg-wood-50 text-wood-700 border-wood-200 hover:bg-wood-100'
                      }`}
                      title="ออกใบสั่งซื้อ / ขอเบิกวัสดุ"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-gold-700" />
                      <span>{item.quantity <= item.min_threshold ? 'สั่งด่วน' : 'สั่งซื้อ (PO)'}</span>
                    </button>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-wood-600 hover:text-wood-950 hover:bg-wood-100 transition-colors"
                        title="แก้ไขรายการ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-wood-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="ลบรายการ"
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
      )}

      {/* Modal Add / Edit Inventory Item */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-wood-200">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-4 sm:p-6 border-b border-wood-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wood-100 text-gold-700">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-wood-950 font-serif">
                    {editingItem ? 'แก้ไขรายการวัสดุ / ไม้สัก' : 'เพิ่มรายการสต็อกใหม่'}
                  </h2>
                  <p className="text-xs text-wood-500">
                    ระบุชื่อ สเปก จำนวนคงเหลือ และจุดแจ้งเตือนของใกล้หมด
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

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-wood-900 mb-1">
                  ชื่อวัสดุ / ประเภทไม้สัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ไม้สักทองแปรรูป หนา 2 นิ้ว x 8 นิ้ว"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-wood-900">
                      หมวดหมู่วัสดุ <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCatModalOpen(true)}
                      className="text-[11px] text-gold-700 hover:underline font-semibold"
                    >
                      + จัดการ
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
                    หน่วยนับ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แผ่น, ท่อน, ชุด, ถัง"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    จำนวนคงเหลือ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-900 mb-1">
                    จุดเตือนของใกล้หมด (&le;)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-wood-900 mb-1">
                  สเปกและคุณสมบัติ
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุเกรดไม้ ความชื้น ความยาว หรือการใช้งานที่เหมาะสม..."
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500 leading-relaxed"
                />
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
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
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
        type="inventory"
        title="จัดการหมวดหมู่วัสดุและสต็อก"
        onCategoriesChanged={loadData}
      />

      {/* Telegram Automation Settings Modal */}
      <TelegramSettingsModal
        isOpen={tgModalOpen}
        onClose={() => {
          setTgModalOpen(false);
          loadData();
        }}
      />

      {/* Inventory Stocktaking Report Modal (PDF / Excel) */}
      <InventoryReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        inventory={inventory}
        categories={categories}
      />

      {/* Material Purchase Order / Reorder Slip Modal (PO Slip / LINE Copy) */}
      <InventoryReorderModal
        isOpen={!!reorderItem}
        onClose={() => setReorderItem(null)}
        item={reorderItem}
      />
    </div>
  );
}
