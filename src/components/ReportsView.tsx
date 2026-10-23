import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, User, Building2, Calendar, CheckCircle2, TrendingUp, DollarSign, FolderOpen, MapPin, ShieldAlert, Award, AlertTriangle, Check, XCircle } from 'lucide-react';
import { Lead, STAGE_CONFIG, BROKERS as DEFAULT_BROKERS, DEVELOPMENTS as DEFAULT_DEVELOPMENTS, ThemeMode, BorderMode } from '../types';

interface ReportsViewProps {
  leads: Lead[];
  availableBrokers?: string[];
  availableDevelopments?: string[];
  theme?: ThemeMode;
  borderMode?: BorderMode;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  leads,
  availableBrokers = DEFAULT_BROKERS,
  availableDevelopments = DEFAULT_DEVELOPMENTS,
  theme = 'bordo',
  borderMode = 'destacada'
}) => {
  const brokersList = availableBrokers.length > 0 ? availableBrokers : DEFAULT_BROKERS;
  const developmentsList = availableDevelopments.length > 0 ? availableDevelopments : DEFAULT_DEVELOPMENTS;

  const [activeReportTab, setActiveReportTab] = useState<'leads' | 'pastas' | 'visitas' | 'jornada'>('leads');
  const [reportType, setReportType] = useState<'general' | 'broker' | 'development'>('general');
  const [selectedBroker, setSelectedBroker] = useState<string>(brokersList[0]);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>(developmentsList[0]);

  useEffect(() => {
    if (!brokersList.includes(selectedBroker) && brokersList.length > 0) {
      setSelectedBroker(brokersList[0]);
    }
  }, [brokersList, selectedBroker]);

  useEffect(() => {
    if (!developmentsList.includes(selectedDevelopment) && developmentsList.length > 0) {
      setSelectedDevelopment(developmentsList[0]);
    }
  }, [developmentsList, selectedDevelopment]);

  // Filtered leads based on report type
  const reportLeads = leads.filter(l => {
    if (reportType === 'broker') return l.brokerName === selectedBroker;
    if (reportType === 'development') return l.development === selectedDevelopment;
    return true;
  });

  const totalLeads = reportLeads.length;
  const totalVGV = reportLeads.reduce((acc, curr) => acc + (curr.propertyValue || 0), 0);
  const salesCount = reportLeads.filter(l => l.status === 'venda_realizada').length;
  const approvedCount = reportLeads.filter(l => l.status === 'credito_aprovado').length;

  // Pasta stats
  const pastasCompletas = reportLeads.filter(l => l.pastaStatus === 'completa').length;
  const pastasIncompletas = reportLeads.filter(l => l.pastaStatus === 'incompleta' || !l.pastaStatus).length;
  const pastasEmAtendimento = reportLeads.filter(l => l.pastaStatus === 'em_atendimento').length;
  const pastasVisita = reportLeads.filter(l => l.pastaStatus === 'visita').length;

  // Visita stats
  const visitasTotal = reportLeads.filter(l => l.status === 'visita_plantao' || l.visitDate).length;
  const visitasComData = reportLeads.filter(l => l.visitDate).length;

  // Broker Journey Audit Calculation (Who has most leads, who follows correct journey vs who does not)
  const brokerAuditData = brokersList.map(brokerName => {
    const bLeads = leads.filter(l => l.brokerName === brokerName);
    const bTotal = bLeads.length;
    const bVisits = bLeads.filter(l => l.status !== 'lead').length;
    const bFolders = bLeads.filter(l => l.pastaStatus === 'completa' || l.status === 'montagem_pasta' || l.status === 'credito_aprovado' || l.status === 'venda_realizada').length;
    const bSales = bLeads.filter(l => l.status === 'venda_realizada').length;
    const stuckLeads = bLeads.filter(l => l.status === 'lead' && (!l.attendanceRecords || l.attendanceRecords.length <= 1)).length;

    // Journey correctness score
    const progressionRate = bTotal > 0 ? (bVisits / bTotal) * 100 : 0;
    const isCorrectJourney = bTotal > 0 && (progressionRate >= 50 || bSales > 0);

    return {
      brokerName,
      totalLeads: bTotal,
      visitsCount: bVisits,
      foldersCount: bFolders,
      salesCount: bSales,
      stuckLeads,
      progressionRate: Math.round(progressionRate),
      isCorrectJourney
    };
  }).sort((a, b) => b.totalLeads - a.totalLeads);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const exportExcel = () => {
    const headers = ['Cliente', 'Telefone', 'E-mail', 'Corretor', 'Empreendimento', 'Origem', 'Status', 'Pasta', 'Valor VGV', 'Data Visita'];
    const rows = reportLeads.map(l => [
      `"${l.clientName.replace(/"/g, '""')}"`,
      `"${l.clientPhone.replace(/"/g, '""')}"`,
      `"${(l.clientEmail || '').replace(/"/g, '""')}"`,
      `"${l.brokerName.replace(/"/g, '""')}"`,
      `"${l.development.replace(/"/g, '""')}"`,
      `"${l.origin.replace(/"/g, '""')}"`,
      `"${(STAGE_CONFIG[l.status]?.label || l.status).replace(/"/g, '""')}"`,
      `"${(l.pastaStatus || 'incompleta').replace(/"/g, '""')}"`,
      l.propertyValue,
      `"${(l.visitDate || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = `relatorio_${activeReportTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const getContainerBorder = () => {
    if (borderMode === 'destacada') {
      switch (theme) {
        case 'bordo': return 'border-2 border-rose-300 dark:border-rose-900/60 shadow-md';
        case 'azul': return 'border-2 border-blue-300 dark:border-blue-900/60 shadow-md';
        case 'esmeralda': return 'border-2 border-emerald-300 dark:border-emerald-900/60 shadow-md';
        case 'dourado': return 'border-2 border-amber-300 dark:border-amber-900/60 shadow-md';
      }
    }
    return 'border border-slate-200 dark:border-slate-800 shadow-sm';
  };

  const getThemeButtonBg = () => {
    switch (theme) {
      case 'bordo': return 'bg-rose-900 hover:bg-rose-800 text-white';
      case 'azul': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'esmeralda': return 'bg-emerald-700 hover:bg-emerald-800 text-white';
      case 'dourado': return 'bg-amber-600 hover:bg-amber-700 text-white';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header & Report Sub-Tabs */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 ${getContainerBorder()} space-y-4 print:hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className={`w-5 h-5 ${theme === 'bordo' ? 'text-rose-700' : 'text-blue-600'}`} />
              <span>Central de Relatórios & Auditoria da Jornada do Lead</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhe relatórios de pastas, visitas, leads e a auditoria de desempenho por corretor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className={`flex items-center gap-2 px-4 py-2 ${getThemeButtonBg()} font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer`}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Report Category Sub-Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-4 overflow-x-auto scroll-smooth">
          <button
            onClick={() => setActiveReportTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeReportTab === 'leads' ? getThemeButtonBg() : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Relatório de Leads & Vendas
          </button>
          <button
            onClick={() => setActiveReportTab('pastas')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeReportTab === 'pastas' ? getThemeButtonBg() : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Relatório de Pastas (Documentos)
          </button>
          <button
            onClick={() => setActiveReportTab('visitas')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeReportTab === 'visitas' ? getThemeButtonBg() : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Relatório de Visitas ao Plantão
          </button>
          <button
            onClick={() => setActiveReportTab('jornada')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeReportTab === 'jornada' ? getThemeButtonBg() : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Auditoria da Jornada & Corretores 🏆
          </button>
        </div>

        {/* Report Filter Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Filtro de Escopo
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="general">Geral (Todos os Leads)</option>
              <option value="broker">Por Corretor Específico</option>
              <option value="development">Por Empreendimento</option>
            </select>
          </div>

          {reportType === 'broker' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Selecionar Corretor
              </label>
              <select
                value={selectedBroker}
                onChange={(e) => setSelectedBroker(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                {brokersList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'development' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Selecionar Empreendimento
              </label>
              <select
                value={selectedDevelopment}
                onChange={(e) => setSelectedDevelopment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                {developmentsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* REPORT VIEW 1: LEADS & VENDAS */}
      {activeReportTab === 'leads' && (
        <div className={`bg-white dark:bg-slate-900 ${getContainerBorder()} rounded-2xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Relatório de Leads & Vendas</h3>
              <p className="text-xs text-slate-500">Resumo consolidado de leads, conversões e VGV total.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
              {totalLeads} registros
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Total de Leads</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalLeads}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Vendas Realizadas</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{salesCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Créditos Aprovados</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{approvedCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">VGV Total</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatCurrency(totalVGV)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Contato</th>
                  <th className="py-3 px-3">Corretor</th>
                  <th className="py-3 px-3">Empreendimento</th>
                  <th className="py-3 px-3">Origem</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Valor VGV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {reportLeads.map((lead) => {
                  const stage = STAGE_CONFIG[lead.status];
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{lead.clientName}</td>
                      <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">{lead.clientPhone}</td>
                      <td className="py-3 px-3 text-xs font-medium text-slate-700 dark:text-slate-300">{lead.brokerName}</td>
                      <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300">{lead.development} ({lead.propertyUnit})</td>
                      <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">{lead.origin}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${stage.bg} ${stage.color}`}>
                          {stage.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(lead.propertyValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW 2: PASTAS (DOCUMENTOS) */}
      {activeReportTab === 'pastas' && (
        <div className={`bg-white dark:bg-slate-900 ${getContainerBorder()} rounded-2xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <span>Relatório de Pastas & Documentação</span>
              </h3>
              <p className="text-xs text-slate-500">Quantidade de pastas completas, incompletas e em atendimento.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg">
              Setor de Crédito & Pastas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Pastas Completas</p>
              <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">{pastasCompletas}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Pastas Incompletas</p>
              <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">{pastasIncompletas}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Em Atendimento</p>
              <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">{pastasEmAtendimento}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Em Visita</p>
              <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">{pastasVisita}</p>
            </div>
          </div>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Corretor</th>
                  <th className="py-3 px-3">Empreendimento</th>
                  <th className="py-3 px-3">Status da Pasta</th>
                  <th className="py-3 px-3">Status de Crédito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {reportLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{lead.clientName}</td>
                    <td className="py-3 px-3 text-xs font-medium text-slate-700 dark:text-slate-300">{lead.brokerName}</td>
                    <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300">{lead.development}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        lead.pastaStatus === 'completa' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        lead.pastaStatus === 'em_atendimento' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {lead.pastaStatus || 'Incompleta'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                      {lead.creditStatus || 'Em Atendimento'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW 3: VISITAS AO PLANTÃO */}
      {activeReportTab === 'visitas' && (
        <div className={`bg-white dark:bg-slate-900 ${getContainerBorder()} rounded-2xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <span>Relatório de Visitas ao Plantão</span>
              </h3>
              <p className="text-xs text-slate-500">Agendamentos e comparecimentos de clientes nos stands de vendas.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg">
              Plantão Imobiliário
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Total de Visitas Registradas</p>
              <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">{visitasTotal}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Com Horário Marcado</p>
              <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">{visitasComData}</p>
            </div>
          </div>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Corretor</th>
                  <th className="py-3 px-3">Empreendimento</th>
                  <th className="py-3 px-3">Data / Horário da Visita</th>
                  <th className="py-3 px-3">Telefone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {reportLeads.filter(l => l.visitDate || l.status === 'visita_plantao').map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{lead.clientName}</td>
                    <td className="py-3 px-3 text-xs font-medium text-slate-700 dark:text-slate-300">{lead.brokerName}</td>
                    <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300">{lead.development}</td>
                    <td className="py-3 px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {lead.visitDate ? new Date(lead.visitDate).toLocaleString('pt-BR') : 'Agendado no plantão'}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{lead.clientPhone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW 4: AUDITORIA DA JORNADA & CORRETORES */}
      {activeReportTab === 'jornada' && (
        <div className={`bg-white dark:bg-slate-900 ${getContainerBorder()} rounded-2xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-600" />
                <span>Auditoria da Jornada do Lead & Desempenho por Corretor</span>
              </h3>
              <p className="text-xs text-slate-500">
                Descubra quem tem mais leads, quem executa a jornada de atendimento corretamente e quem possui leads estagnados.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-lg">
              Rank & Compliance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Corretor Destaque (Mais Leads)</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {brokerAuditData[0]?.brokerName || 'N/A'} ({brokerAuditData[0]?.totalLeads || 0} leads)
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Jornada Correta (Alta Evolução)</p>
              <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mt-1">
                {brokerAuditData.filter(b => b.isCorrectJourney).length} corretores em conformidade
              </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">Leads Estagnados / Parados</p>
              <p className="text-lg font-bold text-rose-800 dark:text-rose-200 mt-1">
                {brokerAuditData.reduce((acc, curr) => acc + curr.stuckLeads, 0)} leads sem movimentação
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Corretor / Equipe</th>
                  <th className="py-3 px-3 text-center">Total de Leads</th>
                  <th className="py-3 px-3 text-center">Visitas Realizadas</th>
                  <th className="py-3 px-3 text-center">Pastas / Crédito</th>
                  <th className="py-3 px-3 text-center">Vendas Fechadas</th>
                  <th className="py-3 px-3">Avaliação da Jornada do Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {brokerAuditData.map((audit, idx) => (
                  <tr key={audit.brokerName} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      {audit.brokerName}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                      {audit.totalLeads}
                    </td>
                    <td className="py-3 px-3 text-center text-indigo-600 dark:text-indigo-400 font-semibold">
                      {audit.visitsCount}
                    </td>
                    <td className="py-3 px-3 text-center text-amber-600 dark:text-amber-400 font-semibold">
                      {audit.foldersCount}
                    </td>
                    <td className="py-3 px-3 text-center text-purple-600 dark:text-purple-400 font-bold">
                      {audit.salesCount}
                    </td>
                    <td className="py-3 px-3">
                      {audit.totalLeads === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          <AlertTriangle className="w-3.5 h-3.5" /> Sem leads atribuídos
                        </span>
                      ) : audit.isCorrectJourney ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Check className="w-3.5 h-3.5" /> Jornada Correta (Evolui leads com visitas e pastas)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <XCircle className="w-3.5 h-3.5" /> Jornada Incompleta (Leads estagnados sem avanço)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
