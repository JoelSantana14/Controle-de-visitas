import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, User, Building2, Calendar, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
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

  const [reportType, setReportType] = useState<'general' | 'broker' | 'development'>('general');
  const [selectedBroker, setSelectedBroker] = useState<string>(brokersList[0]);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>(developmentsList[0]);

  // Keep selected broker/development synchronized if list changes
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const exportExcel = () => {
    const headers = ['Cliente', 'Telefone', 'E-mail', 'Corretor', 'Empreendimento', 'Origem', 'Status', 'Unidade', 'Valor VGV', 'Data Visita'];
    const rows = reportLeads.map(l => [
      `"${l.clientName.replace(/"/g, '""')}"`,
      `"${l.clientPhone.replace(/"/g, '""')}"`,
      `"${(l.clientEmail || '').replace(/"/g, '""')}"`,
      `"${l.brokerName.replace(/"/g, '""')}"`,
      `"${l.development.replace(/"/g, '""')}"`,
      `"${l.origin.replace(/"/g, '""')}"`,
      `"${(STAGE_CONFIG[l.status]?.label || l.status).replace(/"/g, '""')}"`,
      `"${(l.propertyUnit || '').replace(/"/g, '""')}"`,
      l.propertyValue,
      `"${(l.visitDate || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = reportType === 'broker' 
      ? `relatorio_corretor_${selectedBroker.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
      : reportType === 'development'
      ? `relatorio_empreendimento_${selectedDevelopment.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
      : `relatorio_geral_immoflow_${new Date().toISOString().slice(0, 10)}.csv`;
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
      
      {/* Header & Controls */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 ${getContainerBorder()} space-y-4 print:hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className={`w-5 h-5 ${theme === 'bordo' ? 'text-rose-700' : 'text-blue-600'}`} />
              <span>Central de Relatórios & Exportação (Excel & PDF)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gere relatórios gerenciais consolidados gerais ou individuais por corretor e empreendimento.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className={`flex items-center gap-2 px-4 py-2 ${getThemeButtonBg()} font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer`}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Report Filter Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="general">Relatório Geral (Todos os Leads)</option>
              <option value="broker">Relatório Individual por Corretor</option>
              <option value="development">Relatório por Empreendimento</option>
            </select>
          </div>

          {reportType === 'broker' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Selecionar Corretor ({brokersList.length} cadastrados)
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
                Selecionar Empreendimento ({developmentsList.length} cadastrados)
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

      {/* Printable Report Card */}
      <div className={`bg-white dark:bg-slate-900 ${getContainerBorder()} rounded-2xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0`}>
        
        {/* Report Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Relatório de Desempenho Imobiliário - ImmoFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {reportType === 'general' && 'Visão consolidada geral de todos os leads e vendas.'}
              {reportType === 'broker' && `Relatório individual do(a) corretor(a): ${selectedBroker}`}
              {reportType === 'development' && `Relatório do empreendimento: ${selectedDevelopment}`}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        {/* Summary Metrics */}
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

        {/* Report Table */}
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
              {reportLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Nenhum registro encontrado para este relatório.
                  </td>
                </tr>
              ) : (
                reportLeads.map((lead) => {
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
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
