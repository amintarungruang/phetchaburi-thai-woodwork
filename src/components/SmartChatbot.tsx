'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Send,
  Phone,
  ChevronDown,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { ChatMessage, BotConfig, ChatbotFAQ } from '@/types';
import { createLead, getBotConfig, getBotFaqs } from '@/lib/store';
import { INITIAL_BOT_CONFIG, INITIAL_BOT_FAQS } from '@/lib/mockData';
import CustomSelect from '@/components/ui/CustomSelect';
import { matchFaq } from '@/lib/botMatching';
import { useLanguage } from '@/context/LanguageContext';

const LEAD_INTEREST_OPTIONS = [
  { value: 'หน้าจั่วทรงไทย', label: 'หน้าจั่วทรงไทย' },
  { value: 'ประตูไม้สักแกะสลัก', label: 'ประตูไม้สักแกะสลัก' },
  { value: 'วงกบและช่องแสง', label: 'วงกบและช่องแสง' },
  { value: 'ฝาปะกนเรือนไทย', label: 'ฝาปะกนเรือนไทย' },
  { value: 'ศาลาทรงไทย', label: 'ศาลาทรงไทย' },
  { value: 'มีไม้มาเอง ให้ช่างประเมินค่าแรง', label: 'มีไม้มาเอง (ประเมินค่าแรง)' },
  { value: 'สนใจงานสั่งทำไม้สักอื่นๆ', label: 'งานสั่งทำไม้สักอื่นๆ' },
];

const getLeadInterestOptions = (isEn: boolean) => isEn ? [
  { value: 'หน้าจั่วทรงไทย', label: 'Traditional Thai Gable' },
  { value: 'ประตูไม้สักแกะสลัก', label: 'Hand-Carved Teak Door' },
  { value: 'วงกบและช่องแสง', label: 'Doorframe & Transom' },
  { value: 'ฝาปะกนเรือนไทย', label: 'Modular Fa Pakon Wall' },
  { value: 'ศาลาทรงไทย', label: 'Traditional Thai Pavilion' },
  { value: 'มีไม้มาเอง ให้ช่างประเมินค่าแรง', label: 'Provide Own Timber (Labor only)' },
  { value: 'สนใจงานสั่งทำไม้สักอื่นๆ', label: 'Other Custom Woodwork' },
] : LEAD_INTEREST_OPTIONS;

const getOptionLabel = (opt: { label: string; action: string }, isEn: boolean) => {
  if (!isEn) return opt.label;
  if (opt.action === 'request_call') return 'Contact Workshop';
  if (opt.action === 'estimator_link') return 'Estimate Price';
  if (opt.action === 'portfolio_link') return 'View Gallery';
  if (opt.action === 'maps_link') return '📍 Workshop Location';
  if (opt.action === 'price_info') return 'Inquire Teak Prices';
  if (opt.action === 'own_wood') return 'Provide Own Timber';
  if (opt.action === 'schedule_link' || opt.action === 'schedule_info') return 'Check Schedule';
  return opt.label;
};

interface SmartChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartChatbot({ isOpen, onClose }: SmartChatbotProps) {
  const router = useRouter();
  const { t, isEn } = useLanguage();
  const [botConfig, setBotConfig] = useState<BotConfig>(INITIAL_BOT_CONFIG);
  const [faqs, setFaqs] = useState<ChatbotFAQ[]>(INITIAL_BOT_FAQS);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Lead Form in Bot
  const [leadFormActive, setLeadFormActive] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadLineId, setLeadLineId] = useState('');
  const [leadInterest, setLeadInterest] = useState('สนใจงานสั่งทำไม้สัก');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const loadBotData = async () => {
    const [cfg, faqList] = await Promise.all([
      getBotConfig(),
      getBotFaqs()
    ]);
    setBotConfig(cfg);
    setFaqs(faqList);

    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'm1',
            sender: 'bot',
            text: isEn ? t.chatbot.welcomeMessage : cfg.welcome_message,
            options: cfg.initial_choices,
            timestamp: new Date().toLocaleTimeString(isEn ? 'en-US' : 'th-TH', { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  };

  useEffect(() => {
    loadBotData();
    window.addEventListener('woodwork_store_updated', loadBotData);
    return () => window.removeEventListener('woodwork_store_updated', loadBotData);
  }, []);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'm1') {
        return [
          {
            ...prev[0],
            text: isEn ? t.chatbot.welcomeMessage : botConfig.welcome_message,
          },
        ];
      }
      return prev;
    });
  }, [isEn, t, botConfig.welcome_message]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 150);
    }
  }, [messages, isTyping, isOpen, leadFormActive]);

  const handleSendText = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString(isEn ? 'en-US' : 'th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const { matched, score, matchedKeyword } = matchFaq(text, faqs);

      let replyText = '';
      let replyOptions: ChatMessage['options'] = [];

      if (matched) {
        replyText = matched.answer;
        replyOptions = (matched.related_options && matched.related_options.length > 0)
          ? matched.related_options
          : [
              { label: isEn ? 'Contact Workshop' : 'ติดต่อโรงงาน', action: 'request_call' },
              { label: isEn ? 'Instant Estimator' : 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
              { label: isEn ? 'View Products' : 'ดูสินค้า', action: 'portfolio_link' },
            ];
      } else {
        replyText = isEn
          ? `Thank you for reaching out! Our workshop specializes in authentic Thai teak architecture, gables, carved doors, and modular Fa Pakon wall panels. Feel free to leave your name and phone number for Master Artisan S to contact you directly with an accurate quote! 😊`
          : (botConfig.fallback_message || `ขอบคุณสำหรับคำถามครับ ทางโรงงานรับสั่งทำฝาเรือนไทย โครงจั่ว และงานไม้ทุกชนิดตามแบบ (มีทั้งไม้สัก ไม้สะเดา ไม้ตะแบก หรือนำไม้มาเอง) สามารถฝากชื่อและเบอร์โทรไว้ เพื่อให้ช่างติดต่อกลับประเมินราคาได้เลยครับ 😊`);
        replyOptions = [
          { label: isEn ? '📍 Workshop Location' : '📍 ที่ตั้งโรงงาน & แผนที่', action: 'maps_link' },
          { label: isEn ? 'Inquire Prices' : 'สอบถามราคา', action: 'price_info' },
          { label: isEn ? 'Provide Own Wood' : 'มีไม้มาเอง', action: 'own_wood' },
          { label: isEn ? 'Contact Workshop' : 'ติดต่อโรงงาน', action: 'request_call' },
          { label: isEn ? 'Instant Estimator' : 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
        ];
      }

      const botReply: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        options: replyOptions,
        timestamp: new Date().toLocaleTimeString(isEn ? 'en-US' : 'th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 400);
  };

  const handleOptionClick = (option: { label: string; action: string; value?: string }) => {
    if (option.action === 'request_call') {
      setLeadFormActive(true);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: isEn 
          ? 'Please provide your name and phone number below so Master Artisan S can get back to you with personalized recommendations and quote!'
          : 'กรุณากรอกชื่อและเบอร์โทรศัพท์ด้านล่าง เพื่อให้น้องไทยบอทส่งข้อมูลให้ช่างไม้เมืองเพชรติดต่อกลับพร้อมข้อเสนอพิเศษครับ',
        isLeadForm: true,
        timestamp: new Date().toLocaleTimeString(isEn ? 'en-US' : 'th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    if (option.action === 'estimator_link') {
      router.push('/estimator');
      onClose();
      return;
    }

    if (option.action === 'portfolio_link') {
      router.push('/#portfolio');
      onClose();
      return;
    }

    if (option.action === 'own_wood') {
      handleSendText('มีไม้มาเอง คิดค่าแรงยังไง');
      return;
    }

    if (option.action === 'factory_wood') {
      handleSendText('ต้องการใช้ไม้ของโรงงาน');
      return;
    }

    if (option.action === 'schedule_link' || option.action === 'schedule_info') {
      handleSendText('เช็กคิวงานโรงงาน');
      return;
    }

    if (option.action === 'price_info') {
      handleSendText('สอบถามราคาไม้สัก');
      return;
    }

    if (option.action === 'maps_link') {
      window.open('https://maps.app.goo.gl/zjEMkAjqmUyRDRxe7', '_blank');
      return;
    }

    if (option.action === 'phone_call') {
      window.location.href = 'tel:0840426571';
      return;
    }

    if (option.action === 'line_link') {
      window.open('https://line.me/ti/p/~8238sdy', '_blank');
      return;
    }

    if (option.action === 'custom_link' && option.value) {
      window.open(option.value, '_blank');
      return;
    }

    if (option.action === 'send_query' && option.value) {
      handleSendText(option.value);
      return;
    }

    handleSendText(option.label);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;

    setIsSubmittingLead(true);
    try {
      await createLead({
        customer_name: leadName.trim(),
        phone_number: leadPhone.trim(),
        line_id: leadLineId.trim() || undefined,
        interest_type: leadInterest,
        notes: `ติดต่อผ่านระบบ ${botConfig.bot_name} หน้าร้าน${leadLineId.trim() ? ` (LINE ID: ${leadLineId.trim()})` : ''}`,
        status: 'new',
      });

      setLeadSubmitted(true);
      setLeadFormActive(false);

      const confirmMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: isEn
          ? `Thank you ${leadName.trim()}! ✨\nMaster Artisan S will contact you at ${leadPhone.trim()}${leadLineId.trim() ? ` or LINE: ${leadLineId.trim()}` : ''} shortly. 🙏`
          : `ได้รับข้อมูลเรียบร้อยแล้วครับคุณ ${leadName.trim()} ✨\nช่างผู้เชี่ยวชาญจะติดต่อกลับไปที่เบอร์ ${leadPhone.trim()}${leadLineId.trim() ? ` หรือทัก LINE: ${leadLineId.trim()}` : ''} โดยเร็วที่สุดครับ ขอบคุณครับ 🙏`,
        options: [
          { label: isEn ? 'Instant Estimator' : 'คำนวณราคาหน้าเว็บ', action: 'estimator_link' },
          { label: isEn ? 'View Products' : 'ดูสินค้า', action: 'portfolio_link' },
        ],
        timestamp: new Date().toLocaleTimeString(isEn ? 'en-US' : 'th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, confirmMsg]);
      setLeadName('');
      setLeadPhone('');
      setLeadLineId('');
    } catch (err) {
      console.error('Lead submit error:', err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[74px] sm:bottom-[84px] right-3 sm:right-6 left-3 sm:left-auto z-50 w-auto sm:w-[390px] h-[500px] sm:h-[530px] max-h-[calc(100vh-90px)] sm:max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-[#E2D5C5] flex flex-col overflow-hidden animate-fadeIn">
      {/* Header with Mascot Avatar */}
      <div className="bg-gradient-to-r from-[#2D1A0E] via-[#3D2514] to-[#2D1A0E] text-white p-3.5 sm:p-4 border-b border-[#E2D5C5]/20 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mascot Header Avatar */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-[#FFF9F0] to-[#FAF5EE] border-2 border-[#C59139] flex items-center justify-center p-0.5 shadow-md overflow-hidden shrink-0">
            <Image
              src="/images/Robot_Mascot.png"
              alt={isEn ? t.chatbot.botName : botConfig.bot_name}
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white tracking-wide font-sans">
                {isEn ? t.chatbot.botName : botConfig.bot_name}
              </h4>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                {isEn ? 'Online' : 'ออนไลน์'}
              </span>
            </div>
            <p className="text-[10px] text-[#E0D0C0] font-light">
              {isEn ? t.chatbot.botRole : botConfig.status_text}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-[#E0D0C0] hover:text-white hover:bg-white/10 transition-colors"
          aria-label={t.common.close}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-[#FAF7F2] text-xs">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
            >
              {/* Bot Mascot Avatar */}
              {isBot && (
                <div className="relative w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#C59139]/60 flex items-center justify-center p-0.5 shrink-0 shadow-xs overflow-hidden mt-0.5">
                  <Image
                    src="/images/Robot_Mascot.png"
                    alt={isEn ? t.chatbot.botName : botConfig.bot_name}
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
              )}

              <div className={`max-w-[82%] space-y-2 ${isBot ? '' : 'text-right'}`}>
                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed shadow-xs text-xs sm:text-[13px] whitespace-pre-line ${
                    isBot
                      ? 'bg-white text-[#2D1B0E] border border-[#E8DFD5] rounded-tl-sm'
                      : 'bg-[#2D1A0E] text-white rounded-tr-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Quick Reply Options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(opt)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#D5C2AF] hover:border-[#C59139] text-[11px] font-semibold text-[#2D1B0E] transition-all shadow-2xs active:scale-95 flex items-center gap-1"
                      >
                        <span>{getOptionLabel(opt, isEn)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Lead Capture Form in Chat */}
        {leadFormActive && !leadSubmitted && (
          <div className="bg-white rounded-2xl border-2 border-[#C59139]/50 p-4 shadow-md space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-[#FAF5EE]">
              <div className="font-bold text-xs text-[#2D1B0E] flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#C59139]" />
                <span>{isEn ? 'Request Callback from Master S' : 'ฝากข้อมูลให้ช่างติดต่อกลับ'}</span>
              </div>
              <button
                type="button"
                onClick={() => setLeadFormActive(false)}
                className="text-[10px] text-[#8C735A] hover:text-[#2D1B0E] font-medium"
              >
                {isEn ? 'Cancel' : 'ยกเลิก'}
              </button>
            </div>
            
            <form onSubmit={handleLeadSubmit} className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-wood-700 mb-0.5">{isEn ? 'Your Name *' : 'ชื่อของคุณ *'}</label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'e.g. John Doe' : 'เช่น คุณสมชาย หรือ คุณหญิง'}
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C2AF] text-xs focus:ring-1 focus:ring-[#C59139] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-wood-700 mb-0.5">{isEn ? 'Phone Number *' : 'เบอร์โทรศัพท์ติดต่อ *'}</label>
                <input
                  type="tel"
                  required
                  placeholder={isEn ? 'e.g. 084-042-6571' : 'เช่น 084-042-6571'}
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C2AF] text-xs focus:ring-1 focus:ring-[#C59139] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-wood-600 mb-0.5 flex items-center justify-between">
                  <span>LINE ID</span>
                  <span className="text-emerald-700 font-normal text-[9px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">{isEn ? 'Optional' : 'ไม่บังคับ (ให้ช่างแอดไลน์)'}</span>
                </label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. line_id or phone' : 'เช่น 8238sdy หรือ เบอร์โทร'}
                  value={leadLineId}
                  onChange={(e) => setLeadLineId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C2AF] text-xs focus:ring-1 focus:ring-[#C59139] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-wood-700 mb-1">{isEn ? 'Work of Interest' : 'งานที่สนใจ'}</label>
                <CustomSelect
                  value={leadInterest}
                  onChange={setLeadInterest}
                  options={getLeadInterestOptions(isEn)}
                  buttonClassName="py-2 text-xs bg-[#FAF7F2] border-[#D5C2AF]"
                  menuClassName="max-h-48 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLead || !leadName.trim() || !leadPhone.trim()}
                className="w-full btn-gold py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-1"
              >
                {isSubmittingLead ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{isEn ? 'Submitting...' : 'กำลังส่งข้อมูล...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Submit Inquiry' : 'ส่งข้อมูลให้ช่างติดต่อกลับ'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-[#8C735A] text-xs italic">
            <div className="relative w-6 h-6 rounded-full bg-[#FAF5EE] border border-[#C59139]/40 flex items-center justify-center p-0.5 overflow-hidden">
              <Image
                src="/images/Robot_Mascot.png"
                alt={isEn ? t.chatbot.botName : botConfig.bot_name}
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span>{isEn ? `${t.chatbot.botName} is typing...` : `${botConfig.bot_name} กำลังพิมพ์...`}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-[#E8DFD5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText(inputMessage);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={isEn ? t.chatbot.inputPlaceholder : `พิมพ์คำถามสอบถาม ${botConfig.bot_name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8DFD5] text-xs text-[#2D1B0E] placeholder-[#8C735A]/70 focus:outline-none focus:ring-2 focus:ring-[#C59139] bg-[#FAF7F2]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-[#2D1A0E] text-[#F3CE90] hover:bg-[#1F1208] disabled:opacity-40 transition-colors shadow-xs"
            aria-label={t.chatbot.sendBtn}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
