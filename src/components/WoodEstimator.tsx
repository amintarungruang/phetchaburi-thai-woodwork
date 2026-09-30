'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, Send, Sparkles, Minus, Plus, PhoneCall } from 'lucide-react';
import { formatThaiCurrency } from '@/lib/utils';
import { createLead, getEstimatorConfig, DEFAULT_ESTIMATOR_CONFIG } from '@/lib/store';
import { WorkTypeConfig, WoodGradeConfig, CarvingLevelConfig, EstimatorConfig } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function WoodEstimator() {
  const { t, isEn } = useLanguage();
  const [config, setConfig] = useState<EstimatorConfig>(DEFAULT_ESTIMATOR_CONFIG);
  const [selectedWork, setSelectedWork] = useState<WorkTypeConfig>(DEFAULT_ESTIMATOR_CONFIG.workTypes[0]);
  const [selectedGrade, setSelectedGrade] = useState<WoodGradeConfig>(DEFAULT_ESTIMATOR_CONFIG.woodGrades[0]);
  const [selectedCarving, setSelectedCarving] = useState<CarvingLevelConfig>(
    DEFAULT_ESTIMATOR_CONFIG.carvingLevels[1] || DEFAULT_ESTIMATOR_CONFIG.carvingLevels[0]
  );
  const [width, setWidth] = useState(DEFAULT_ESTIMATOR_CONFIG.workTypes[0]?.defaultW || 3.5);
  const [height, setHeight] = useState(DEFAULT_ESTIMATOR_CONFIG.workTypes[0]?.defaultH || 2.2);
  const [quantity, setQuantity] = useState(1);

  // Lead Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lineId, setLineId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load dynamic estimator configuration
  useEffect(() => {
    getEstimatorConfig().then((loaded) => {
      if (loaded && loaded.workTypes && loaded.workTypes.length > 0) {
        setConfig(loaded);
        // Default to first items if not already set or not found in new list
        const defaultWork = loaded.workTypes[0];
        setSelectedWork(defaultWork);
        setWidth(defaultWork.defaultW);
        setHeight(defaultWork.defaultH);

        if (loaded.woodGrades && loaded.woodGrades.length > 0) {
          setSelectedGrade(loaded.woodGrades[0]);
        }
        if (loaded.carvingLevels && loaded.carvingLevels.length > 0) {
          setSelectedCarving(loaded.carvingLevels[1] || loaded.carvingLevels[0]);
        }
      }
    });
  }, []);

  // Calculate Price Range
  const calculatePrice = () => {
    if (!selectedWork) return { min: 0, max: 0 };
    let base = selectedWork.basePrice;
    if (selectedWork.id === 'wall') {
      const area = width * height;
      base = base * Math.max(1, area);
    } else {
      const defW = selectedWork.defaultW || 1;
      const defH = selectedWork.defaultH || 1;
      const sizeRatio = (width * height) / (defW * defH);
      base = base * Math.pow(Math.max(0.1, sizeRatio), 0.85);
    }

    const gradeMult = selectedGrade?.multiplier || 1.0;
    const carvingMult = selectedCarving?.multiplier || 1.0;
    const minMult = config.minPriceMultiplier ?? 0.95;
    const maxMult = config.maxPriceMultiplier ?? 1.15;

    const totalMin = Math.round(base * gradeMult * carvingMult * quantity * minMult);
    const totalMax = Math.round(base * gradeMult * carvingMult * quantity * maxMult);

    return { min: Math.round(totalMin / 500) * 500, max: Math.round(totalMax / 500) * 500 };
  };

  const priceResult = calculatePrice();

  const handleWorkSelect = (work: WorkTypeConfig) => {
    setSelectedWork(work);
    setWidth(work.defaultW);
    setHeight(work.defaultH);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) return;

    setSubmitting(true);
    try {
      await createLead({
        customer_name: customerName,
        phone_number: phoneNumber,
        line_id: lineId.trim() || undefined,
        interest_type: selectedWork.name,
        budget_range: `${formatThaiCurrency(priceResult.min)} - ${formatThaiCurrency(priceResult.max)}`,
        dimensions: `ขนาด ${width} x ${height} ม. (จำนวน ${quantity} ${selectedWork.unit})`,
        notes: `ประเมินจากระบบคำนวณ: ${selectedGrade.name} / ${selectedCarving.name}`,
        status: 'new',
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="estimator" className="pt-4 sm:pt-6 pb-16 sm:pb-20 bg-modern-grid border-b border-[#EAE1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C59139]">
            {t.estimator.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1B0E] mt-1 font-sans">
            {t.estimator.title}
          </h2>
          <p className="text-xs sm:text-sm sm:text-base text-[#7A6450] mt-1.5 font-light">
            {t.estimator.subtitle}
          </p>
        </div>

        {/* Estimator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-7 modern-card rounded-3xl p-6 sm:p-8 space-y-7">
            {/* Step 1: Work Type */}
            <div>
              <label className="block text-sm font-bold text-[#2D1B0E] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2D1A0E] text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>{t.estimator.step1Title}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.workTypes.map((work) => {
                  const isSelected = selectedWork.id === work.id;
                  return (
                    <button
                      key={work.id}
                      type="button"
                      onClick={() => handleWorkSelect(work)}
                      className={`p-3.5 rounded-2xl text-left border transition-all text-xs touch-target ${
                        isSelected
                          ? 'border-[#C59139] bg-[#FAF5EE] ring-2 ring-[#C59139]/30 shadow-xs'
                          : 'border-[#E8DFD5] hover:border-[#C59139]/40 bg-white/70'
                      }`}
                    >
                      <div className="font-semibold text-sm text-[#2D1B0E] flex items-center justify-between">
                        <span>{work.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C59139] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#7A6450] mt-1 font-light leading-relaxed">{work.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Dimensions & Quantity with Touch-friendly Steppers */}
            <div>
              <label className="block text-sm font-bold text-[#2D1B0E] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2D1A0E] text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>{t.estimator.dimensionsLabel}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Width */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5]">
                  <label className="text-xs font-semibold text-[#6B5745] block mb-1.5">
                    {isEn ? 'Width (m)' : selectedWork.wLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWidth((prev) => Math.max(0.5, Number((prev - 0.2).toFixed(1))))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E0D0BE] text-[#2D1B0E] flex items-center justify-center font-bold hover:bg-[#FAF5EE] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="20"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 1)}
                      className="w-full text-center py-1.5 rounded-xl border border-[#E2D5C5] bg-white font-bold text-sm text-[#2D1B0E] focus:ring-1 focus:ring-[#C59139]"
                    />
                    <button
                      type="button"
                      onClick={() => setWidth((prev) => Number((prev + 0.2).toFixed(1)))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E0D0BE] text-[#2D1B0E] flex items-center justify-center font-bold hover:bg-[#FAF5EE] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Height */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5]">
                  <label className="text-xs font-semibold text-[#6B5745] block mb-1.5">
                    {isEn ? 'Height (m)' : selectedWork.hLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHeight((prev) => Math.max(0.5, Number((prev - 0.2).toFixed(1))))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E0D0BE] text-[#2D1B0E] flex items-center justify-center font-bold hover:bg-[#FAF5EE] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="15"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 1)}
                      className="w-full text-center py-1.5 rounded-xl border border-[#E2D5C5] bg-white font-bold text-sm text-[#2D1B0E] focus:ring-1 focus:ring-[#C59139]"
                    />
                    <button
                      type="button"
                      onClick={() => setHeight((prev) => Number((prev + 0.2).toFixed(1)))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E0D0BE] text-[#2D1B0E] flex items-center justify-center font-bold hover:bg-[#FAF5EE] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5]">
                  <label className="text-xs font-semibold text-[#6B5745] block mb-1.5">
                    {isEn ? 'Quantity' : `จำนวน (${selectedWork.unit})`}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E0D0BE] text-[#2D1B0E] flex items-center justify-center font-bold hover:bg-[#FAF5EE] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full text-center py-1.5 rounded-xl border border-[#E2D5C5] bg-white font-bold text-sm text-[#2D1B0E] focus:ring-1 focus:ring-[#C59139]"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E0D0BE] text-[#2D1B0E] flex items-center justify-center font-bold hover:bg-[#FAF5EE] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Grade & Carving Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#2D1B0E] mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2D1A0E] text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>{t.estimator.woodGradeLabel}</span>
                </label>
                <div className="space-y-2">
                  {config.woodGrades.map((grade) => (
                    <label
                      key={grade.id}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                        selectedGrade.id === grade.id
                          ? 'border-[#C59139] bg-[#FAF5EE] text-[#2D1B0E] shadow-2xs'
                          : 'border-[#E8DFD5] text-[#5C4A3A] hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="wood_grade"
                        checked={selectedGrade.id === grade.id}
                        onChange={() => setSelectedGrade(grade)}
                        className="mt-0.5 text-[#C59139] focus:ring-[#C59139]"
                      />
                      <div>
                        <div className="font-semibold text-xs text-[#2D1B0E]">{grade.name}</div>
                        <div className="text-[11px] text-[#7A6450] font-light mt-0.5">{grade.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2D1B0E] mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2D1A0E] text-white text-xs flex items-center justify-center font-bold">4</span>
                  <span>{t.estimator.carvingLabel}</span>
                </label>
                <div className="space-y-2">
                  {config.carvingLevels.map((carving) => (
                    <label
                      key={carving.id}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                        selectedCarving.id === carving.id
                          ? 'border-[#C59139] bg-[#FAF5EE] text-[#2D1B0E] shadow-2xs'
                          : 'border-[#E8DFD5] text-[#5C4A3A] hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="carving_level"
                        checked={selectedCarving.id === carving.id}
                        onChange={() => setSelectedCarving(carving)}
                        className="mt-0.5 text-[#C59139] focus:ring-[#C59139]"
                      />
                      <div>
                        <div className="font-semibold text-xs text-[#2D1B0E]">{carving.name}</div>
                        <div className="text-[11px] text-[#7A6450] font-light mt-0.5">{carving.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Price Summary Card */}
          <div className="lg:col-span-5 modern-card rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="pb-3 border-b border-[#F0E6D8] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A87424]">
                {t.estimator.estimatedBudget}
              </span>
              <span className="bg-[#FAF5EE] text-[#2D1B0E] text-xs font-bold px-3 py-1 rounded-full border border-[#E0D0BE]">
                {selectedWork.name}
              </span>
            </div>

            {/* Large Price Highlight */}
            <div className="py-2">
              <div className="text-xs text-[#8C735A] font-medium">
                {isEn ? 'Estimated Workshop Budget' : 'ช่วงราคาประเมินโรงงาน'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#A87424] mt-1 font-serif">
                {formatThaiCurrency(priceResult.min)} - {formatThaiCurrency(priceResult.max)} {t.common.baht}
              </div>
              <p className="text-[11px] text-[#8C735A] mt-1.5 font-light leading-relaxed">
                {t.estimator.estimateDisclaimer}
              </p>
            </div>

            {/* Spec breakdown */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD5] space-y-2 text-xs text-[#5C4A3A]">
              <div className="flex justify-between">
                <span className="text-[#8C735A]">{t.portfolio.dimensions}:</span>
                <span className="font-semibold text-[#2D1B0E]">{width} x {height} {t.common.meter} ({quantity} {isEn ? 'units' : selectedWork.unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C735A]">{t.portfolio.woodType}:</span>
                <span className="font-semibold text-[#A87424]">{selectedGrade.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C735A]">{isEn ? 'Detail Level:' : 'ลวดลาย:'}</span>
                <span className="font-semibold text-[#2D1B0E]">{selectedCarving.name}</span>
              </div>
            </div>

            {/* Direct Contact Form */}
            {!submitted ? (
              <form onSubmit={handleLeadSubmit} className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-[#2D1B0E]">
                  {t.estimator.formTitle}
                </div>
                <input
                  type="text"
                  required
                  placeholder={t.estimator.namePlaceholder}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2D5C5] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C59139]"
                />
                <input
                  type="tel"
                  required
                  placeholder={t.estimator.phonePlaceholder}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2D5C5] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C59139]"
                />
                <input
                  type="text"
                  placeholder={t.estimator.linePlaceholder}
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2D5C5] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C59139]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-gold flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? t.estimator.submittingBtn : t.estimator.submitLeadBtn}</span>
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-xs space-y-1.5 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-sm text-emerald-900">{t.estimator.successTitle}</div>
                <p className="text-emerald-700 font-light">
                  {t.estimator.successDesc}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
