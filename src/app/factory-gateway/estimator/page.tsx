'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  RotateCcw,
  Layers,
  Sparkles,
  TreeDeciduous,
  Ruler,
  Sliders,
  DollarSign,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import {
  WorkTypeConfig,
  WoodGradeConfig,
  CarvingLevelConfig,
  EstimatorConfig
} from '@/types';
import {
  getEstimatorConfig,
  saveEstimatorConfig,
  resetEstimatorConfig,
  DEFAULT_ESTIMATOR_CONFIG
} from '@/lib/store';
import { formatThaiCurrency } from '@/lib/utils';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export default function AdminEstimatorPage() {
  const [activeTab, setActiveTab] = useState<'workTypes' | 'multipliers' | 'simulator'>('workTypes');
  const [config, setConfig] = useState<EstimatorConfig>(DEFAULT_ESTIMATOR_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Modal / Form state for Work Type
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [workForm, setWorkForm] = useState<WorkTypeConfig>({
    id: '',
    name: '',
    basePrice: 10000,
    unit: 'ชุด',
    defaultW: 2.0,
    defaultH: 2.0,
    wLabel: 'ความกว้าง (เมตร)',
    hLabel: 'ความสูง (เมตร)',
    desc: '',
  });

  // Modal / Form state for Wood Grade
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [editingGradeIndex, setEditingGradeIndex] = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState<WoodGradeConfig>({
    id: '',
    name: '',
    multiplier: 1.0,
    desc: '',
  });

  // Modal / Form state for Carving Level
  const [carvingModalOpen, setCarvingModalOpen] = useState(false);
  const [editingCarvingIndex, setEditingCarvingIndex] = useState<number | null>(null);
  const [carvingForm, setCarvingForm] = useState<CarvingLevelConfig>({
    id: '',
    name: '',
    multiplier: 1.0,
    desc: '',
  });

  // Live Simulator state inside Admin
  const [simWorkIndex, setSimWorkIndex] = useState(0);
  const [simGradeIndex, setSimGradeIndex] = useState(0);
  const [simCarvingIndex, setSimCarvingIndex] = useState(0);
  const [simW, setSimW] = useState(2.0);
  const [simH, setSimH] = useState(2.0);
  const [simQty, setSimQty] = useState(1);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getEstimatorConfig();
      setConfig(data);
      if (data.workTypes && data.workTypes.length > 0) {
        setSimW(data.workTypes[0].defaultW);
        setSimH(data.workTypes[0].defaultH);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { confirm, alert: customAlert } = useConfirmDialog();

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await saveEstimatorConfig(config);
      setSaveSuccess('บันทึกการตั้งค่าระบบคำนวณราคาเรียบร้อยแล้ว!');
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err) {
      await customAlert({
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถบันทึกข้อมูลการตั้งค่าราคาได้ในขณะนี้',
        variant: 'danger',
      });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = async () => {
    const ok = await confirm({
      title: 'คืนค่ามาตรฐานโรงงาน',
      message: 'คุณต้องการรีเซ็ตการตั้งค่าราคาทั้งหมดกลับเป็นค่าเริ่มต้นจากโรงงานใช่หรือไม่?\nการกระทำนี้จะเขียนทับการตั้งค่าปัจจุบันทั้งหมด',
      confirmText: 'ยืนยันคืนค่า',
      cancelText: 'ยกเลิก',
      variant: 'warning',
    });
    if (ok) {
      setIsSaving(true);
      try {
        const def = await resetEstimatorConfig();
        setConfig(def);
        setSaveSuccess('รีเซ็ตการตั้งค่าเป็นค่ามาตรฐานเรียบร้อยแล้ว');
        setTimeout(() => setSaveSuccess(null), 3500);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Work Types Handlers
  const handleOpenAddWork = () => {
    setEditingWorkIndex(null);
    setWorkForm({
      id: `work_${Date.now()}`,
      name: '',
      basePrice: 20000,
      unit: 'ชุด',
      defaultW: 2.0,
      defaultH: 2.0,
      wLabel: 'ความกว้าง (เมตร)',
      hLabel: 'ความสูง (เมตร)',
      desc: '',
    });
    setWorkModalOpen(true);
  };

  const handleOpenEditWork = (index: number) => {
    setEditingWorkIndex(index);
    setWorkForm({ ...config.workTypes[index] });
    setWorkModalOpen(true);
  };

  const handleSaveWorkForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workForm.name.trim()) return;

    const updated = [...config.workTypes];
    if (editingWorkIndex !== null) {
      updated[editingWorkIndex] = { ...workForm };
    } else {
      updated.push({
        ...workForm,
        id: workForm.id || `work_${Date.now()}`,
      });
    }

    setConfig({ ...config, workTypes: updated });
    setWorkModalOpen(false);
  };

  const handleDeleteWork = async (index: number) => {
    if (config.workTypes.length <= 1) {
      await customAlert({
        title: 'ไม่สามารถลบได้',
        message: 'ระบบจำเป็นต้องมีประเภทงานอย่างน้อย 1 รายการ',
        variant: 'warning',
      });
      return;
    }
    const item = config.workTypes[index];
    const ok = await confirm({
      title: 'ลบประเภทงาน',
      message: `คุณต้องการลบประเภทงาน "${item.name}" ออกจากระบบคำนวณราคาใช่หรือไม่?`,
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      const updated = config.workTypes.filter((_, i) => i !== index);
      setConfig({ ...config, workTypes: updated });
      if (simWorkIndex >= updated.length) setSimWorkIndex(0);
    }
  };

  // Wood Grades Handlers
  const handleOpenAddGrade = () => {
    setEditingGradeIndex(null);
    setGradeForm({
      id: `grade_${Date.now()}`,
      name: '',
      multiplier: 1.0,
      desc: '',
    });
    setGradeModalOpen(true);
  };

  const handleOpenEditGrade = (index: number) => {
    setEditingGradeIndex(index);
    setGradeForm({ ...config.woodGrades[index] });
    setGradeModalOpen(true);
  };

  const handleSaveGradeForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeForm.name.trim()) return;

    const updated = [...config.woodGrades];
    if (editingGradeIndex !== null) {
      updated[editingGradeIndex] = { ...gradeForm };
    } else {
      updated.push({
        ...gradeForm,
        id: gradeForm.id || `grade_${Date.now()}`,
      });
    }

    setConfig({ ...config, woodGrades: updated });
    setGradeModalOpen(false);
  };

  const handleDeleteGrade = async (index: number) => {
    if (config.woodGrades.length <= 1) {
      await customAlert({
        title: 'ไม่สามารถลบได้',
        message: 'ระบบจำเป็นต้องมีเกรดไม้อย่างน้อย 1 รายการ',
        variant: 'warning',
      });
      return;
    }
    const item = config.woodGrades[index];
    const ok = await confirm({
      title: 'ลบเกรดไม้สัก',
      message: `คุณต้องการลบเกรดไม้ "${item.name}" ออกจากการคำนวณใช่หรือไม่?`,
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      const updated = config.woodGrades.filter((_, i) => i !== index);
      setConfig({ ...config, woodGrades: updated });
      if (simGradeIndex >= updated.length) setSimGradeIndex(0);
    }
  };

  // Carving Levels Handlers
  const handleOpenAddCarving = () => {
    setEditingCarvingIndex(null);
    setCarvingForm({
      id: `carving_${Date.now()}`,
      name: '',
      multiplier: 1.0,
      desc: '',
    });
    setCarvingModalOpen(true);
  };

  const handleOpenEditCarving = (index: number) => {
    setEditingCarvingIndex(index);
    setCarvingForm({ ...config.carvingLevels[index] });
    setCarvingModalOpen(true);
  };

  const handleSaveCarvingForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carvingForm.name.trim()) return;

    const updated = [...config.carvingLevels];
    if (editingCarvingIndex !== null) {
      updated[editingCarvingIndex] = { ...carvingForm };
    } else {
      updated.push({
        ...carvingForm,
        id: carvingForm.id || `carving_${Date.now()}`,
      });
    }

    setConfig({ ...config, carvingLevels: updated });
    setCarvingModalOpen(false);
  };

  const handleDeleteCarving = async (index: number) => {
    if (config.carvingLevels.length <= 1) {
      await customAlert({
        title: 'ไม่สามารถลบได้',
        message: 'ระบบจำเป็นต้องมีระดับลายแกะสลักอย่างน้อย 1 รายการ',
        variant: 'warning',
      });
      return;
    }
    const item = config.carvingLevels[index];
    const ok = await confirm({
      title: 'ลบลายแกะสลัก',
      message: `คุณต้องการลบลายแกะสลัก "${item.name}" ออกจากการคำนวณใช่หรือไม่?`,
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      const updated = config.carvingLevels.filter((_, i) => i !== index);
      setConfig({ ...config, carvingLevels: updated });
      if (simCarvingIndex >= updated.length) setSimCarvingIndex(0);
    }
  };

  // Simulator Calculation
  const calculateSimPrice = () => {
    const currentWork = config.workTypes[simWorkIndex] || config.workTypes[0];
    const currentGrade = config.woodGrades[simGradeIndex] || config.woodGrades[0];
    const currentCarving = config.carvingLevels[simCarvingIndex] || config.carvingLevels[0];

    if (!currentWork) return { min: 0, max: 0, base: 0, finalBase: 0, gradeMult: 1, carvingMult: 1, minMult: 0.95, maxMult: 1.15 };

    let base = currentWork.basePrice;
    let finalBase = base;
    if (currentWork.id === 'wall') {
      const area = simW * simH;
      finalBase = base * Math.max(1, area);
    } else {
      const defW = currentWork.defaultW || 1;
      const defH = currentWork.defaultH || 1;
      const sizeRatio = (simW * simH) / (defW * defH);
      finalBase = base * Math.pow(Math.max(0.1, sizeRatio), 0.85);
    }

    const gradeMult = currentGrade?.multiplier || 1.0;
    const carvingMult = currentCarving?.multiplier || 1.0;
    const minMult = config.minPriceMultiplier ?? 0.95;
    const maxMult = config.maxPriceMultiplier ?? 1.15;

    const totalMin = Math.round(finalBase * gradeMult * carvingMult * simQty * minMult);
    const totalMax = Math.round(finalBase * gradeMult * carvingMult * simQty * maxMult);

    return {
      min: Math.round(totalMin / 500) * 500,
      max: Math.round(totalMax / 500) * 500,
      base,
      finalBase: Math.round(finalBase),
      gradeMult,
      carvingMult,
      minMult,
      maxMult,
    };
  };

  const simResult = calculateSimPrice();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8DFD5] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2D1B0E] text-[#C59139] flex items-center justify-center shadow-md">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2D1B0E] font-serif">
              จัดการระบบคำนวณราคา (Price Estimator)
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6450] font-light mt-0.5">
              กำหนดราคาฐาน ประเภทงาน สัดส่วนขนาด ตัวคูณเกรดไม้สัก และลายแกะสลัก
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-[#E8DFD5] bg-white hover:bg-[#FAF5EE] text-[#7A6450] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="รีเซ็ตค่ามาตรฐาน"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">คืนค่าเริ่มต้น</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="btn-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E8DFD5] space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('workTypes')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'workTypes'
              ? 'border-[#C59139] text-[#2D1B0E]'
              : 'border-transparent text-[#8C735A] hover:text-[#2D1B0E]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#C59139]" />
          <span>1. ประเภทงาน & ราคาฐาน ({config.workTypes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('multipliers')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'multipliers'
              ? 'border-[#C59139] text-[#2D1B0E]'
              : 'border-transparent text-[#8C735A] hover:text-[#2D1B0E]'
          }`}
        >
          <TreeDeciduous className="w-4 h-4 text-[#C59139]" />
          <span>2. เกรดไม้, ลายแกะสลัก & ช่วงส่วนต่าง</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'border-[#C59139] text-[#2D1B0E]'
              : 'border-transparent text-[#8C735A] hover:text-[#2D1B0E]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#C59139]" />
          <span>3. ทดสอบคำนวณราคาจริง (Live Simulator)</span>
        </button>
      </div>

      {/* TAB 1: Work Types Management */}
      {activeTab === 'workTypes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-[#7A6450]">
              กำหนดประเภทงานสถาปัตยกรรมไม้สัก ราคาฐานเริ่มต้น (Base Price) และขนาดมาตรฐาน
            </p>
            <button
              type="button"
              onClick={handleOpenAddWork}
              className="px-4 py-2 bg-[#2D1B0E] hover:bg-[#3D2513] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#C59139]" />
              <span>เพิ่มประเภทงานใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.workTypes.map((work, idx) => (
              <div
                key={work.id || idx}
                className="bg-white rounded-2xl border border-[#E8DFD5] p-5 space-y-4 shadow-xs hover:border-[#C59139]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-[#2D1B0E] leading-snug">
                      {work.name}
                    </h3>
                    <span className="bg-[#FAF5EE] text-[#C59139] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#E0D0BE] shrink-0">
                      {work.unit}
                    </span>
                  </div>

                  <p className="text-xs text-[#7A6450] font-light leading-relaxed line-clamp-2">
                    {work.desc || 'ไม่มีคำอธิบาย'}
                  </p>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5] space-y-1.5 text-xs text-[#5C4A3A]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C735A]">ราคาฐาน (เริ่มต้น):</span>
                      <span className="font-bold text-[#A87424]">
                        {formatThaiCurrency(work.basePrice)} บาท
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C735A]">ขนาดมาตรฐาน:</span>
                      <span className="font-medium text-[#2D1B0E]">
                        {work.defaultW} x {work.defaultH} ม.
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8C735A]">ป้ายชื่อขนาด:</span>
                      <span className="text-[#5C4A3A] truncate max-w-[150px]">
                        {work.wLabel} / {work.hLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditWork(idx)}
                    className="p-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#E8DFD5] text-[#2D1B0E] text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#C59139]" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWork(idx)}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 border border-[#E8DFD5] hover:border-red-200 text-red-600 text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Wood Grades, Carving & Margin Management */}
      {activeTab === 'multipliers' && (
        <div className="space-y-6">
          {/* Margin Multiplier Settings */}
          <div className="bg-white rounded-3xl border border-[#E8DFD5] p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C59139]" />
              <h2 className="font-bold text-base text-[#2D1B0E]">
                กำหนดช่วงส่วนต่างราคาประเมิน (Price Range Margin)
              </h2>
            </div>
            <p className="text-xs text-[#7A6450] font-light">
              ระบบหน้าเว็บจะแสดงช่วงราคาต่ำสุด - สูงสุด เช่น 0.95 = ลดลง 5% จากฐาน และ 1.15 = เพิ่มขึ้น 15% เผื่อรายละเอียดหน้างาน
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2">
                <label className="text-xs font-bold text-[#2D1B0E] block">
                  ตัวคูณราคาต่ำสุด (Min Multiplier)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="1.5"
                    value={config.minPriceMultiplier ?? 0.95}
                    onChange={(e) =>
                      setConfig({ ...config, minPriceMultiplier: parseFloat(e.target.value) || 0.95 })
                    }
                    className="w-32 px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-sm font-bold text-[#2D1B0E] focus:ring-1 focus:ring-[#C59139]"
                  />
                  <span className="text-xs text-[#8C735A]">
                    = {Math.round(((config.minPriceMultiplier ?? 0.95) - 1) * 100)}% ของราคาประเมิน
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2">
                <label className="text-xs font-bold text-[#2D1B0E] block">
                  ตัวคูณราคาสูงสุด (Max Multiplier)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.0"
                    value={config.maxPriceMultiplier ?? 1.15}
                    onChange={(e) =>
                      setConfig({ ...config, maxPriceMultiplier: parseFloat(e.target.value) || 1.15 })
                    }
                    className="w-32 px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-sm font-bold text-[#2D1B0E] focus:ring-1 focus:ring-[#C59139]"
                  />
                  <span className="text-xs text-[#8C735A]">
                    = +{Math.round(((config.maxPriceMultiplier ?? 1.15) - 1) * 100)}% ของราคาประเมิน
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wood Grades */}
            <div className="bg-white rounded-3xl border border-[#E8DFD5] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TreeDeciduous className="w-5 h-5 text-[#C59139]" />
                  <h2 className="font-bold text-base text-[#2D1B0E]">เกรดไม้สัก (Wood Grades)</h2>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddGrade}
                  className="px-3 py-1.5 bg-[#2D1B0E] hover:bg-[#3D2513] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C59139]" />
                  <span>เพิ่มเกรด</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.woodGrades.map((grade, idx) => (
                  <div
                    key={grade.id || idx}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D1B0E]">{grade.name}</span>
                        <span className="bg-white px-2 py-0.5 text-[11px] font-bold text-[#A87424] rounded-lg border border-[#E8DFD5]">
                          x{grade.multiplier}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A6450] font-light leading-relaxed">{grade.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditGrade(idx)}
                        className="p-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#E8DFD5] text-[#2D1B0E] text-xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#C59139]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGrade(idx)}
                        className="p-2 rounded-xl bg-white hover:bg-red-50 border border-[#E8DFD5] text-red-600 text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carving Levels */}
            <div className="bg-white rounded-3xl border border-[#E8DFD5] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C59139]" />
                  <h2 className="font-bold text-base text-[#2D1B0E]">
                    ระดับลายแกะสลัก (Carving Levels)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCarving}
                  className="px-3 py-1.5 bg-[#2D1B0E] hover:bg-[#3D2513] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C59139]" />
                  <span>เพิ่มระดับลาย</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.carvingLevels.map((carving, idx) => (
                  <div
                    key={carving.id || idx}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D1B0E]">{carving.name}</span>
                        <span className="bg-white px-2 py-0.5 text-[11px] font-bold text-[#A87424] rounded-lg border border-[#E8DFD5]">
                          x{carving.multiplier}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A6450] font-light leading-relaxed">{carving.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCarving(idx)}
                        className="p-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#E8DFD5] text-[#2D1B0E] text-xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#C59139]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCarving(idx)}
                        className="p-2 rounded-xl bg-white hover:bg-red-50 border border-[#E8DFD5] text-red-600 text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Live Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Simulator Controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFD5] p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8DFD5]">
              <Calculator className="w-5 h-5 text-[#C59139]" />
              <h2 className="font-bold text-base text-[#2D1B0E]">
                จำลองการกรอกข้อมูลของลูกค้า (Simulator Tester)
              </h2>
            </div>

            {/* Select Work Type */}
            <div>
              <label className="block text-xs font-bold text-[#2D1B0E] mb-2">
                1. เลือกประเภทงาน:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {config.workTypes.map((work, idx) => (
                  <button
                    key={work.id || idx}
                    type="button"
                    onClick={() => {
                      setSimWorkIndex(idx);
                      setSimW(work.defaultW);
                      setSimH(work.defaultH);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      simWorkIndex === idx
                        ? 'border-[#C59139] bg-[#FAF5EE] font-bold text-[#2D1B0E] ring-1 ring-[#C59139]'
                        : 'border-[#E8DFD5] bg-white text-[#6B5745]'
                    }`}
                  >
                    <div>{work.name}</div>
                    <div className="text-[11px] text-[#A87424] font-normal mt-0.5">
                      ฐาน: {formatThaiCurrency(work.basePrice)} บาท/{work.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B5745] mb-1">
                  ความกว้าง (ม.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simW}
                  onChange={(e) => setSimW(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-sm font-bold text-center text-[#2D1B0E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B5745] mb-1">
                  ความสูง (ม.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simH}
                  onChange={(e) => setSimH(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-sm font-bold text-center text-[#2D1B0E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B5745] mb-1">
                  จำนวน ({config.workTypes[simWorkIndex]?.unit || 'ชิ้น'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={simQty}
                  onChange={(e) => setSimQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-sm font-bold text-center text-[#2D1B0E]"
                />
              </div>
            </div>

            {/* Select Grade */}
            <div>
              <label className="block text-xs font-bold text-[#2D1B0E] mb-2">
                2. เลือกเกรดไม้สัก:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {config.woodGrades.map((grade, idx) => (
                  <button
                    key={grade.id || idx}
                    type="button"
                    onClick={() => setSimGradeIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      simGradeIndex === idx
                        ? 'border-[#C59139] bg-[#FAF5EE] font-bold text-[#2D1B0E] ring-1 ring-[#C59139]'
                        : 'border-[#E8DFD5] bg-white text-[#6B5745]'
                    }`}
                  >
                    <div>{grade.name}</div>
                    <div className="text-[11px] text-[#A87424] font-normal">x{grade.multiplier}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Carving */}
            <div>
              <label className="block text-xs font-bold text-[#2D1B0E] mb-2">
                3. เลือกลายแกะสลัก:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {config.carvingLevels.map((carving, idx) => (
                  <button
                    key={carving.id || idx}
                    type="button"
                    onClick={() => setSimCarvingIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      simCarvingIndex === idx
                        ? 'border-[#C59139] bg-[#FAF5EE] font-bold text-[#2D1B0E] ring-1 ring-[#C59139]'
                        : 'border-[#E8DFD5] bg-white text-[#6B5745]'
                    }`}
                  >
                    <div>{carving.name}</div>
                    <div className="text-[11px] text-[#A87424] font-normal">x{carving.multiplier}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulator Output Preview */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DFD5] p-6 space-y-5 shadow-xs">
            <div className="pb-3 border-b border-[#E8DFD5] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A87424]">
                ผลลัพธ์การคำนวณสด
              </span>
              <span className="bg-[#FAF5EE] text-[#2D1B0E] text-xs font-bold px-3 py-1 rounded-full border border-[#E0D0BE]">
                {config.workTypes[simWorkIndex]?.name}
              </span>
            </div>

            <div>
              <div className="text-xs text-[#8C735A]">ช่วงราคาประเมินที่แสดงให้ลูกค้า:</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#A87424] font-serif mt-1">
                {formatThaiCurrency(simResult.min)} - {formatThaiCurrency(simResult.max)} บาท
              </div>
            </div>

            {/* Calculation Formula Breakdown */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2 text-xs text-[#5C4A3A]">
              <div className="font-bold text-[#2D1B0E] flex items-center gap-1.5 pb-1 border-b border-[#E8DFD5]">
                <Info className="w-3.5 h-3.5 text-[#C59139]" />
                <span>สูตรการคำนวณที่ใช้:</span>
              </div>
              <div className="flex justify-between">
                <span>ราคาฐานเริ่มต้น:</span>
                <span className="font-semibold">{formatThaiCurrency(simResult.base)} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ราคาปรับตามขนาดจริง:</span>
                <span className="font-semibold">{formatThaiCurrency(simResult.finalBase)} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ตัวคูณเกรดไม้:</span>
                <span className="font-semibold">x{simResult.gradeMult}</span>
              </div>
              <div className="flex justify-between">
                <span>ตัวคูณลายแกะสลัก:</span>
                <span className="font-semibold">x{simResult.carvingMult}</span>
              </div>
              <div className="flex justify-between">
                <span>จำนวนชิ้น:</span>
                <span className="font-semibold">{simQty}</span>
              </div>
              <div className="flex justify-between text-[#A87424] pt-1 border-t border-[#E8DFD5]">
                <span>ช่วงส่วนต่างโรงงาน:</span>
                <span className="font-bold">x{simResult.minMult} ถึง x{simResult.maxMult}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Work Type */}
      {workModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8DFD5]">
            <div className="p-5 bg-[#2D1B0E] text-white flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C59139]" />
                <span>{editingWorkIndex !== null ? 'แก้ไขประเภทงาน' : 'เพิ่มประเภทงานใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setWorkModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkForm} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  ชื่อประเภทงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หน้าจั่วทรงไทยเมืองเพชร หรือ ประตูไม้สักแกะสลัก"
                  value={workForm.name}
                  onChange={(e) => setWorkForm({ ...workForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                    ราคาฐาน (บาท) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={workForm.basePrice}
                    onChange={(e) =>
                      setWorkForm({ ...workForm, basePrice: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                    หน่วยนับ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ชุด, คู่, ตร.ม., หลัง"
                    value={workForm.unit}
                    onChange={(e) => setWorkForm({ ...workForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                    ความกว้างเริ่มต้น (ม.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={workForm.defaultW}
                    onChange={(e) =>
                      setWorkForm({ ...workForm, defaultW: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                    ความสูงเริ่มต้น (ม.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={workForm.defaultH}
                    onChange={(e) =>
                      setWorkForm({ ...workForm, defaultH: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C4A3A] mb-1">
                    ป้ายกำกับความกว้าง
                  </label>
                  <input
                    type="text"
                    value={workForm.wLabel}
                    onChange={(e) => setWorkForm({ ...workForm, wLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs text-[#2D1B0E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5C4A3A] mb-1">
                    ป้ายกำกับความสูง
                  </label>
                  <input
                    type="text"
                    value={workForm.hLabel}
                    onChange={(e) => setWorkForm({ ...workForm, hLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs text-[#2D1B0E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  คำอธิบายสเปก
                </label>
                <textarea
                  rows={3}
                  placeholder="เช่น หน้าจั่วไม้สักแท้ พร้อมกระจัง บราเกล็ด และปั้นลม"
                  value={workForm.desc}
                  onChange={(e) => setWorkForm({ ...workForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWorkModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-xs font-semibold text-[#6B5745] hover:bg-[#FAF5EE]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2 rounded-xl text-xs font-bold shadow-md"
                >
                  บันทึกประเภทงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Wood Grade */}
      {gradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E8DFD5]">
            <div className="p-5 bg-[#2D1B0E] text-white flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <TreeDeciduous className="w-4 h-4 text-[#C59139]" />
                <span>{editingGradeIndex !== null ? 'แก้ไขเกรดไม้สัก' : 'เพิ่มเกรดไม้สัก'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setGradeModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGradeForm} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  ชื่อเกรดไม้สัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ไม้สักทองคัดพิเศษ (เกรด A)"
                  value={gradeForm.name}
                  onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  ตัวคูณราคา (Multiplier) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="5.0"
                  required
                  value={gradeForm.multiplier}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, multiplier: parseFloat(e.target.value) || 1.0 })
                  }
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
                <p className="text-[11px] text-[#8C735A] mt-1">
                  เช่น 1.0 คือราคาปกติ, 1.25 คือบวกเพิ่ม 25%
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  คำอธิบายจุดเด่น
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ลายแก่นไม้เข้มจัด ความชื้นต่ำ ไร้รอยตามด"
                  value={gradeForm.desc}
                  onChange={(e) => setGradeForm({ ...gradeForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradeModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-xs font-semibold text-[#6B5745] hover:bg-[#FAF5EE]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2 rounded-xl text-xs font-bold shadow-md"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Carving Level */}
      {carvingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E8DFD5]">
            <div className="p-5 bg-[#2D1B0E] text-white flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C59139]" />
                <span>{editingCarvingIndex !== null ? 'แก้ไขลายแกะสลัก' : 'เพิ่มลายแกะสลัก'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCarvingModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCarvingForm} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  ชื่อระดับลายแกะสลัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แกะสลักลายกนกเพชรบุรีมาตรฐาน"
                  value={carvingForm.name}
                  onChange={(e) => setCarvingForm({ ...carvingForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  ตัวคูณราคา (Multiplier) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="5.0"
                  required
                  value={carvingForm.multiplier}
                  onChange={(e) =>
                    setCarvingForm({ ...carvingForm, multiplier: parseFloat(e.target.value) || 1.0 })
                  }
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
                <p className="text-[11px] text-[#8C735A] mt-1">
                  เช่น 1.0 เรียบหรู, 1.2 ลายกนก, 1.45 วิจิตรศิลป์ลอยตัว
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1B0E] mb-1">
                  คำอธิบายลวดลาย
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ลายกนกเปลวเพลิง ประจำยาม และบัวคว่ำบัวหงาย"
                  value={carvingForm.desc}
                  onChange={(e) => setCarvingForm({ ...carvingForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E8DFD5] rounded-xl text-xs sm:text-sm text-[#2D1B0E] focus:ring-2 focus:ring-[#C59139]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCarvingModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-xs font-semibold text-[#6B5745] hover:bg-[#FAF5EE]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2 rounded-xl text-xs font-bold shadow-md"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
