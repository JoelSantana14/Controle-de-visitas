import React from 'react';
import { 
  Users, 
  MapPin, 
  FolderOpen, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BadgePercent, 
  TrendingUp, 
  DollarSign, 
  Building,
  Award
} from 'lucide-react';
import { Lead, STAGE_CONFIG } from '../types';

interface DashboardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  leads,
  onSelectLead,
  onNavigateTab,
}) => {
  const totalLeads = leads.length;
  const visitsCount = leads.filter(l => l.status === 'visita_plantao' || l.visitDate).length;
  const foldersCount = leads.filter(l => l.status === 'montagem_pasta').length;
  const approvedCount = leads.filter(l => l.status === 'credito_aprovado').length;
  const conditionedCount = leads.filter(l => l.status === 'credito_condicionado').length;
  const rejectedCount = leads.filter(l => l.status === 'credito_reprovado').length;
  const salesCount = leads.filter(l => l.status === 'venda_realizada').length;

  const totalVGV = leads
    .filter(l => l.status === 'venda_realizada')
    .reduce((acc, curr) => acc + (curr.propertyValue || 0), 0);

  const potentialVGV = leads
    .reduce((acc, curr) => acc + (curr.propertyValue || 0), 0);

  // Origins stats
  const originStats: Record<string, number> = {};
  leads.forEach(l => {
    originStats[l.origin] = (originStats[l.origin] || 0) + 1;
  });

  // Broker stats
  const brokerStats: Record<string, { count: number; sales: number; vgv: number }> = {};
  leads.forEach(l => {
    if (!brokerStats[l.brokerName]) {
      brokerStats[l.brokerName] = { count: 0, sales: 0, vgv: 0 };
    }
    brokerStats[l.brokerName].count += 1;
    if (l.status === 'venda_realizada') {
      brokerStats[l.brokerName].sales += 1;
      brokerStats[l.brokerName].vgv += l.propertyValue || 0;
    }
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-blue-200" />
              <span>Painel de Controle de Vendas & Plantão</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Visão Geral do ImmoFlow
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Monitore a captação de leads por origem, visitas ao plantão, montagem de pastas, status de crédito e fechamento de VGV.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[140px]">
              <p className="text-xs text-blue-200 font-medium">VGV Total Fechado</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5">{formatCurrency(totalVGV)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[140px]">
              <p className="text-xs text-blue-200 font-medium">Vendas Realizadas</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5">{salesCount} contratos</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigateTab('kanban')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full">
              Ativos
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Leads</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalLeads}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('kanban')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full">
              Plantão
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Visitas ao Plantão</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{visitsCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('kanban')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full">
              Crédito
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pastas em Montagem</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{foldersCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('kanban')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BadgePercent className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-full">
              Fechados
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vendas Realizadas</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{salesCount}</h3>
          </div>
        </div>

      </div>

      {/* Credit Analysis Breakdown & Origins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Credit Analysis Status Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Status da Análise de Crédito</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Aprovados</span>
              </div>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{approvedCount}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold text-orange-900 dark:text-orange-200">Condicionados (Pendentes)</span>
              </div>
              <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{conditionedCount}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-semibold text-rose-900 dark:text-rose-200">Reprovados</span>
              </div>
              <span className="text-lg font-bold text-rose-700 dark:text-rose-300">{rejectedCount}</span>
            </div>
          </div>
        </div>

        {/* Lead Origins Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Origem dos Leads</span>
          </h3>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {Object.entries(originStats).map(([origin, count]) => {
              const percentage = Math.round((count / totalLeads) * 100) || 0;
              return (
                <div key={origin} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>{origin}</span>
                    <span className="font-bold">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Broker Leaderboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            <span>Desempenho por Corretor</span>
          </h3>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {Object.entries(brokerStats).map(([broker, stats]) => (
              <div key={broker} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{broker}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stats.count} leads • {stats.sales} vendas</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.vgv)}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                    VGV Fechado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Leads Table Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Últimos Leads e Atendimentos Recentes
          </h3>
          <button
            onClick={() => onNavigateTab('leads')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver todos os leads →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-4">Cliente</th>
                <th className="pb-3 px-4">Empreendimento</th>
                <th className="pb-3 px-4">Origem</th>
                <th className="pb-3 px-4">Corretor</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-right">Valor (VGV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {leads.slice(0, 5).map((lead) => {
                const stage = STAGE_CONFIG[lead.status];
                return (
                  <tr 
                    key={lead.id} 
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {lead.clientName}
                      <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{lead.clientPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {lead.development}
                      <span className="block text-xs text-slate-500 font-normal">{lead.propertyUnit}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{lead.origin}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 text-xs font-medium">{lead.brokerName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${stage.bg} ${stage.color} border ${stage.border}`}>
                        {stage.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(lead.propertyValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
