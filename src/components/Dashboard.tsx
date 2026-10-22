import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  FolderOpen, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BadgePercent, 
  TrendingUp, 
  Award,
  PieChart as PieChartIcon,
  Bell,
  Clock,
  Phone,
  Target,
  Edit2,
  Check
} from 'lucide-react';
import { Lead, STAGE_CONFIG, BROKERS } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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
  // Monthly sales goals per broker (default R$ 1,200,000 each)
  const [brokerGoals, setBrokerGoals] = useState<Record<string, number>>(() => {
    const defaultGoals: Record<string, number> = {};
    BROKERS.forEach(b => {
      defaultGoals[b] = 1200000; // R$ 1.2M default goal
    });
    return defaultGoals;
  });

  const [editingBroker, setEditingBroker] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState<number>(1200000);

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

  // Today visits calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayVisits = leads.filter(l => {
    if (!l.visitDate) return false;
    return l.visitDate.startsWith(todayStr);
  });

  // Origins stats for Recharts
  const originStats: Record<string, number> = {};
  leads.forEach(l => {
    originStats[l.origin] = (originStats[l.origin] || 0) + 1;
  });

  const originChartData = Object.entries(originStats).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#059669', '#d97706', '#0284c7', '#9333ea'];

  // Broker stats
  const brokerStats: Record<string, { count: number; sales: number; vgv: number }> = {};
  BROKERS.forEach(b => {
    brokerStats[b] = { count: 0, sales: 0, vgv: 0 };
  });

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

  const openWhatsApp = (phone: string, clientName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${clientName}, tudo bem? Confirmando nossa visita ao plantão hoje...`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSaveGoal = (brokerName: string) => {
    setBrokerGoals(prev => ({ ...prev, [brokerName]: tempGoal }));
    setEditingBroker(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Today Visits Urgent Notification Banner */}
      {todayVisits.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 relative">
              <Bell className="w-6 h-6 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-rose-600 rounded-full text-xs font-bold flex items-center justify-center shadow">
                {todayVisits.length}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Agenda de Plantão para Hoje!</h2>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Você tem {todayVisits.length} {todayVisits.length === 1 ? 'visita agendada' : 'visitas agendadas'} para hoje no plantão. Confira os clientes abaixo:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {todayVisits.map(tv => (
              <div key={tv.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-xs flex items-center gap-3">
                <div>
                  <p className="font-bold text-white">{tv.clientName}</p>
                  <p className="text-[10px] text-amber-100 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {tv.visitDate?.slice(11, 16) || 'Horário não def.'} • {tv.development}
                  </p>
                </div>
                <button
                  onClick={() => openWhatsApp(tv.clientPhone, tv.clientName)}
                  className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-amber-50 transition-colors"
                  title="WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          {todayVisits.length > 0 && (
            <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg animate-pulse">
              {todayVisits.length} Hoje!
            </span>
          )}
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
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{visitsCount}</h3>
              {todayVisits.length > 0 && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  ({todayVisits.length} hoje)
                </span>
              )}
            </div>
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

      {/* Credit Analysis Breakdown & Origins Pie Chart */}
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

        {/* Lead Origins Pie Chart (Recharts) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-500" />
              <span>Distribuição de Leads por Origem (Canais de Marketing)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Eficiência de Captação</span>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={originChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {originChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} leads`, 'Quantidade']}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Monthly Sales Goals per Broker & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Sales Goals Progress Bars */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Metas Mensais por Corretor</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">VGV Real vs Meta</span>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {BROKERS.map((broker) => {
              const stats = brokerStats[broker] || { count: 0, sales: 0, vgv: 0 };
              const goal = brokerGoals[broker] || 1200000;
              const percentage = Math.min(Math.round((stats.vgv / goal) * 100), 100);
              const isEditing = editingBroker === broker;

              return (
                <div key={broker} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{broker}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {stats.sales} vendas fechadas ({formatCurrency(stats.vgv)})
                      </p>
                    </div>

                    <div className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(Number(e.target.value))}
                            className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveGoal(broker)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            Meta: {formatCurrency(goal)}
                          </span>
                          <button
                            onClick={() => { setEditingBroker(broker); setTempGoal(goal); }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Editar Meta"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      <span>Progresso</span>
                      <span className={`font-bold ${percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {percentage}% {percentage >= 100 ? '🎉 (Meta Atingida!)' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 100 
                            ? 'bg-emerald-500' 
                            : percentage >= 50 
                            ? 'bg-blue-600' 
                            : 'bg-amber-500'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leads Table Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col">
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

          <div className="overflow-x-auto flex-1">
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
                  const isTodayVisit = lead.visitDate && lead.visitDate.startsWith(todayStr);

                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div>
                          {lead.clientName}
                          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{lead.clientPhone}</span>
                        </div>
                        {isTodayVisit && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold animate-pulse">
                            Visita Hoje!
                          </span>
                        )}
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

    </div>
  );
};
