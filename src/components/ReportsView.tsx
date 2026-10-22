import React, { useState } from 'react';
import { FileText, Download, Printer, User, Building2, Calendar, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { Lead, STAGE_CONFIG, BROKERS, DEVELOPMENTS } from '../types';

interface ReportsViewProps {
  leads: Lead[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ leads }) => {
  const [reportType, setReportType] = useState<'general' | 'broker' | 'development'>('general');
  const [selectedBroker, setSelectedBroker] = useState<string>(BROKERS[0]);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>(DEVELOPMENTS[0]);

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
      `"${l.clientName}"`,
      `"${l.clientPhone}"`,
      `"${l.clientEmail || ''}"`,
      `"${l.brokerName}"`,
      `"${l.development}"`,
      `"${l.origin}"`,
      `"${STAGE_CONFIG[l.status]?.label || l.status}"`,
      `"${l.propertyUnit}"`,
      l.propertyValue,
      `"${l.visitDate || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_immoflow_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Central de Relatórios & Exportação (Excel & PDF)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gere relatórios gerenciais gerais ou individuais por corretor e empreendimento.
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
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
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value="general">Relatório Geral (Todos os Leads)</option>
              <option value="broker">Relatório Individual por Corretor</option>
              <option value="development">Relatório por Empreendimento</option>
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
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              >
                {BROKERS.map(b => (
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
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              >
                {DEVELOPMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        
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
