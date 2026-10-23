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
import { Lead, STAGE_CONFIG, BrokerItem, ThemeMode, BorderMode } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigateTab: (tab: string) => void;
  brokers?: BrokerItem[];
  theme?: ThemeMode;
  borderMode?: BorderMode;
}

export const Dashboard: React.FC<DashboardProps> = ({
  leads,
  onSelectLead,
  onNavigateTab,
  brokers = [],
  theme = 'bordo',
  borderMode = 'destacada',
}) => {
  // Monthly sales goals per broker
  const [brokerGoals, setBrokerGoals] = useState<Record<string, number>>(() => {
    const defaultGoals: Record<string, number> = {};
    brokers.forEach(b => {
      defaultGoals[b.name] = b.monthlyGoal || 1200000;
    });
    return defaultGoals;
  });

  const [editingBroker, setEditingBroker] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState<number>(1200000);
  const [selectedBrokerFilter, setSelectedBrokerFilter] = useState<string>('todos');

  const activeLeads = selectedBrokerFilter === 'todos'
    ? leads
    : leads.filter(l => l.brokerName === selectedBrokerFilter);

  const totalLeads = activeLeads.length;
  const visitsCount = activeLeads.filter(l => l.status === 'visita_plantao' || l.visitDate).length;
  const foldersCount = activeLeads.filter(l => l.status === 'montagem_pasta').length;
  const approvedCount = activeLeads.filter(l => l.status === 'credito_aprovado').length;
  const conditionedCount = activeLeads.filter(l => l.status === 'credito_condicionado').length;
  const rejectedCount = activeLeads.filter(l => l.status === 'credito_reprovado').length;
  const salesCount = activeLeads.filter(l => l.status === 'venda_realizada').length;

  const totalVGV = activeLeads
    .filter(l => l.status === 'venda_realizada')
    .reduce((acc, curr) => acc + (curr.propertyValue || 0), 0);

  // Executive Top-level KPIs
  const conversionRate = totalLeads > 0 ? ((salesCount / totalLeads) * 100).toFixed(1) : '0';

  // Sales Funnel Data for Recharts
  const funnelCountLead = totalLeads;
  const funnelCountVisita = activeLeads.filter(l => l.status === 'visita_plantao' || l.status === 'montagem_pasta' || l.status === 'credito_condicionado' || l.status === 'credito_aprovado' || l.status === 'venda_realizada' || l.visitDate).length;
  const funnelCountPasta = activeLeads.filter(l => l.status === 'montagem_pasta' || l.status === 'credito_condicionado' || l.status === 'credito_aprovado' || l.status === 'venda_realizada' || l.pastaStatus === 'completa').length;
  const funnelCountAprovado = activeLeads.filter(l => l.status === 'credito_aprovado' || l.status === 'venda_realizada' || l.creditStatus === 'aprovado').length;
  const funnelCountVenda = salesCount;

  const funnelData = [
    { name: '1. Lead', count: funnelCountLead, conversion: '100%', fill: theme === 'bordo' ? '#881337' : '#2563eb' },
    { name: '2. Visita', count: funnelCountVisita, conversion: `${funnelCountLead > 0 ? ((funnelCountVisita / funnelCountLead) * 100).toFixed(1) : 0}%`, fill: theme === 'bordo' ? '#9f1239' : '#3b82f6' },
    { name: '3. Pasta', count: funnelCountPasta, conversion: `${funnelCountLead > 0 ? ((funnelCountPasta / funnelCountLead) * 100).toFixed(1) : 0}%`, fill: theme === 'bordo' ? '#be123c' : '#4f46e5' },
    { name: '4. Aprovado', count: funnelCountAprovado, conversion: `${funnelCountLead > 0 ? ((funnelCountAprovado / funnelCountLead) * 100).toFixed(1) : 0}%`, fill: theme === 'bordo' ? '#e11d48' : '#7c3aed' },
    { name: '5. Venda', count: funnelCountVenda, conversion: `${conversionRate}%`, fill: theme === 'bordo' ? '#f43f5e' : '#db2777' },
  ];
  
  const closedLeads = activeLeads.filter(l => l.status === 'venda_realizada');
  let totalDays = 0;
  closedLeads.forEach(l => {
    const created = new Date(l.createdAt).getTime();
    const updated = new Date(l.updatedAt || l.createdAt).getTime();
    const diffDays = Math.max(1, Math.round((updated - created) / (1000 * 60 * 60 * 24)));
    totalDays += diffDays;
  });
  const avgTimeToClose = closedLeads.length > 0 ? Math.round(totalDays / closedLeads.length) : 12;

  let activeDocsCount = 0;
  let pendingDocsCount = 0;
  activeLeads.forEach(l => {
    (l.documents || []).forEach(doc => {
      if (doc.status === 'aprovado' || doc.status === 'enviado') {
        activeDocsCount++;
      } else {
        pendingDocsCount++;
      }
    });
  });

  // Today visits calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayVisits = activeLeads.filter(l => {
    if (!l.visitDate) return false;
    return l.visitDate.startsWith(todayStr);
  });

  // Origins stats for Recharts
  const originStats: Record<string, number> = {};
  activeLeads.forEach(l => {
    originStats[l.origin] = (originStats[l.origin] || 0) + 1;
  });

  const originChartData = Object.entries(originStats)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const COLORS = theme === 'bordo' 
    ? ['#881337', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#b91c1c', '#c2410c', '#b45309']
    : ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#059669', '#d97706', '#0284c7', '#9333ea'];

  // Broker stats
  const brokerStats: Record<string, { count: number; sales: number; vgv: number }> = {};
  brokers.forEach(b => {
    brokerStats[b.name] = { count: 0, sales: 0, vgv: 0 };
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
    const link = document.createElement('a');
    link.href = `https://wa.me/55${cleanPhone}?text=${message}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSaveGoal = (brokerName: string) => {
    setBrokerGoals(prev => ({ ...prev, [brokerName]: tempGoal }));
    setEditingBroker(null);
  };

  const borderClass = borderMode === 'destacada'
    ? theme === 'bordo' ? 'border-2 border-rose-800/60 shadow-md' : 'border-2 border-blue-600/50 shadow-md'
    : 'border border-slate-200 dark:border-slate-800 shadow-xs';

  const bannerClass = theme === 'bordo'
    ? 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 shadow-xl shadow-rose-950/20'
    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 shadow-xl shadow-blue-500/10';

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

      {/* Broker Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Users className={`w-5 h-5 ${theme === 'bordo' ? 'text-rose-800' : 'text-blue-600'}`} />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Filtrar Desempenho e Leads por Corretor</h2>
            <p className="text-xs text-slate-500">
              {selectedBrokerFilter === 'todos' ? 'Exibindo dados consolidados de todos os corretores' : `Filtrando por: ${selectedBrokerFilter}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBrokerFilter}
            onChange={(e) => setSelectedBrokerFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-800 cursor-pointer"
          >
            <option value="todos">👥 Todos os Corretores (Geral)</option>
            {brokers.map(b => (
              <option key={b.id} value={b.name}>👤 {b.name} ({b.team})</option>
            ))}
          </select>
          {selectedBrokerFilter !== 'todos' && (
            <button
              onClick={() => setSelectedBrokerFilter('todos')}
              className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
            >
              Limpar Filtro
            </button>
          )}
        </div>
      </div>

      {/* Top Banner / Welcome */}
      <div className={`rounded-2xl p-6 sm:p-8 text-white ${bannerClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-rose-200" />
              <span>Painel de Controle de Vendas & Plantão</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Visão Geral do ImmoFlow
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Monitore a captação de leads por origem, visitas ao plantão, montagem de pastas, status de crédito e fechamento de VGV.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[140px]">
              <p className="text-xs text-rose-200 font-medium">VGV Total Fechado</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5">{formatCurrency(totalVGV)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[140px]">
              <p className="text-xs text-rose-200 font-medium">Vendas Realizadas</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5">{salesCount} contratos</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigateTab('kanban')}
          className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              theme === 'bordo' ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              theme === 'bordo' ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            }`}>
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
          className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden`}
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
          className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group`}
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
          className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group`}
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

      {/* Executive Summary KPIs: Total Conversion Rate, Avg Time to Close, Active vs Pending Documents */}
      <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${theme === 'bordo' ? 'text-rose-800' : 'text-blue-600'}`} />
            <span>Resumo Executivo & KPIs de Desempenho</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
            Indicadores Chave
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">Taxa de Conversão Total</p>
              <h4 className="text-2xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">{conversionRate}%</h4>
              <p className="text-[10px] text-purple-700/80 dark:text-purple-400 mt-0.5">Leads convertidos em vendas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              🎯
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Tempo Médio p/ Fechamento</p>
              <h4 className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">{avgTimeToClose} dias</h4>
              <p className="text-[10px] text-blue-700/80 dark:text-blue-400 mt-0.5">Do lead à venda realizada</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              ⏱️
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Documentos Pastas</p>
              <h4 className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
                {activeDocsCount} <span className="text-xs font-normal text-emerald-700">ativos</span> / {pendingDocsCount} <span className="text-xs font-normal text-amber-700">pendentes</span>
              </h4>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">Status de aprovação documental</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              📂
            </div>
          </div>
        </div>
      </div>

      {/* Sales Funnel Conversion Chart (Recharts) */}
      <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${theme === 'bordo' ? 'text-rose-800' : 'text-blue-600'}`} />
              <span>Funil de Vendas & Taxas de Conversão por Etapa</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fluxo progressivo de conversão do lead até o fechamento do contrato
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
            Pipeline de Conversão
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Recharts Bar Chart representing Funnel */}
          <div className="lg:col-span-8 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={110} />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} leads (${item.payload.conversion} de conversão)`,
                    'Quantidade'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-funnel-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right: Funnel Stage Cards with Conversion % */}
          <div className="lg:col-span-4 space-y-2">
            {funnelData.map((stage, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.fill }} />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stage.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{stage.count} leads</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {stage.conversion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Analysis Breakdown & Origins Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Credit Analysis Status Cards */}
        <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6`}>
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

        {/* Lead Origins Donut Chart & Structured Breakdown (Clean, anti-overflow) */}
        <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 lg:col-span-2 flex flex-col overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className={`w-5 h-5 flex-shrink-0 ${theme === 'bordo' ? 'text-rose-700' : 'text-blue-500'}`} />
                <span>Distribuição de Leads por Origem</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Canais de marketing e eficiência na geração de contatos
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg self-start sm:self-auto">
              {originChartData.length} canais ativos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Donut Chart with Centered Total Counter */}
            <div className="md:col-span-5 relative flex items-center justify-center min-h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={originChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {originChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${value} leads (${((Number(value) / (totalLeads || 1)) * 100).toFixed(0)}%)`, 
                      name
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #334155', 
                      borderRadius: '10px', 
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {totalLeads}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  Total Leads
                </span>
              </div>
            </div>

            {/* Right: Structured Channels Ranking List (no overflow, completely legible) */}
            <div className="md:col-span-7 space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {originChartData.map((item, index) => {
                const percent = totalLeads > 0 ? Math.round((item.value / totalLeads) * 100) : 0;
                const color = COLORS[index % COLORS.length];

                return (
                  <div 
                    key={item.name}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: color }} 
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.value} {item.value === 1 ? 'lead' : 'leads'}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">
                          ({percent}%)
                        </span>
                      </div>
                    </div>
                    {/* Channel Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%`, backgroundColor: color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Pastas & Motivos de Reprovação / Condicionamento (BACEN, Comprometimento de Renda, SPC e Serasa, CONRES, SCR, Outros) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pastas Status Overview */}
        <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className={`w-5 h-5 ${theme === 'bordo' ? 'text-rose-800' : 'text-blue-600'}`} />
              <span>Controle e Quantidade de Pastas</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg">
              Documentação
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Completas</p>
              <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
                {leads.filter(l => l.pastaStatus === 'completa').length}
              </p>
            </div>
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Incompletas</p>
              <p className="text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
                {leads.filter(l => l.pastaStatus === 'incompleta' || !l.pastaStatus).length}
              </p>
            </div>
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Em Atendimento</p>
              <p className="text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                {leads.filter(l => l.pastaStatus === 'em_atendimento' || l.creditStatus === 'em_atendimento').length}
              </p>
            </div>
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-center">
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Visita</p>
              <p className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
                {leads.filter(l => l.pastaStatus === 'visita' || l.creditStatus === 'visita' || l.status === 'visita_plantao').length}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection / Condition Reasons Breakdown */}
        <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Motivos de Reprovação / Condicionamento</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg">
              Laudos Bancários
            </span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {[
              { key: 'bacen', label: 'BACEN (Sistema Bancário)' },
              { key: 'comprometimento_renda', label: 'Comprometimento de Renda (>30%)' },
              { key: 'spc_serasa', label: 'SPC e Serasa (Apontamento)' },
              { key: 'conres', label: 'CONRES (Restritivo)' },
              { key: 'scr', label: 'SCR (Informações de Crédito)' },
              { key: 'outros', label: 'Outros Motivos' },
            ].map(item => {
              const count = leads.filter(l => l.rejectionReason === item.key).length;
              return (
                <div key={item.key} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                  <span className="font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded-full">
                    {count} {count === 1 ? 'caso' : 'casos'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Monthly Sales Goals per Broker & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Sales Goals Progress Bars */}
        <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 space-y-4 overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className={`w-5 h-5 flex-shrink-0 ${theme === 'bordo' ? 'text-rose-800' : 'text-blue-600'}`} />
                <span>Metas Mensais por Corretor</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                VGV Real fechado vs Meta estipulada
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-start sm:self-auto">
              {brokers.length} corretores
            </span>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {brokers.map((broker) => {
              const stats = brokerStats[broker.name] || { count: 0, sales: 0, vgv: 0 };
              const goal = brokerGoals[broker.name] || broker.monthlyGoal || 1200000;
              const percentage = Math.min(Math.round((stats.vgv / goal) * 100), 100);
              const isEditing = editingBroker === broker.name;

              return (
                <div key={broker.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{broker.name}</p>
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
                            onClick={() => handleSaveGoal(broker.name)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className={`text-xs font-bold ${theme === 'bordo' ? 'text-rose-800 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            Meta: {formatCurrency(goal)}
                          </span>
                          <button
                            onClick={() => { setEditingBroker(broker.name); setTempGoal(goal); }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                      <span className={`font-bold ${percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400' : theme === 'bordo' ? 'text-rose-800 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {percentage}% {percentage >= 100 ? '🎉 (Meta Atingida!)' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 100 
                            ? 'bg-emerald-500' 
                            : percentage >= 50 
                            ? theme === 'bordo' ? 'bg-rose-900' : 'bg-blue-600'
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
        <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 lg:col-span-2 flex flex-col`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Últimos Leads e Atendimentos Recentes
            </h3>
            <button
              onClick={() => onNavigateTab('leads')}
              className={`text-xs font-semibold hover:underline cursor-pointer ${
                theme === 'bordo' ? 'text-rose-800 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
              }`}
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
