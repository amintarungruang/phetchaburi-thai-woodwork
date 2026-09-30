'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  ExternalLink,
  Kanban,
  Table as TableIcon,
  Sparkles,
  Plus,
  Printer,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLeads, updateLeadStatus, createLead } from '@/lib/store';
import { Lead, LeadStatus } from '@/types';
import { formatThaiDate } from '@/lib/utils';
import CustomSelect from '@/components/ui/CustomSelect';
import LeadsReportModal from '@/components/admin/LeadsReportModal';
import LeadQuotationModal from '@/components/admin/LeadQuotationModal';

const COLUMNS: { id: LeadStatus; label: string; bg: string; border: string; text: string }[] = [
  { id: 'new', label: 'ลูกค้าใหม่ (รอดำเนินการ)', bg: 'bg-red-50/70', border: 'border-red-200', text: 'text-red-800' },
  { id: 'contacted', label: 'ติดต่อแล้ว / รอยืนยันแบบ', bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-800' },
  { id: 'quoted', label: 'ส่งใบเสนอราคาแล้ว', bg: 'bg-sky-50/70', border: 'border-sky-200', text: 'text-sky-800' },
  { id: 'in_production', label: 'มัดจำแล้ว / เริ่มผลิต', bg: 'bg-indigo-50/70', border: 'border-indigo-200', text: 'text-indigo-800' },
  { id: 'completed', label: 'ส่งมอบ & ติดตั้งเสร็จ', bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-800' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [newLeadModal, setNewLeadModal] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedQuotationLead, setSelectedQuotationLead] = useState<Lead | null>(null);

  const handleDirectExportExcel = () => {
    if (leads.length === 0) {
      alert('ไม่มีข้อมูลลูกค้าในระบบ');
      return;
    }

    const rows = leads.map((l, index) => ({
      'ลำดับ': index + 1,
      'วันที่ติดต่อ': formatThaiDate(l.created_at),
      'ชื่อลูกค้า': l.customer_name,
      'เบอร์โทรศัพท์': l.phone_number,
      'LINE ID': l.line_id || '-',
      'ประเภทงานที่สนใจ': l.interest_type || '-',
      'ขนาด/สเปก': l.dimensions || '-',
      'ช่วงงบประมาณ': l.budget_range || '-',
      'สถานะ': l.status,
      'บันทึกรายละเอียด': l.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 24 },
      { wch: 15 },
      { wch: 14 },
      { wch: 25 },
      { wch: 20 },
      { wch: 18 },
      { wch: 16 },
      { wch: 35 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อลูกค้า');
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `รายชื่อลูกค้า_โรงงานฝาทรงไทย_${dateStr}.xlsx`);
  };

  // New Lead Form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLine, setFormLine] = useState('');
  const [formInterest, setFormInterest] = useState('หน้าจั่วทรงไทยเมืองเพชร');
  const [formNotes, setFormNotes] = useState('');

  const loadLeads = async () => {
    const data = await getLeads();
    setLeads(data);
  };

  useEffect(() => {
    loadLeads();
    window.addEventListener('woodwork_store_updated', loadLeads);
    return () => window.removeEventListener('woodwork_store_updated', loadLeads);
  }, []);

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    await updateLeadStatus(id, newStatus);
    loadLeads();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    await createLead({
      customer_name: formName,
      phone_number: formPhone,
      line_id: formLine,
      interest_type: formInterest,
      notes: formNotes,
      status: 'new',
    });

    setFormName('');
    setFormPhone('');
    setFormLine('');
    setFormNotes('');
    setNewLeadModal(false);
    loadLeads();
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone_number.includes(searchQuery) ||
      l.interest_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wood-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wood-950 font-serif">
            จัดการข้อมูลลูกค้าและไปป์ไลน์ (Leads CRM)
          </h1>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            ติดตามสถานะลูกค้า ติดต่อกลับด่วน และบันทึกรายละเอียดงานสั่งทำ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-wood-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-wood-900 text-gold-400 shadow-xs' : 'text-wood-600 hover:text-wood-950'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>กระดาน Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-wood-900 text-gold-400 shadow-xs' : 'text-wood-600 hover:text-wood-950'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>ตารางข้อมูล</span>
            </button>
          </div>

          {/* Direct Excel Export Button */}
          <button
            onClick={handleDirectExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
            title="ส่งออกรายชื่อลูกค้าทั้งหมดเป็นไฟล์ Excel (.xlsx) ทันที"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออกรายชื่อลูกค้า Excel</span>
          </button>

          {/* Filtered Report / PDF Print Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-wood-50 text-wood-950 border border-wood-300 font-bold text-xs shadow-2xs transition-all active:scale-95"
            title="พิมพ์รายงานสรุปข้อมูลลูกค้า (เลือกช่วงเวลา / ประเภทงาน)"
          >
            <Printer className="w-4 h-4 text-gold-600" />
            <span>พิมพ์รายงานสรุป (PDF)</span>
          </button>

          <button
            onClick={() => setNewLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มลูกค้ารายใหม่</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-wood-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, ความสนใจ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wood-200 bg-white text-xs text-wood-950 placeholder-wood-400 focus:outline-none focus:ring-2 focus:ring-gold-500 shadow-xs"
        />
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.id);
            return (
              <div
                key={col.id}
                className={`rounded-2xl border ${col.border} ${col.bg} p-4 min-h-[500px] flex flex-col space-y-3`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-wood-200/60">
                  <span className={`font-bold text-xs ${col.text}`}>{col.label}</span>
                  <span className="w-5 h-5 rounded-full bg-white text-wood-900 text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {colLeads.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-xl border border-wood-200 p-4 shadow-xs space-y-3 hover:border-gold-500/60 transition-all text-xs"
                    >
                      <div>
                        <div className="font-bold text-wood-950 text-sm">{lead.customer_name}</div>
                        <div className="text-[10px] text-wood-400 mt-0.5">{formatThaiDate(lead.created_at)}</div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-wood-50/80 border border-wood-100 space-y-1">
                        <div className="font-semibold text-gold-800">{lead.interest_type}</div>
                        {lead.budget_range && (
                          <div className="text-[11px] text-wood-600">งบ: {lead.budget_range}</div>
                        )}
                        {lead.dimensions && (
                          <div className="text-[11px] text-wood-500">สเปก: {lead.dimensions}</div>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="text-[11px] text-wood-600 bg-amber-50/50 p-2 rounded border border-amber-100">
                          {lead.notes}
                        </p>
                      )}

                      {/* Quotation & 1-Click Action Buttons */}
                      <div className="pt-2 border-t border-wood-100 space-y-2">
                        <button
                          type="button"
                          onClick={() => setSelectedQuotationLead(lead)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gold-50/90 hover:bg-gold-100 text-gold-950 border border-gold-300 font-bold text-[11px] transition-all active:scale-95 shadow-2xs"
                          title="พิมพ์ใบเสนอราคา (Quotation PDF) ส่งให้ลูกค้ารายนี้"
                        >
                          <FileText className="w-3.5 h-3.5 text-gold-700" />
                          <span>พิมพ์ใบเสนอราคา (Quotation PDF)</span>
                        </button>

                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`tel:${lead.phone_number}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>โทรออก</span>
                          </a>

                        {lead.line_id && (
                          <a
                            href={`https://line.me/ti/p/~${lead.line_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-[#06C755] hover:bg-[#05B34C] text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                            title={`คลิกแอด LINE ID: ${lead.line_id}`}
                          >
                            <span>แอด LINE</span>
                          </a>
                        )}

                        {/* Status Mover Dropdown */}
                        <div className="w-28 shrink-0">
                          <CustomSelect
                            value={lead.status}
                            onChange={(val) => handleStatusChange(lead.id, val as LeadStatus)}
                            buttonClassName="py-1 px-2 text-[10px] rounded-lg border-wood-200 bg-wood-50"
                            menuClassName="min-w-[130px]"
                            options={[
                              { value: 'new', label: 'ใหม่' },
                              { value: 'contacted', label: 'ติดต่อแล้ว' },
                              { value: 'quoted', label: 'ส่งราคา' },
                              { value: 'in_production', label: 'เริ่มผลิต' },
                              { value: 'completed', label: 'เสร็จสิ้น' },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                  {colLeads.length === 0 && (
                    <div className="text-center py-8 text-wood-400 text-xs italic">
                      ไม่มีรายการในสถานะนี้
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-wood-200 p-6 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-wood-100 text-wood-400 uppercase font-semibold">
                <th className="pb-3">ชื่อลูกค้า</th>
                <th className="pb-3">ความสนใจ & สเปก</th>
                <th className="pb-3">เบอร์โทรศัพท์</th>
                <th className="pb-3">LINE ID</th>
                <th className="pb-3">สถานะ</th>
                <th className="pb-3">เปลี่ยนสถานะ</th>
                <th className="pb-3 text-right">ใบเสนอราคา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-wood-50/60 transition-colors">
                  <td className="py-3 font-semibold text-wood-950">
                    <div>{lead.customer_name}</div>
                    <div className="text-[10px] text-wood-400 font-normal">{formatThaiDate(lead.created_at)}</div>
                  </td>
                  <td className="py-3 text-wood-700">
                    <div className="font-semibold text-gold-800">{lead.interest_type}</div>
                    <div className="text-[11px] text-wood-500">{lead.budget_range || lead.notes || '-'}</div>
                  </td>
                  <td className="py-3">
                    <a href={`tel:${lead.phone_number}`} className="font-semibold text-emerald-700 hover:underline">
                      {lead.phone_number}
                    </a>
                  </td>
                  <td className="py-3 text-wood-600">
                    {lead.line_id ? (
                      <a
                        href={`https://line.me/ti/p/~${lead.line_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#06C755] font-bold hover:underline"
                        title={`คลิกแอด LINE: ${lead.line_id}`}
                      >
                        <span>{lead.line_id}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-wood-400">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-wood-100 text-wood-900 border border-wood-200">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="w-36">
                      <CustomSelect
                        value={lead.status}
                        onChange={(val) => handleStatusChange(lead.id, val as LeadStatus)}
                        buttonClassName="py-1.5 px-2.5 text-xs rounded-xl"
                        options={[
                          { value: 'new', label: 'ลูกค้าใหม่' },
                          { value: 'contacted', label: 'ติดต่อแล้ว' },
                          { value: 'quoted', label: 'ส่งใบเสนอราคา' },
                          { value: 'in_production', label: 'เริ่มผลิต' },
                          { value: 'completed', label: 'ติดตั้งเสร็จสิ้น' },
                        ]}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedQuotationLead(lead)}
                      className="px-2.5 py-1.5 rounded-xl bg-gold-50/90 hover:bg-gold-100 text-gold-950 border border-gold-300 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                      title="พิมพ์ใบเสนอราคา (Quotation PDF) ส่งให้ลูกค้ารายนี้"
                    >
                      <FileText className="w-3.5 h-3.5 text-gold-700" />
                      <span>ใบเสนอราคา</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Lead Modal */}
      {newLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gold-500/30 space-y-4">
            <h3 className="text-lg font-bold text-wood-950 font-serif">เพิ่มข้อมูลลูกค้ารายใหม่</h3>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-wood-900 block mb-1">ชื่อลูกค้า *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-wood-300 focus:ring-1 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="font-semibold text-wood-900 block mb-1">เบอร์โทรศัพท์ *</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-wood-300 focus:ring-1 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="font-semibold text-wood-900 block mb-1">LINE ID</label>
                <input
                  type="text"
                  value={formLine}
                  onChange={(e) => setFormLine(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-wood-300 focus:ring-1 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="font-semibold text-wood-900 block mb-1">ประเภทงานที่สนใจ</label>
                <input
                  type="text"
                  value={formInterest}
                  onChange={(e) => setFormInterest(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-wood-300 focus:ring-1 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="font-semibold text-wood-900 block mb-1">บันทึกเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-wood-300 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-wood-100">
                <button
                  type="button"
                  onClick={() => setNewLeadModal(false)}
                  className="px-4 py-2 rounded-lg border border-wood-200 text-wood-600 hover:bg-wood-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold"
                >
                  บันทึกข้อมูลลูกค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leads Report & Export Modal */}
      <LeadsReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        leads={leads}
      />

      {/* Individual Customer Quotation Modal */}
      <LeadQuotationModal
        isOpen={!!selectedQuotationLead}
        onClose={() => setSelectedQuotationLead(null)}
        lead={selectedQuotationLead}
      />
    </div>
  );
}
