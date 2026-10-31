import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building, DollarSign, Calendar, Check, AlertCircle, MessageSquare, ShieldAlert, FolderCheck, Send } from 'lucide-react';
import { Lead, PipelineStage, STAGE_CONFIG, ORIGINS as DEFAULT_ORIGINS, DEVELOPMENTS as DEFAULT_DEVELOPMENTS, BROKERS as DEFAULT_BROKERS, ThemeMode, BorderMode, ContactType, RejectionReason, AttendanceRecord } from '../types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Partial<Lead>) => void;
  leadToEdit?: Lead | null;
  availableBrokers?: string[];
  availableDevelopments?: string[];
  availableOrigins?: string[];
  theme?: ThemeMode;
  borderMode?: BorderMode;
  isAdmin?: boolean;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
  availableBrokers = DEFAULT_BROKERS,
  availableDevelopments = DEFAULT_DEVELOPMENTS,
  availableOrigins = DEFAULT_ORIGINS,
  theme = 'bordo',
  borderMode = 'destacada',
  isAdmin = true,
}) => {
  const brokersList = availableBrokers.length > 0 ? availableBrokers : DEFAULT_BROKERS;
  const developmentsList = availableDevelopments.length > 0 ? availableDevelopments : DEFAULT_DEVELOPMENTS;
  const originsList = availableOrigins.length > 0 ? availableOrigins : DEFAULT_ORIGINS;

  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Lead>>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    brokerName: brokersList[0],
    development: developmentsList[0],
    origin: originsList[0],
    status: 'lead',
    propertyUnit: '',
    propertyValue: 400000,
    commissionRate: 5,
    visitDate: '',
    notes: '',
    pastaStatus: 'incompleta',
    creditStatus: 'em_atendimento',
    rejectionReason: 'bacen',
    rejectionDetails: '',
    nextAction: '',
    attendanceRecords: [],
    documents: [
      { id: 'doc-1', name: 'RG / CPF', status: 'pendente' },
      { id: 'doc-2', name: 'Comprovante de Renda', status: 'pendente' },
      { id: 'doc-3', name: 'Imposto de Renda', status: 'pendente' },
    ],
  });

  // New attendance record draft form
  const [newAttendanceType, setNewAttendanceType] = useState<ContactType>('whatsapp');
  const [newAttendanceSummary, setNewAttendanceSummary] = useState('');
  const [newAttendanceNextAction, setNewAttendanceNextAction] = useState('');

  useEffect(() => {
    setFormError(null);
    if (leadToEdit) {
      setFormData({
        ...leadToEdit,
        pastaStatus: leadToEdit.pastaStatus || 'incompleta',
        creditStatus: leadToEdit.creditStatus || 'em_atendimento',
        rejectionReason: leadToEdit.rejectionReason || 'bacen',
        rejectionDetails: leadToEdit.rejectionDetails || '',
        nextAction: leadToEdit.nextAction || '',
        attendanceRecords: leadToEdit.attendanceRecords || []
      });
    } else {
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        brokerName: brokersList[0],
        development: developmentsList[0],
        origin: originsList[0],
        status: 'lead',
        propertyUnit: '',
        propertyValue: 450000,
        commissionRate: 5,
        visitDate: '',
        notes: '',
        pastaStatus: 'incompleta',
        creditStatus: 'em_atendimento',
        rejectionReason: 'bacen',
        rejectionDetails: '',
        nextAction: '',
        attendanceRecords: [],
        documents: [
          { id: 'doc-1', name: 'RG / CPF', status: 'pendente' },
          { id: 'doc-2', name: 'Comprovante de Renda', status: 'pendente' },
          { id: 'doc-3', name: 'Imposto de Renda', status: 'pendente' },
        ],
      });
    }
    setNewAttendanceSummary('');
    setNewAttendanceNextAction('');
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddAttendance = () => {
    if (!newAttendanceSummary.trim()) return;
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: new Date().toLocaleString('pt-BR'),
      contactType: newAttendanceType,
      summary: newAttendanceSummary.trim(),
      nextAction: newAttendanceNextAction.trim(),
      userName: formData.brokerName || brokersList[0]
    };
    setFormData(prev => ({
      ...prev,
      attendanceRecords: [newRecord, ...(prev.attendanceRecords || [])],
      nextAction: newAttendanceNextAction.trim() || prev.nextAction
    }));
    setNewAttendanceSummary('');
    setNewAttendanceNextAction('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName?.trim() || !formData.clientPhone?.trim()) {
      setFormError('Por favor, informe ao menos o Nome e o Telefone do cliente.');
      return;
    }
    onSave(formData);
    onClose();
  };

  const borderClass = borderMode === 'destacada'
    ? theme === 'bordo' ? 'border-2 border-rose-800' : 'border-2 border-blue-600'
    : 'border border-slate-200 dark:border-slate-800';

  const primaryBtnClass = theme === 'bordo'
    ? 'bg-rose-900 hover:bg-rose-800 text-white shadow-rose-900/20'
    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 ${
          theme === 'bordo' ? 'bg-rose-950 text-white' : 'bg-slate-50 dark:bg-slate-800/50'
        }`}>
          <div>
            <h2 className="text-lg font-bold">
              {leadToEdit ? 'Editar Lead / Atendimento & Análise' : 'Novo Lead / Atendimento'}
            </h2>
            <p className={`text-xs ${theme === 'bordo' ? 'text-rose-200' : 'text-slate-500 dark:text-slate-400'}`}>
              Cadastro completo com pastas, análise de crédito, motivos e histórico de atendimento WhatsApp.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Client Details */}
          <div className="space-y-4">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme === 'bordo' ? 'text-rose-700 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
              1. Dados do Cliente
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Cliente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.clientName || ''}
                    onChange={(e) => { setFormError(null); setFormData({ ...formData, clientName: e.target.value }); }}
                    placeholder="Ex: Roberto Carlos"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.clientPhone || ''}
                    onChange={(e) => { setFormError(null); setFormData({ ...formData, clientPhone: e.target.value }); }}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.clientEmail || ''}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property, Assignment & Pasta / Credit Status */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme === 'bordo' ? 'text-rose-700 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
              2. Imóvel, Corretor, Pasta & Análise de Crédito
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Empreendimento / Imóvel
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select
                    value={formData.development || developmentsList[0]}
                    onChange={(e) => setFormData({ ...formData, development: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                  >
                    {developmentsList.map((dev) => (
                      <option key={dev} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Corretor Responsável / Distribuição
                </label>
                <select
                  value={formData.brokerName || (isAdmin ? '⚡ Roleta Automática (Plantonista)' : brokersList[0])}
                  onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                >
                  {isAdmin && (
                    <optgroup label="Distribuição Automática / Triagem">
                      <option value="⚡ Roleta Automática (Plantonista)">⚡ Roleta Automática (Plantonistas de Plantão)</option>
                      <option value="📥 Mesa de Triagem (Pendente)">📥 Mesa de Triagem (Pendente de Distribuição)</option>
                    </optgroup>
                  )}
                  <optgroup label="Atribuição Direta">
                    {brokersList.map((broker) => (
                      <option key={broker} value={broker}>{broker}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Origem do Lead
                </label>
                <select
                  value={formData.origin || originsList[0]}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                >
                  {originsList.map((orig) => (
                    <option key={orig} value={orig}>{orig}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estágio no Funil (Status)
                </label>
                <select
                  value={formData.status || 'lead'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PipelineStage })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white font-medium"
                >
                  {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Pasta Status */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status da Pasta de Documentos
                </label>
                <select
                  value={formData.pastaStatus || 'incompleta'}
                  onChange={(e) => setFormData({ ...formData, pastaStatus: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="incompleta">Pastas Incompletas</option>
                  <option value="completa">Pastas Completas</option>
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="visita">Visita ao Plantão</option>
                </select>
              </div>

              {/* Credit Status */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status da Análise de Crédito
                </label>
                <select
                  value={formData.creditStatus || 'em_atendimento'}
                  onChange={(e) => setFormData({ ...formData, creditStatus: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="visita">Visita</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="condicionado">Condicionado</option>
                  <option value="reprovado">Reprovado</option>
                </select>
              </div>

              {/* Rejection / Condition Reason (if applicable) */}
              {(formData.creditStatus === 'reprovado' || formData.creditStatus === 'condicionado') && (
                <div className="sm:col-span-2 p-4 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Detalhes do Crédito {formData.creditStatus === 'reprovado' ? 'Reprovado' : 'Condicionado'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Motivo Principal *
                      </label>
                      <select
                        value={formData.rejectionReason || 'bacen'}
                        onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value as RejectionReason })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="bacen">BACEN (Restrição Sistema Bancário)</option>
                        <option value="comprometimento_renda">Comprometimento de Renda (&gt;30%)</option>
                        <option value="spc_serasa">SPC e Serasa (Apontamento CPF/CNPJ)</option>
                        <option value="conres">CONRES (Cadastro Restritivo)</option>
                        <option value="scr">SCR (Sistema de Informações de Crédito)</option>
                        <option value="outros">Outros Motivos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Próxima Ação Específica
                      </label>
                      <input
                        type="text"
                        value={formData.nextAction || ''}
                        onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                        placeholder="Ex: Incluir segundo comprador ou quitar pendência"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Detalhamento do Motivo e Laudo Bancário
                      </label>
                      <textarea
                        rows={2}
                        value={formData.rejectionDetails || ''}
                        onChange={(e) => setFormData({ ...formData, rejectionDetails: e.target.value })}
                        placeholder="Descreva o motivo detalhado informado pelo analista de crédito ou banco..."
                        className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Unidade Pretendida
                </label>
                <input
                  type="text"
                  value={formData.propertyUnit || ''}
                  onChange={(e) => setFormData({ ...formData, propertyUnit: e.target.value })}
                  placeholder="Ex: Apto 302 / Lote 12"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Valor do Imóvel (R$ VGV)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={formData.propertyValue || 0}
                    onChange={(e) => setFormData({ ...formData, propertyValue: Number(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data / Hora da Visita ao Plantão
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={formData.visitDate || ''}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registro de Atendimento Não Alterável (WhatsApp Style Chat Background) */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme === 'bordo' ? 'text-rose-700 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  3. Registro de Atendimento (Histórico WhatsApp Imutável)
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Não Alterável / Append-Only
              </span>
            </div>

            {/* WhatsApp Chat Container */}
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-[#efeae2] dark:bg-slate-950 p-4 space-y-3 max-h-64 overflow-y-auto shadow-inner">
              {(!formData.attendanceRecords || formData.attendanceRecords.length === 0) ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs italic">
                  Nenhum registro de atendimento cadastrado ainda. Adicione abaixo.
                </div>
              ) : (
                formData.attendanceRecords.map((att) => (
                  <div key={att.id} className="flex flex-col items-end">
                    <div className="bg-[#dcf8c6] dark:bg-emerald-950/80 text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-xs shadow-xs max-w-[90%] space-y-1.5 text-xs border border-emerald-200 dark:border-emerald-900">
                      <div className="flex items-center justify-between gap-4 border-b border-emerald-600/20 pb-1 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                        <span className="uppercase bg-emerald-200/60 dark:bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-900 dark:text-emerald-200">
                          {att.contactType}
                        </span>
                        <span>{att.date} • {att.userName}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{att.summary}</p>
                      {att.nextAction && (
                        <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium bg-rose-50 dark:bg-rose-950/50 p-1.5 rounded">
                          Próxima Ação: {att.nextAction}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New Attendance Record Form */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Novo Registro de Atendimento (Salvo com Data e Tipo)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Contato
                  </label>
                  <select
                    value={newAttendanceType}
                    onChange={(e) => setNewAttendanceType(e.target.value as ContactType)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ligacao">Ligação Telefônica</option>
                    <option value="email">E-mail</option>
                    <option value="presencial">Presencial (Plantão/Stand)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Próxima Ação
                  </label>
                  <input
                    type="text"
                    value={newAttendanceNextAction}
                    onChange={(e) => setNewAttendanceNextAction(e.target.value)}
                    placeholder="Ex: Enviar nova simulação amanhã às 14h"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Resumo do Atendimento *
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={newAttendanceSummary}
                      onChange={(e) => setNewAttendanceSummary(e.target.value)}
                      placeholder="Descreva o que foi conversado com o cliente..."
                      className="flex-1 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttendance}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-end transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Observações Gerais do Lead
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalhes gerais do perfil, preferências e histórico..."
              className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 ${primaryBtnClass}`}
            >
              <Check className="w-4 h-4" />
              <span>{leadToEdit ? 'Salvar Alterações' : 'Cadastrar Lead'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
