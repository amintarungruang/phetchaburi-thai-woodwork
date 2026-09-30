'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Bot,
  Save,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Send,
  HelpCircle,
  Layers,
  PhoneCall,
  Sliders,
  ExternalLink,
  RotateCcw,
  ListPlus,
  Search,
  Tag,
  MapPin,
  DollarSign,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BotConfig, ChatbotFAQ, BotQuickChoice, ChatMessage } from '@/types';
import {
  getBotConfig,
  saveBotConfig,
  getBotFaqs,
  saveBotFaq,
  deleteBotFaq,
  resetBotFaqsToDefault
} from '@/lib/store';
import CustomSelect from '@/components/ui/CustomSelect';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import { matchFaq, MatchResult } from '@/lib/botMatching';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'ทุกหมวดหมู่' },
  { value: 'location', label: '📍 ที่ตั้ง & การเดินทาง' },
  { value: 'pricing', label: '💰 ราคา & การประเมิน' },
  { value: 'wood_quality', label: '🪵 ไม้สัก & ค่าแรง' },
  { value: 'quality', label: '🛡️ คุณภาพไม้ & ปลวกมอด' },
  { value: 'ordering', label: '📋 ขั้นตอนสั่งทำ & มัดจำ' },
  { value: 'schedule', label: '🚚 คิวงาน & การจัดส่ง' },
  { value: 'contact', label: '📞 ช่องทางติดต่อ & ช่าง' },
  { value: 'general', label: '💬 คำถามทั่วไป' },
];

const ACTION_OPTIONS = [
  { value: 'request_call', label: '📞 โทรหาช่าง / ขอให้โทรกลับ (เปิดฟอร์มฝากเบอร์)' },
  { value: 'maps_link', label: '🗺️ เปิด Google Maps นำทางมาโรงงาน' },
  { value: 'estimator_link', label: '🧮 คำนวณราคาหน้าเว็บ' },
  { value: 'portfolio_link', label: '🖼️ ดูสินค้า / แคตตาล็อกผลงาน' },
  { value: 'schedule_link', label: '📅 เช็กคิวงานโรงงาน' },
  { value: 'price_info', label: '💰 ส่งข้อความสอบถามราคาไม้สัก' },
  { value: 'own_wood', label: '🪵 มีไม้มาเอง (ประเมินค่าแรง)' },
  { value: 'factory_wood', label: '✨ ใช้ไม้ของโรงงาน' },
  { value: 'phone_call', label: '📱 โทรออกเบอร์ 084-042-6571 ทันที' },
  { value: 'line_link', label: '💚 แอดไลน์โรงงาน (LINE ID: 8238sdy)' },
];

export default function AdminBotPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'faqs' | 'simulator'>('faqs');
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [faqs, setFaqs] = useState<ChatbotFAQ[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter & Search state in FAQ tab
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Profile Form state
  const [botName, setBotName] = useState('');
  const [statusText, setStatusText] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [choices, setChoices] = useState<BotQuickChoice[]>([]);
  const [newChoiceLabel, setNewChoiceLabel] = useState('');
  const [newChoiceAction, setNewChoiceAction] = useState('portfolio_link');

  // FAQ Modal state
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ChatbotFAQ | null>(null);
  const [faqTitle, setFaqTitle] = useState('');
  const [faqCategory, setFaqCategory] = useState('general');
  const [faqPatterns, setFaqPatterns] = useState<string[]>([]);
  const [patternInput, setPatternInput] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqRelatedOptions, setFaqRelatedOptions] = useState<{ label: string; action: string; value?: string }[]>([]);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionAction, setNewOptionAction] = useState('request_call');

  // Live Simulator state
  const [simMessages, setSimMessages] = useState<ChatMessage[]>([]);
  const [simInput, setSimInput] = useState('');
  const [simTyping, setSimTyping] = useState(false);
  const [simMatchInfo, setSimMatchInfo] = useState<{ [msgId: string]: MatchResult }>({});

  const { confirm } = useConfirmDialog();

  const loadData = async () => {
    const [cfg, faqList] = await Promise.all([
      getBotConfig(),
      getBotFaqs()
    ]);
    setConfig(cfg);
    setFaqs(faqList);

    setBotName(cfg.bot_name);
    setStatusText(cfg.status_text);
    setWelcomeMessage(cfg.welcome_message);
    setFallbackMessage(cfg.fallback_message);
    setChoices(cfg.initial_choices || []);

    // Initialize Simulator
    setSimMessages([
      {
        id: 'sim-welcome',
        sender: 'bot',
        text: cfg.welcome_message,
        options: cfg.initial_choices,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('woodwork_store_updated', loadData);
    return () => window.removeEventListener('woodwork_store_updated', loadData);
  }, []);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchCat = categoryFilter === 'all' || faq.category === categoryFilter;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inTitle = faq.title?.toLowerCase().includes(q);
      const inAnswer = faq.answer.toLowerCase().includes(q);
      const inPatterns = faq.question_pattern.some((p) => p.toLowerCase().includes(q));

      return inTitle || inAnswer || inPatterns;
    });
  }, [faqs, categoryFilter, searchQuery]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedConfig: BotConfig = {
      bot_name: botName.trim(),
      status_text: statusText.trim(),
      welcome_message: welcomeMessage.trim(),
      fallback_message: fallbackMessage.trim(),
      avatar_url: '/images/Robot_Mascot.png',
      initial_choices: choices,
      is_lead_capture_enabled: true,
    };

    await saveBotConfig(updatedConfig);
    setConfig(updatedConfig);
    setIsSaving(false);
    setSaveSuccess('บันทึกข้อมูลตัวแทนและข้อความต้อนรับเรียบร้อยแล้ว');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleAddChoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoiceLabel.trim()) return;

    const newChoice: BotQuickChoice = {
      id: `choice-${Date.now()}`,
      label: newChoiceLabel.trim(),
      action: newChoiceAction,
    };

    setChoices([...choices, newChoice]);
    setNewChoiceLabel('');
  };

  const handleDeleteChoice = (id: string) => {
    setChoices(choices.filter((c) => c.id !== id));
  };

  // FAQ Modal Handlers
  const openAddFaqModal = (prefillKeyword?: string) => {
    setEditingFaq(null);
    setFaqTitle(prefillKeyword ? `ตอบคำถาม: ${prefillKeyword}` : '');
    setFaqCategory('general');
    setFaqPatterns(prefillKeyword ? [prefillKeyword] : []);
    setPatternInput('');
    setFaqAnswer('');
    setFaqRelatedOptions([
      { label: 'ติดต่อโรงงาน', action: 'request_call' },
      { label: 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
    ]);
    setFaqModalOpen(true);
  };

  const openEditFaqModal = (faq: ChatbotFAQ) => {
    setEditingFaq(faq);
    setFaqTitle(faq.title || faq.question_pattern[0] || '');
    setFaqCategory(faq.category || 'general');
    setFaqPatterns([...faq.question_pattern]);
    setPatternInput('');
    setFaqAnswer(faq.answer);
    setFaqRelatedOptions(
      faq.related_options && faq.related_options.length > 0
        ? [...faq.related_options]
        : [
            { label: 'ติดต่อโรงงาน', action: 'request_call' },
            { label: 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
          ]
    );
    setFaqModalOpen(true);
  };

  const handleAddPattern = (raw: string) => {
    if (!raw.trim()) return;
    const parts = raw
      .split(/[,，\n]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !faqPatterns.includes(p));

    if (parts.length > 0) {
      setFaqPatterns([...faqPatterns, ...parts]);
    }
    setPatternInput('');
  };

  const handleRemovePattern = (idx: number) => {
    setFaqPatterns(faqPatterns.filter((_, i) => i !== idx));
  };

  const handleAddRelatedOption = () => {
    if (!newOptionLabel.trim()) return;
    setFaqRelatedOptions([
      ...faqRelatedOptions,
      { label: newOptionLabel.trim(), action: newOptionAction },
    ]);
    setNewOptionLabel('');
  };

  const handleRemoveRelatedOption = (idx: number) => {
    setFaqRelatedOptions(faqRelatedOptions.filter((_, i) => i !== idx));
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (faqPatterns.length === 0 && patternInput.trim()) {
      handleAddPattern(patternInput);
    }
    const finalPatterns = faqPatterns.length > 0 ? faqPatterns : [patternInput.trim()].filter(Boolean);

    if (finalPatterns.length === 0 || !faqAnswer.trim()) return;

    const faqData: ChatbotFAQ = {
      id: editingFaq ? editingFaq.id : `faq-${Date.now()}`,
      title: faqTitle.trim() || finalPatterns[0] || 'คำตอบอัตโนมัติ',
      category: faqCategory,
      question_pattern: finalPatterns,
      answer: faqAnswer.trim(),
      related_options: faqRelatedOptions,
      is_active: editingFaq ? editingFaq.is_active !== false : true,
    };

    await saveBotFaq(faqData);
    setFaqModalOpen(false);
    setSaveSuccess(
      editingFaq
        ? `แก้ไขคำตอบ "${faqData.title}" สำเร็จ`
        : `เพิ่มหัวข้อคำตอบ "${faqData.title}" เรียบร้อยแล้ว`
    );
    setTimeout(() => setSaveSuccess(null), 3500);
    await loadData();
  };

  const handleToggleFaqActive = async (faq: ChatbotFAQ) => {
    const updated: ChatbotFAQ = {
      ...faq,
      is_active: faq.is_active === false ? true : false,
    };
    await saveBotFaq(updated);
    await loadData();
  };

  const handleDeleteFaq = async (id: string) => {
    const target = faqs.find((f) => f.id === id);
    const ok = await confirm({
      title: 'ยืนยันการลบคำตอบอัตโนมัติ',
      message: `คุณต้องการลบหัวข้อคำตอบ "${target?.title || 'นี้'}" ออกจากระบบใช่หรือไม่?`,
      confirmText: 'ลบคำตอบ',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (ok) {
      await deleteBotFaq(id);
      setSaveSuccess('ลบคำตอบอัตโนมัติเรียบร้อยแล้ว');
      setTimeout(() => setSaveSuccess(null), 3000);
      await loadData();
    }
  };

  const handleResetFaqs = async () => {
    const ok = await confirm({
      title: 'คืนค่าคลังคำตอบมาตรฐาน',
      message: 'ต้องการคืนค่าคำถาม-คำตอบทั้งหมดเป็นชุดมาตรฐานโรงงานไม้สักทองเมืองเพชรหรือไม่? (ข้อมูลที่ปรับแต่งเองจะถูกรีเซ็ต)',
      confirmText: 'คืนค่ามาตรฐาน',
      cancelText: 'ยกเลิก',
      variant: 'warning',
    });
    if (ok) {
      await resetBotFaqsToDefault();
      setSaveSuccess('คืนค่าคลังคำตอบมาตรฐานเรียบร้อยแล้ว');
      setTimeout(() => setSaveSuccess(null), 3000);
      await loadData();
    }
  };

  // Simulator Handlers
  const handleSimSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `sim-u-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setSimMessages((prev) => [...prev, userMsg]);
    setSimInput('');
    setSimTyping(true);

    setTimeout(() => {
      const matchResult = matchFaq(text, faqs);
      const matched = matchResult.matched;

      let replyText = '';
      let replyOptions: ChatMessage['options'] = [];

      if (matched) {
        replyText = matched.answer;
        replyOptions = matched.related_options && matched.related_options.length > 0
          ? matched.related_options
          : [
              { label: 'ติดต่อโรงงาน', action: 'request_call' },
              { label: 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
            ];
      } else {
        replyText = fallbackMessage || 'ขอบคุณสำหรับคำถามครับ น้องไทยบอทยินดีประสานงานให้ช่างผู้เชี่ยวชาญติดต่อกลับครับ';
        replyOptions = [
          { label: '📍 ที่ตั้งโรงงาน & แผนที่', action: 'maps_link' },
          { label: 'สอบถามราคา', action: 'price_info' },
          { label: 'มีไม้มาเอง', action: 'own_wood' },
          { label: 'ติดต่อโรงงาน', action: 'request_call' },
        ];
      }

      const botReplyId = `sim-b-${Date.now()}`;
      const botReply: ChatMessage = {
        id: botReplyId,
        sender: 'bot',
        text: replyText,
        options: replyOptions,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setSimMatchInfo((prev) => ({
        ...prev,
        [botReplyId]: matchResult,
      }));

      setSimMessages((prev) => [...prev, botReply]);
      setSimTyping(false);
    }, 400);
  };

  const handleSimReset = () => {
    if (config) {
      setSimMessages([
        {
          id: 'sim-welcome',
          sender: 'bot',
          text: config.welcome_message,
          options: config.initial_choices,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setSimMatchInfo({});
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wood-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wood-950 font-serif flex items-center gap-2.5">
            <Bot className="w-8 h-8 text-gold-600" />
            <span>จัดการแชทบอทอัจฉริยะ (Chatbot CMS)</span>
          </h1>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            ปรับแต่งตัวตนบอท (น้องไทยบอท), เพิ่มคำตอบอัตโนมัติอย่างยืดหยุ่น พร้อมระบบจับคู่ภาษาไทยอัจฉริยะ
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-wood-100 rounded-2xl border border-wood-200 shrink-0">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'faqs'
                ? 'bg-white text-wood-950 shadow-xs'
                : 'text-wood-600 hover:text-wood-950'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-gold-600" />
            <span>คลังคำตอบ ({faqs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-white text-wood-950 shadow-xs'
                : 'text-wood-600 hover:text-wood-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>จำลองการแชทสด</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-white text-wood-950 shadow-xs'
                : 'text-wood-600 hover:text-wood-950'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-wood-500" />
            <span>ตัวตน & ปุ่มเริ่มต้น</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccess}</span>
        </div>
      )}

      {/* TAB 1: Knowledge Base FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-5">
          {/* Action Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-wood-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-wood-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-600" />
                  <span>คลังคำตอบอัตโนมัติ (AI Knowledge Base)</span>
                </h2>
                <p className="text-xs text-wood-600 mt-0.5">
                  บอทจับคู่คำถามด้วยภาษาไทยอัจฉริยะ ตัดคำลงท้าย (คะ/ครับ) และจับคู่ประโยคตรงประเด็นทันที
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleResetFaqs}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-wood-50 hover:bg-wood-100 text-wood-600 text-xs font-semibold transition-all border border-wood-200"
                  title="คืนค่าคำถาม-คำตอบเริ่มต้น"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">คืนค่ามาตรฐาน</span>
                </button>

                <button
                  onClick={() => openAddFaqModal()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-gold text-white font-bold text-xs shadow-sm hover:shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มคำตอบใหม่</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="pt-3 border-t border-wood-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-wood-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อหัวข้อ, คำค้น (Keywords), หรือเนื้อหาคำตอบ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-wood-200 text-xs text-wood-950 bg-wood-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      categoryFilter === cat.value
                        ? 'bg-wood-950 text-gold-400 shadow-xs'
                        : 'bg-wood-100/70 text-wood-600 hover:bg-wood-200/70 hover:text-wood-950'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex items-center justify-between text-xs text-wood-600 px-1">
            <span>
              แสดง {filteredFaqs.length} จากทั้งหมด {faqs.length} หัวข้อ
              {categoryFilter !== 'all' && ` (กรองเฉพาะ ${CATEGORY_OPTIONS.find(c => c.value === categoryFilter)?.label})`}
            </span>
            <span className="text-emerald-700 font-semibold">
              เปิดใช้งานอยู่ {faqs.filter(f => f.is_active !== false).length} หัวข้อ
            </span>
          </div>

          {/* Grid of FAQ Cards */}
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-wood-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-wood-100 flex items-center justify-center mx-auto text-wood-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-wood-900">ไม่พบหัวข้อคำตอบที่ตรงกับเงื่อนไขค้นหา</h3>
              <p className="text-xs text-wood-500 max-w-sm mx-auto">
                ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มคำตอบใหม่" เพื่อสร้างคำตอบที่คุณต้องการ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq) => {
                const isActive = faq.is_active !== false;
                const catObj = CATEGORY_OPTIONS.find((c) => c.value === faq.category);

                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl border transition-all flex flex-col justify-between p-5 space-y-4 shadow-xs hover:shadow-md ${
                      isActive ? 'border-wood-200' : 'border-wood-200/60 opacity-60 bg-wood-50/40'
                    }`}
                  >
                    {/* Top Row: Title & Actions */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg bg-wood-100 text-wood-700 font-bold text-[10px] border border-wood-200">
                              {catObj?.label || 'ทั่วไป'}
                            </span>
                            {!isActive && (
                              <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-700 font-bold text-[10px]">
                                ปิดใช้งานชั่วคราว
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm text-wood-950 leading-snug">
                            {faq.title || faq.question_pattern[0]}
                          </h3>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleFaqActive(faq)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-wood-400 hover:bg-wood-100'
                            }`}
                            title={isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                          >
                            {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => openEditFaqModal(faq)}
                            className="p-1.5 rounded-lg text-wood-600 hover:text-wood-950 hover:bg-wood-100 transition-colors"
                            title="แก้ไขคำตอบ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="p-1.5 rounded-lg text-wood-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Keywords Badges */}
                      <div className="flex flex-wrap gap-1 items-center">
                        <Tag className="w-3 h-3 text-wood-400 mr-0.5" />
                        {faq.question_pattern.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-gold-50 text-gold-900 border border-gold-300/50 font-semibold text-[10.5px]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>

                      {/* Answer Body */}
                      <div className="text-xs text-wood-800 leading-relaxed bg-wood-50/70 p-3.5 rounded-xl border border-wood-100 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </div>

                    {/* Bottom: Related Action Buttons */}
                    {faq.related_options && faq.related_options.length > 0 && (
                      <div className="pt-2.5 border-t border-wood-100 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-wood-400">ปุ่มท้ายคำตอบ:</span>
                        {faq.related_options.map((opt, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-white text-wood-800 text-[10.5px] font-semibold border border-wood-200 shadow-2xs flex items-center gap-1"
                          >
                            <span>{opt.label}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Simulator with Match Inspector */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-wood-200 p-5 shadow-xs space-y-3.5">
              <h2 className="font-bold text-sm text-wood-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>วิธีทดสอบการจับคู่คำถาม</span>
              </h2>
              <p className="text-xs text-wood-600 leading-relaxed">
                พิมพ์คำถามทดสอบด้วยภาษาพูดตามที่ลูกค้าชอบพิมพ์ เช่น:
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  'โรงงานอยู่ที่ไหนคะ',
                  'มีหน้าร้านไหม',
                  'ขอพิกัดโรงงานหน่อยครับ',
                  'ราคาหน้าจั่วเท่าไหร่',
                  'มีไม้มาเอง คิดค่าแรงยังไง',
                  'ปลวกจะกินไม้สักไหม',
                  'สั่งทำตามแบบได้ไหม'
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSimSend(sample)}
                    className="w-full text-left px-3 py-1.5 rounded-xl bg-wood-50 hover:bg-gold-50 text-wood-800 hover:text-gold-900 border border-wood-200 text-[11px] transition-colors flex items-center justify-between group"
                  >
                    <span>"{sample}"</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gold-600 transition-opacity" />
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-wood-100">
                <button
                  onClick={handleSimReset}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-800 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตบทสนทนาจำลอง</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulator Chat Window */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-wood-300 shadow-xl overflow-hidden flex flex-col h-[580px]">
            {/* Window Header */}
            <div className="bg-gradient-to-r from-wood-950 via-wood-900 to-wood-950 text-white p-3.5 flex items-center justify-between border-b border-gold-500/30">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold-400 bg-wood-800">
                  <Image
                    src="/images/Robot_Mascot.png"
                    alt="Bot Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">{botName || 'น้องไทยบอท'}</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    โหมดจำลองสถานการณ์จริง (Live Testing)
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-wood-50/40">
              {simMessages.map((msg) => {
                const matchData = simMatchInfo[msg.id];

                return (
                  <div key={msg.id} className="space-y-1.5">
                    <div
                      className={`flex gap-2.5 ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-gold-400 bg-wood-800 shrink-0 relative mt-0.5">
                          <Image
                            src="/images/Robot_Mascot.png"
                            alt="Bot"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                          msg.sender === 'user'
                            ? 'bg-wood-950 text-white rounded-br-none'
                            : 'bg-white text-wood-900 border border-wood-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {/* Action Buttons */}
                        {msg.options && msg.options.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-wood-100 flex flex-wrap gap-1.5">
                            {msg.options.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSimSend(opt.label)}
                                className="px-2.5 py-1 rounded-lg bg-wood-100 hover:bg-gold-100 text-wood-800 hover:text-gold-900 border border-wood-200 text-[10px] font-semibold transition-colors"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Match Inspector Card for Bot Message */}
                    {msg.sender === 'bot' && matchData && (
                      <div className="ml-9 max-w-[82%] p-2.5 rounded-xl border text-[10.5px] space-y-1 bg-white shadow-2xs">
                        {matchData.matched ? (
                          <div className="flex items-center justify-between text-emerald-800">
                            <span className="font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              จับคู่ตรงกับ: "{matchData.matched.title || matchData.matched.question_pattern[0]}"
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 font-semibold">
                              มั่นใจ {matchData.score}%
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-amber-800">
                              <span className="font-bold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                ไม่พบคำตอบตรงกัน (ใช้ Fallback Message)
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const lastUserMsg = [...simMessages].reverse().find(m => m.sender === 'user');
                                openAddFaqModal(lastUserMsg?.text || '');
                              }}
                              className="text-[10px] text-gold-700 hover:text-gold-900 font-bold underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>สร้างคำตอบใหม่จากคำถามนี้ทันที</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {simTyping && (
                <div className="text-xs text-wood-400 italic flex items-center gap-1.5 ml-9">
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce"></span>
                  <span>น้องไทยบอทกำลังพิมพ์...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-wood-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSimSend(simInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความทดสอบถามบอท เช่น 'โรงงานอยู่ที่ไหนคะ'..."
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-wood-300 text-xs text-wood-950 bg-wood-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
                <button
                  type="submit"
                  disabled={!simInput.trim()}
                  className="p-2.5 rounded-xl btn-gold text-white hover:opacity-90 disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Bot Profile & Initial Choices */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: General Settings */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-wood-200 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-wood-950 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold-600" />
              <span>การตั้งค่าตัวตนและข้อความเริ่มต้น</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-wood-900 block mb-1">ชื่อบอท</label>
                  <input
                    type="text"
                    required
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-wood-900 block mb-1">คำบรรยายสถานะ</label>
                  <input
                    type="text"
                    required
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-wood-900 block mb-1">ข้อความต้อนรับเมื่อลูกค้าเปิดแชท</label>
                <textarea
                  rows={3}
                  required
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-wood-900 block mb-1">
                  ข้อความตอบกลับเมื่อไม่พบคำตอบในระบบ (Fallback Message)
                </label>
                <textarea
                  rows={3}
                  required
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500 leading-relaxed"
                />
                <p className="text-[10px] text-wood-500 mt-1">
                  เมื่อระบบจับคู่คำถามไม่พบ จะตอบกลับด้วยข้อความนี้พร้อมปุ่มแนะนำหัวข้อยอดนิยมอัตโนมัติ
                </p>
              </div>

              <div className="pt-3 border-t border-wood-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-gold text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าตัวตน'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Initial Quick Choices */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-wood-200 p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-wood-950 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-gold-600" />
                <span>ปุ่มตัวเลือกเริ่มต้น ({choices.length})</span>
              </h2>
              <p className="text-xs text-wood-600 mt-0.5">
                ปุ่มลัดที่แสดงขึ้นมาทันทีเมื่อลูกค้าเปิดแชท เพื่อให้กดถามได้ทันที
              </p>
            </div>

            {/* List of current choices */}
            <div className="space-y-2">
              {choices.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-wood-50 border border-wood-200 text-xs"
                >
                  <div>
                    <span className="font-bold text-wood-900">{c.label}</span>
                    <span className="text-[10px] text-wood-500 block">
                      การกระทำ: {ACTION_OPTIONS.find(a => a.value === c.action)?.label || c.action}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteChoice(c.id)}
                    className="p-1 rounded-lg text-wood-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new choice */}
            <form onSubmit={handleAddChoice} className="space-y-3 pt-3 border-t border-wood-100 text-xs">
              <span className="font-bold text-wood-900 block">เพิ่มปุ่มตัวเลือกใหม่</span>
              <div>
                <input
                  type="text"
                  required
                  placeholder="ข้อความบนปุ่ม (เช่น สอบถามราคา, มีไม้มาเอง)"
                  value={newChoiceLabel}
                  onChange={(e) => setNewChoiceLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs bg-white text-wood-950 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <CustomSelect
                  value={newChoiceAction}
                  onChange={(val) => setNewChoiceAction(val)}
                  options={ACTION_OPTIONS}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl btn-gold text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มปุ่มตัวเลือกนี้</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit FAQ Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-wood-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-wood-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-wood-100">
              <h3 className="font-bold text-base text-wood-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-600" />
                <span>{editingFaq ? 'แก้ไขคำตอบอัตโนมัติ' : 'เพิ่มคำตอบอัตโนมัติใหม่'}</span>
              </h3>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="text-wood-400 hover:text-wood-950 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-wood-900 block mb-1">
                    ชื่อหัวข้อคำตอบ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ที่ตั้งโรงงาน แผนที่ และการเดินทาง"
                    value={faqTitle}
                    onChange={(e) => setFaqTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-wood-900 block mb-1">หมวดหมู่</label>
                  <CustomSelect
                    value={faqCategory}
                    onChange={(val) => setFaqCategory(val)}
                    options={CATEGORY_OPTIONS.filter((c) => c.value !== 'all')}
                  />
                </div>
              </div>

              {/* Keywords / Question Patterns */}
              <div>
                <label className="font-bold text-wood-900 block mb-1">
                  คำค้นหา / รูปแบบคำถาม (Keywords) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="พิมพ์คำสำคัญแล้วกด Enter หรือกดเพิ่ม (เช่น โรงงานอยู่ที่ไหน, พิกัด, หน้าร้าน)"
                    value={patternInput}
                    onChange={(e) => setPatternInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPattern(patternInput);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPattern(patternInput)}
                    className="px-3.5 py-2 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-900 font-bold text-xs"
                  >
                    เพิ่มคำค้น
                  </button>
                </div>

                {/* Chips Display */}
                <div className="flex flex-wrap gap-1.5 mt-2 min-h-[32px] p-2 bg-wood-50 rounded-xl border border-wood-200/60">
                  {faqPatterns.length === 0 ? (
                    <span className="text-[11px] text-wood-400 italic">
                      ยังไม่มีคำค้นหา กรุณาเพิ่มอย่างน้อย 1 คำ
                    </span>
                  ) : (
                    faqPatterns.map((pat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-gold-100 text-gold-950 border border-gold-300 font-bold text-[11px] flex items-center gap-1"
                      >
                        <span>{pat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePattern(idx)}
                          className="text-gold-700 hover:text-red-600 font-bold ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-wood-500 mt-1">
                  💡 เคล็ดลับ: ระบบตัดคำสุภาพ (คะ/ครับ/นะคะ) ให้อัตโนมัติ จึงสามารถใส่ทั้งคำสั้นและคำยาวได้
                </p>
              </div>

              {/* Bot Answer */}
              <div>
                <label className="font-bold text-wood-900 block mb-1">
                  ข้อความคำตอบของบอท <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="พิมพ์คำตอบที่ต้องการให้น้องไทยบอทตอบลูกค้าอย่างชัดเจน สุภาพ และมีข้อมูลครบถ้วน..."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs text-wood-950 focus:ring-1 focus:ring-gold-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons Customization */}
              <div className="space-y-2 pt-2 border-t border-wood-100">
                <label className="font-bold text-wood-900 block">
                  ปุ่มทางเลือกแถมท้ายคำตอบ (Action Buttons)
                </label>
                <p className="text-[10.5px] text-wood-500">
                  ปุ่มที่ลูกค้าสามารถกดต่อได้ทันทีหลังจากบอทตอบข้อความนี้
                </p>

                {/* List of current buttons */}
                <div className="space-y-1.5">
                  {faqRelatedOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-wood-50 border border-wood-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-wood-900">{opt.label}</span>
                        <span className="text-[10px] text-wood-500">
                          ({ACTION_OPTIONS.find(a => a.value === opt.action)?.label || opt.action})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRelatedOption(idx)}
                        className="text-wood-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new action button */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="ชื่อปุ่ม (เช่น โทรหาช่าง, ดูผลงาน)"
                    value={newOptionLabel}
                    onChange={(e) => setNewOptionLabel(e.target.value)}
                    className="w-full sm:w-1/2 px-3 py-1.5 rounded-xl border border-wood-300 text-xs"
                  />
                  <div className="w-full sm:w-1/2">
                    <CustomSelect
                      value={newOptionAction}
                      onChange={(val) => setNewOptionAction(val)}
                      options={ACTION_OPTIONS}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRelatedOption}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-900 font-bold text-xs shrink-0"
                  >
                    + เพิ่มปุ่ม
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-wood-100">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-800 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-gold text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
                >
                  {editingFaq ? 'บันทึกการแก้ไข' : 'บันทึกคำตอบใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
