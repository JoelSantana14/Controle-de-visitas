import React, { useState } from 'react';
import { 
  Send, 
  Shuffle, 
  UserCheck, 
  Clock, 
  Settings2, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  Phone, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  MessageCircle,
  HelpCircle,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { 
  Lead, 
  BrokerItem, 
  DevelopmentItem, 
  OriginItem, 
  DistributionRule, 
  DistributionSettings, 
  DistributionLog,
  ThemeMode, 
  BorderMode 
} from '../types';
import { 
  distributeLead, 
  createDistributionLog, 
  buildBrokerNotificationUrl 
} from '../services/distributionEngine';

interface LeadDistributionViewProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
  brokers: BrokerItem[];
  onUpdateBrokers: (brokers: BrokerItem[]) => void;
  developments: DevelopmentItem[];
  origins: OriginItem[];
  distributionRules: DistributionRule[];
  onUpdateRules: (rules: DistributionRule[]) => void;
  distributionSettings: DistributionSettings;
  onUpdateSettings: (settings: DistributionSettings) => void;
  distributionLogs: DistributionLog[];
  onAddLog: (log: DistributionLog) => void;
  onOpenNewLeadModal: () => void;
  onSelectLeadDetails: (lead: Lead) => void;
  theme: ThemeMode;
  borderMode: BorderMode;
}

export const LeadDistributionView: React.FC<LeadDistributionViewProps> = ({
  leads,
  onUpdateLead,
  brokers,
  onUpdateBrokers,
  developments,
  origins,
  distributionRules,
  onUpdateRules,
  distributionSettings,
  onUpdateSettings,
  distributionLogs,
  onAddLog,
  onOpenNewLeadModal,
  onSelectLeadDetails,
  theme,
  borderMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'triagem' | 'plantao' | 'regras' | 'historico'>('triagem');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDev, setFilterDev] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');

  // Manual assignment modal state
  const [leadForManualAssignment, setLeadForManualAssignment] = useState<Lead | null>(null);
  const [selectedBrokerForManual, setSelectedBrokerForManual] = useState<string>('');

  // Rule creation/editing modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<DistributionRule | null>(null);
  const [ruleFormData, setRuleFormData] = useState<Partial<DistributionRule>>({
    name: '',
    active: true,
    priority: 5,
    strategy: 'round_robin',
    targetDevelopment: '',
    targetOrigin: '',
    minValue: 0,
    maxValue: 0,
    eligibleBrokerIds: [],
    description: '',
  });

  // Action toast/message
  const [notification, setNotification] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Pending leads for distribution: leads with status 'pendente_distribuicao' or assigned to 'Não atribuído'/'Triagem'
  const pendingLeads = leads.filter(l => 
    l.distributionStatus === 'pendente_distribuicao' || 
    !l.brokerName || 
    l.brokerName.toLowerCase().includes('triagem') ||
    l.brokerName.toLowerCase().includes('pendente') ||
    l.brokerName.toLowerCase().includes('não atribuído')
  );

  // Active duty brokers
  const dutyBrokers = brokers.filter(b => b.active && b.isDuty);
  const totalBrokers = brokers.filter(b => b.active).length;

  // Leads distributed today
  const todayStr = new Date().toLocaleDateString('pt-BR');
  const distributedTodayCount = distributionLogs.filter(log => log.timestamp.includes(todayStr)).length;

  // Filtered pending leads
  const filteredPendingLeads = pendingLeads.filter(l => {
    const matchesSearch = searchTerm === '' || 
      l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.clientPhone.includes(searchTerm) ||
      l.development.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDev = filterDev === '' || l.development === filterDev;
    const matchesOrigin = filterOrigin === '' || l.origin === filterOrigin;
    return matchesSearch && matchesDev && matchesOrigin;
  });

  // Theme styling helpers
  const getThemeColors = () => {
    switch (theme) {
      case 'bordo':
        return {
          primary: 'bg-rose-900 hover:bg-rose-800 text-white',
          accent: 'text-rose-700 dark:text-rose-400',
          badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          activeTab: 'bg-rose-900 text-white shadow-sm',
          focusRing: 'focus:ring-rose-800',
        };
      case 'esmeralda':
        return {
          primary: 'bg-emerald-700 hover:bg-emerald-600 text-white',
          accent: 'text-emerald-700 dark:text-emerald-400',
          badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          activeTab: 'bg-emerald-700 text-white shadow-sm',
          focusRing: 'focus:ring-emerald-700',
        };
      case 'dourado':
        return {
          primary: 'bg-amber-600 hover:bg-amber-500 text-white',
          accent: 'text-amber-700 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          activeTab: 'bg-amber-600 text-white shadow-sm',
          focusRing: 'focus:ring-amber-600',
        };
      default:
        return {
          primary: 'bg-blue-600 hover:bg-blue-500 text-white',
          accent: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          activeTab: 'bg-blue-600 text-white shadow-sm',
          focusRing: 'focus:ring-blue-600',
        };
    }
  };

  const themeColors = getThemeColors();
  const cardBorderClass = borderMode === 'destacada' 
    ? 'border border-slate-300 dark:border-slate-700 shadow-sm' 
    : 'border border-slate-200/60 dark:border-slate-800/60';

  // Handler: Distribute a single lead automatically via rules
  const handleAutoDistributeLead = (lead: Lead) => {
    const res = distributeLead(lead, brokers, distributionRules, distributionSettings);
    if (!res.success || !res.assignedBroker) {
      showNotice(`❌ Não foi possível distribuir: ${res.reason}`);
      return;
    }

    const assigned = res.assignedBroker;
    const nowIso = new Date().toISOString();

    // 1. Update lead
    const updatedLead: Lead = {
      ...lead,
      brokerName: assigned.name,
      distributionStatus: 'distribuido',
      distributionMode: 'automatico',
      distributionRuleName: res.ruleName,
      distributedAt: nowIso,
      updatedAt: nowIso,
      history: [
        ...lead.history,
        {
          id: `h-${Date.now()}`,
          date: new Date().toLocaleString('pt-BR'),
          action: `Lead distribuído automaticamente para ${assigned.name} (${res.ruleName})`,
          user: 'Sistema de Distribuição'
        }
      ]
    };
    onUpdateLead(updatedLead);

    // 2. Update broker counters
    const updatedBrokers = brokers.map(b => {
      if (b.id === assigned.id) {
        return {
          ...b,
          leadsReceivedToday: (b.leadsReceivedToday || 0) + 1,
          lastAssignedAt: nowIso,
        };
      }
      return b;
    });
    onUpdateBrokers(updatedBrokers);

    // 3. Create log
    const log = createDistributionLog(updatedLead, assigned, 'automatico', res.ruleName, res.ruleApplied?.id);
    onAddLog(log);

    showNotice(`⚡ Lead "${lead.clientName}" enviado com sucesso para ${assigned.name} via ${res.ruleName}!`);
  };

  // Handler: Distribute all pending leads
  const handleDistributeAllPending = () => {
    if (pendingLeads.length === 0) {
      showNotice('Nenhum lead pendente na fila.');
      return;
    }
    if (dutyBrokers.length === 0) {
      showNotice('❌ Nenhum corretor está com plantão ativo hoje. Ative os plantonistas primeiro.');
      return;
    }

    let countDistributed = 0;
    let currentBrokers = [...brokers];

    for (const lead of pendingLeads) {
      const res = distributeLead(lead, currentBrokers, distributionRules, distributionSettings);
      if (res.success && res.assignedBroker) {
        const assigned = res.assignedBroker;
        const nowIso = new Date().toISOString();

        const updatedLead: Lead = {
          ...lead,
          brokerName: assigned.name,
          distributionStatus: 'distribuido',
          distributionMode: 'automatico',
          distributionRuleName: res.ruleName,
          distributedAt: nowIso,
          updatedAt: nowIso,
          history: [
            ...lead.history,
            {
              id: `h-${Date.now()}-${countDistributed}`,
              date: new Date().toLocaleString('pt-BR'),
              action: `Distribuído em lote para ${assigned.name} (${res.ruleName})`,
              user: 'Mesa de Triagem'
            }
          ]
        };
        onUpdateLead(updatedLead);

        // Update local broker counters for the loop
        currentBrokers = currentBrokers.map(b => {
          if (b.id === assigned.id) {
            return {
              ...b,
              leadsReceivedToday: (b.leadsReceivedToday || 0) + 1,
              lastAssignedAt: nowIso,
            };
          }
          return b;
        });

        const log = createDistributionLog(updatedLead, assigned, 'automatico', res.ruleName, res.ruleApplied?.id);
        onAddLog(log);
        countDistributed++;
      }
    }

    onUpdateBrokers(currentBrokers);
    showNotice(`🎉 ${countDistributed} lead(s) distribuídos com sucesso para os corretores de plantão!`);
  };

  // Handler: Manual directed distribution
  const handleConfirmManualAssignment = () => {
    if (!leadForManualAssignment || !selectedBrokerForManual) return;
    const targetBroker = brokers.find(b => b.id === selectedBrokerForManual);
    if (!targetBroker) return;

    const nowIso = new Date().toISOString();
    const updatedLead: Lead = {
      ...leadForManualAssignment,
      brokerName: targetBroker.name,
      distributionStatus: 'distribuido',
      distributionMode: 'manual',
      distributionRuleName: 'Direcionamento Manual pelo Gestor',
      distributedAt: nowIso,
      updatedAt: nowIso,
      history: [
        ...leadForManualAssignment.history,
        {
          id: `h-${Date.now()}`,
          date: new Date().toLocaleString('pt-BR'),
          action: `Lead direcionado manualmente pelo gestor para ${targetBroker.name}`,
          user: 'Gestor Imobiliário'
        }
      ]
    };
    onUpdateLead(updatedLead);

    // Update broker counters
    const updatedBrokers = brokers.map(b => {
      if (b.id === targetBroker.id) {
        return {
          ...b,
          leadsReceivedToday: (b.leadsReceivedToday || 0) + 1,
          lastAssignedAt: nowIso,
        };
      }
      return b;
    });
    onUpdateBrokers(updatedBrokers);

    const log = createDistributionLog(
      updatedLead, 
      targetBroker, 
      'manual', 
      'Direcionamento Manual pelo Gestor'
    );
    onAddLog(log);

    showNotice(`👤 Lead "${updatedLead.clientName}" direcionado com sucesso para ${targetBroker.name}!`);
    setLeadForManualAssignment(null);
    setSelectedBrokerForManual('');
  };

  // Handler: Toggle broker duty status
  const handleToggleBrokerDuty = (brokerId: string) => {
    const updated: BrokerItem[] = brokers.map(b => {
      if (b.id === brokerId) {
        const nextDuty = !b.isDuty;
        return {
          ...b,
          isDuty: nextDuty,
          dutyStatus: nextDuty ? ('disponivel' as const) : ('offline' as const),
        };
      }
      return b;
    });
    onUpdateBrokers(updated);
    showNotice('Escala de plantão atualizada!');
  };

  // Handler: Set all brokers on duty
  const handleSetAllBrokersDuty = (status: boolean) => {
    const updated: BrokerItem[] = brokers.map(b => ({
      ...b,
      isDuty: status,
      dutyStatus: status ? ('disponivel' as const) : ('offline' as const),
    }));
    onUpdateBrokers(updated);
    showNotice(status ? 'Todos os corretores ativos foram colocados de plantão!' : 'Plantão de todos foi desativado.');
  };

  // Handler: Reset today's received lead counters
  const handleResetCounters = () => {
    const updated = brokers.map(b => ({
      ...b,
      leadsReceivedToday: 0,
    }));
    onUpdateBrokers(updated);
    showNotice('Contadores diários de leads recebidos foram zerados!');
  };

  // Handler: Update broker duty details
  const handleUpdateBrokerDutyField = (brokerId: string, fields: Partial<BrokerItem>) => {
    const updated = brokers.map(b => {
      if (b.id === brokerId) {
        return { ...b, ...fields };
      }
      return b;
    });
    onUpdateBrokers(updated);
  };

  // Handler: Open Rule Modal
  const handleOpenAddRule = () => {
    setRuleToEdit(null);
    setRuleFormData({
      name: '',
      active: true,
      priority: distributionRules.length + 1,
      strategy: 'round_robin',
      targetDevelopment: '',
      targetOrigin: '',
      minValue: 0,
      maxValue: 0,
      eligibleBrokerIds: [],
      description: '',
    });
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: DistributionRule) => {
    setRuleToEdit(rule);
    setRuleFormData({ ...rule });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormData.name?.trim()) return;

    if (ruleToEdit) {
      const updatedRules = distributionRules.map(r => {
        if (r.id === ruleToEdit.id) {
          return {
            ...r,
            ...ruleFormData,
            name: ruleFormData.name?.trim() || r.name,
          } as DistributionRule;
        }
        return r;
      });
      onUpdateRules(updatedRules);
      showNotice('Regra de distribuição atualizada!');
    } else {
      const newRule: DistributionRule = {
        id: `rule-${Date.now()}`,
        name: ruleFormData.name.trim(),
        active: ruleFormData.active ?? true,
        priority: ruleFormData.priority || distributionRules.length + 1,
        strategy: ruleFormData.strategy || 'round_robin',
        targetDevelopment: ruleFormData.targetDevelopment || '',
        targetOrigin: ruleFormData.targetOrigin || '',
        minValue: Number(ruleFormData.minValue) || 0,
        maxValue: Number(ruleFormData.maxValue) || 0,
        eligibleBrokerIds: ruleFormData.eligibleBrokerIds || [],
        description: ruleFormData.description || '',
      };
      onUpdateRules([...distributionRules, newRule]);
      showNotice('Nova regra de distribuição criada com sucesso!');
    }

    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    onUpdateRules(distributionRules.filter(r => r.id !== ruleId));
    showNotice('Regra removida!');
  };

  const handleToggleRuleActive = (ruleId: string) => {
    onUpdateRules(distributionRules.map(r => {
      if (r.id === ruleId) return { ...r, active: !r.active };
      return r;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-slate-700/50 dark:border-slate-300/50 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Banner / Hero Header */}
      <div className={`p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl ${cardBorderClass}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Shuffle className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Área de Distribuição de Leads</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                distributionSettings.autoDistributionEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {distributionSettings.autoDistributionEnabled ? '● Distribuição Automática Ativa' : '○ Modo Manual'}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              Escala de plantão dos corretores, roleta inteligente equitativa e mesa de triagem direcionada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onUpdateSettings({
                ...distributionSettings,
                autoDistributionEnabled: !distributionSettings.autoDistributionEnabled
              })}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                distributionSettings.autoDistributionEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md'
              }`}
            >
              {distributionSettings.autoDistributionEnabled ? 'Pausar Automação' : 'Ativar Automação'}
            </button>

            {pendingLeads.length > 0 && (
              <button
                onClick={handleDistributeAllPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${themeColors.primary}`}
              >
                <Shuffle className="w-4 h-4" />
                Distribuir Todos Pendentes ({pendingLeads.length})
              </button>
            )}

            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Lead
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Fila de Triagem</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${pendingLeads.length > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
                {pendingLeads.length}
              </span>
              <span className="text-xs text-slate-400">leads aguardando</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Plantonistas Ativos</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {dutyBrokers.length}
              </span>
              <span className="text-xs text-slate-400">de {totalBrokers} corretores</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Distribuídos Hoje</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-400">
                {distributedTodayCount}
              </span>
              <span className="text-xs text-slate-400">nas últimas 24h</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Regras de Roteamento</span>
              <Settings2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-400">
                {distributionRules.filter(r => r.active).length}
              </span>
              <span className="text-xs text-slate-400">regras ativas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-2">
        <button
          onClick={() => setActiveSubTab('triagem')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'triagem'
              ? `${themeColors.accent} border-current`
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Mesa de Triagem & Fila</span>
          {pendingLeads.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
              {pendingLeads.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('plantao')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'plantao'
              ? `${themeColors.accent} border-current`
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Plantão Imobiliário (Corretores)</span>
          <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {dutyBrokers.length} online
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('regras')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'regras'
              ? `${themeColors.accent} border-current`
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Regras de Roteamento</span>
          <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {distributionRules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('historico')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'historico'
              ? `${themeColors.accent} border-current`
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico & Auditoria</span>
          <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {distributionLogs.length}
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: MESA DE TRIAGEM & FILA DE ESPERA */}
      {activeSubTab === 'triagem' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className={`p-4 rounded-xl bg-white dark:bg-slate-900 ${cardBorderClass} flex flex-col md:flex-row gap-3 items-center justify-between`}>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar lead na fila por nome ou telefone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white ${themeColors.focusRing}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={filterDev}
                onChange={e => setFilterDev(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">Todos Empreendimentos</option>
                {developments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                value={filterOrigin}
                onChange={e => setFilterOrigin(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">Todas Origens</option>
                {origins.map(o => (
                  <option key={o.id} value={o.name}>{o.name}</option>
                ))}
              </select>

              {filteredPendingLeads.length > 0 && (
                <button
                  onClick={handleDistributeAllPending}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg ${themeColors.primary}`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Distribuir Todos ({filteredPendingLeads.length})
                </button>
              )}
            </div>
          </div>

          {/* Pending Leads Cards or Empty State */}
          {filteredPendingLeads.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl bg-white dark:bg-slate-900 ${cardBorderClass} space-y-4`}>
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mesa de Triagem Limpa!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Não há nenhum lead pendente de distribuição no momento. Todos os leads foram encaminhados com sucesso para corretores de plantão.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenNewLeadModal}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md ${themeColors.primary}`}
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Novo Lead para Testar Distribuição
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPendingLeads.map(lead => (
                <div
                  key={lead.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 ${cardBorderClass} hover:shadow-md transition-all flex flex-col justify-between space-y-4 border-l-4 border-l-amber-500`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                          Aguardando Distribuição
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 hover:underline cursor-pointer"
                          onClick={() => onSelectLeadDetails(lead)}>
                          {lead.clientName}
                        </h4>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">{lead.development}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.clientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span>Origem: <strong>{lead.origin}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>Interesse: <strong>R$ {Number(lead.propertyValue || 0).toLocaleString('pt-BR')}</strong></span>
                      </div>
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions for this lead */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleAutoDistributeLead(lead)}
                      title="Distribuir automaticamente aplicando a roleta e regras vigentes"
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg shadow-sm ${themeColors.primary}`}
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      Roleta Automática
                    </button>

                    <button
                      onClick={() => {
                        setLeadForManualAssignment(lead);
                        setSelectedBrokerForManual(dutyBrokers[0]?.id || brokers[0]?.id || '');
                      }}
                      title="Direcionar para um corretor de plantão específico"
                      className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all"
                    >
                      Direcionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PLANTÃO IMOBILIÁRIO (GESTÃO DOS PLANTONISTAS) */}
      {activeSubTab === 'plantao' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl bg-white dark:bg-slate-900 ${cardBorderClass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Escala de Corretores de Plantão
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apenas corretores marcados como "De Plantão" receberão novos leads na roleta e nas regras de automação.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSetAllBrokersDuty(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 transition-all"
              >
                Colocar Todos de Plantão
              </button>
              <button
                onClick={() => handleSetAllBrokersDuty(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all"
              >
                Desativar Plantão de Todos
              </button>
              <button
                onClick={handleResetCounters}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 transition-all"
              >
                Zerar Contadores de Hoje
              </button>
            </div>
          </div>

          {/* Brokers Duty Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brokers.map(broker => {
              const isOnDuty = Boolean(broker.isDuty);
              const leadsCount = broker.leadsReceivedToday || 0;
              const maxLeads = broker.maxLeadsPerDay || 8;
              const pctUsed = Math.min(100, Math.round((leadsCount / maxLeads) * 100));

              return (
                <div
                  key={broker.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 ${cardBorderClass} transition-all space-y-4 ${
                    isOnDuty 
                      ? 'ring-2 ring-emerald-500/30 dark:ring-emerald-500/20 shadow-md' 
                      : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isOnDuty 
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {broker.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {broker.name}
                          {isOnDuty && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online no plantão" />
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {broker.team} • CRECI {broker.creci}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleBrokerDuty(broker.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isOnDuty ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isOnDuty ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Status, Shift & Limits */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium uppercase">Turno de Plantão</span>
                      <select
                        value={broker.dutyShift || 'integral'}
                        onChange={e => handleUpdateBrokerDutyField(broker.id, { dutyShift: e.target.value as any })}
                        disabled={!isOnDuty}
                        className="mt-1 w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="integral">Integral (08h - 20h)</option>
                        <option value="manha">Manhã (08h - 13h)</option>
                        <option value="tarde">Tarde (13h - 18h)</option>
                        <option value="noite">Noite (18h - 22h)</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium uppercase">Status Operacional</span>
                      <select
                        value={broker.dutyStatus || 'disponivel'}
                        onChange={e => handleUpdateBrokerDutyField(broker.id, { dutyStatus: e.target.value as any })}
                        disabled={!isOnDuty}
                        className="mt-1 w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="disponivel">Disponível 🟢</option>
                        <option value="em_atendimento">Em Atendimento 🟡</option>
                        <option value="pausa">Pausa / Almoço ☕</option>
                        <option value="offline">Offline ⚪</option>
                      </select>
                    </div>
                  </div>

                  {/* Lead Capacity & Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Leads Recebidos Hoje:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateBrokerDutyField(broker.id, { 
                            leadsReceivedToday: Math.max(0, leadsCount - 1) 
                          })}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {leadsCount} <span className="font-normal text-slate-400">/ {maxLeads} máx</span>
                        </span>
                        <button
                          onClick={() => handleUpdateBrokerDutyField(broker.id, { 
                            leadsReceivedToday: leadsCount + 1 
                          })}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          pctUsed >= 100 
                            ? 'bg-rose-500' 
                            : pctUsed > 70 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pctUsed}%` }}
                      />
                    </div>
                  </div>

                  {/* WhatsApp Direct Action */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {broker.lastAssignedAt 
                        ? `Último lead: ${new Date(broker.lastAssignedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
                        : 'Nenhum lead hoje'}
                    </span>
                    <a
                      href={`https://wa.me/55${broker.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REGRAS DE ROTEAMENTO & CONFIGURAÇÃO */}
      {activeSubTab === 'regras' && (
        <div className="space-y-6">
          {/* General Distribution Settings Card */}
          <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 ${cardBorderClass} space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Configurações Gerais de Roteamento
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parâmetros de balanceamento e notificações para os plantonistas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Estratégia Padrão (Fallback)
                </span>
                <select
                  value={distributionSettings.defaultStrategy}
                  onChange={e => onUpdateSettings({
                    ...distributionSettings,
                    defaultStrategy: e.target.value as any
                  })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="round_robin">Roleta Equitativa (Alternada)</option>
                  <option value="least_loaded">Menor Carga de Leads Hoje</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Aplicada quando nenhuma regra específica filtrar o lead.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Prevenção de Sobrecarga
                  </span>
                  <input
                    type="checkbox"
                    checked={distributionSettings.preventOverload}
                    onChange={e => onUpdateSettings({
                      ...distributionSettings,
                      preventOverload: e.target.checked
                    })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Se ativo, a roleta pula corretores que já atingiram sua cota diária de leads.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Notificação via WhatsApp
                  </span>
                  <input
                    type="checkbox"
                    checked={distributionSettings.notifyBrokerOnWhatsapp}
                    onChange={e => onUpdateSettings({
                      ...distributionSettings,
                      notifyBrokerOnWhatsapp: e.target.checked
                    })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Gera botão e atalho de notificação instantânea para o corretor que recebeu o lead.
                </p>
              </div>
            </div>
          </div>

          {/* Rules List Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Regras Automatizadas de Distribuição
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avaliadas em ordem de prioridade (da menor prioridade numérica para a maior).
              </p>
            </div>

            <button
              onClick={handleOpenAddRule}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl shadow-md ${themeColors.primary}`}
            >
              <Plus className="w-4 h-4" />
              Adicionar Nova Regra
            </button>
          </div>

          {/* Rules Cards */}
          <div className="space-y-3">
            {[...distributionRules]
              .sort((a, b) => a.priority - b.priority)
              .map(rule => {
                const eligibleBrokers = brokers.filter(b => rule.eligibleBrokerIds?.includes(b.id));

                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl bg-white dark:bg-slate-900 ${cardBorderClass} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                      rule.active ? '' : 'opacity-60 bg-slate-50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
                        #{rule.priority}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {rule.name}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            rule.active 
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {rule.active ? 'Ativa' : 'Pausada'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-medium">
                            {rule.strategy === 'least_loaded' ? 'Menor Carga' : 'Roleta Equitativa'}
                          </span>
                        </div>

                        {rule.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {rule.description}
                          </p>
                        )}

                        {/* Criteria Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                          {rule.targetDevelopment ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Empreendimento: <strong>{rule.targetDevelopment}</strong>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              Todos empreendimentos
                            </span>
                          )}

                          {rule.targetOrigin && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Origem: <strong>{rule.targetOrigin}</strong>
                            </span>
                          )}

                          {typeof rule.minValue === 'number' && rule.minValue > 0 && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Valor &ge; R$ {rule.minValue.toLocaleString('pt-BR')}
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
                            Destinatários: {eligibleBrokers.length > 0 
                              ? eligibleBrokers.map(b => b.name).join(', ') 
                              : 'Todos os corretores de plantão'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleToggleRuleActive(rule.id)}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {rule.active ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => handleOpenEditRule(rule)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Editar Regra"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60"
                        title="Excluir Regra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: HISTÓRICO & AUDITORIA DE DISTRIBUIÇÃO */}
      {activeSubTab === 'historico' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl bg-white dark:bg-slate-900 ${cardBorderClass} flex items-center justify-between`}>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Auditoria de Distribuição de Leads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Histórico detalhado de cada lead encaminhado, modo de envio e regra aplicada.
              </p>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Total de {distributionLogs.length} distribuições registradas
            </span>
          </div>

          <div className={`overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 ${cardBorderClass}`}>
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Cliente / Lead</th>
                  <th className="px-4 py-3">Empreendimento</th>
                  <th className="px-4 py-3">Corretor Recebedor</th>
                  <th className="px-4 py-3">Modo & Regra</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {distributionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Nenhum histórico registrado ainda.
                    </td>
                  </tr>
                ) : (
                  [...distributionLogs].reverse().map(log => {
                    const matchedBroker = brokers.find(b => b.id === log.brokerId || b.name === log.brokerName);
                    const matchedLead = leads.find(l => l.id === log.leadId);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {log.timestamp}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {log.leadName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {log.clientPhone}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {log.development || 'Geral'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {log.origin || 'Plantão'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                              {log.brokerName.slice(0, 1)}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {log.brokerName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.mode === 'automatico'
                                ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                                : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                            }`}>
                              {log.mode === 'automatico' ? '⚡ Automático' : '👤 Manual'}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">
                              {log.ruleName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                          {matchedBroker && (
                            <a
                              href={buildBrokerNotificationUrl(matchedBroker, {
                                clientName: log.leadName,
                                clientPhone: log.clientPhone,
                                development: log.development,
                                origin: log.origin,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                              title="Notificar Corretor via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                          )}

                          {matchedLead && (
                            <button
                              onClick={() => onSelectLeadDetails(matchedLead)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            >
                              Ver Lead
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL DIRECTED ASSIGNMENT */}
      {leadForManualAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 ${cardBorderClass} space-y-5 animate-in fade-in-50 zoom-in-95`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  Direcionar Lead Manualmente
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Selecione o corretor que assumirá o atendimento deste cliente.
                </p>
              </div>
              <button
                onClick={() => setLeadForManualAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lead Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {leadForManualAssignment.clientName}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {leadForManualAssignment.clientPhone} • {leadForManualAssignment.development}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Origem: <strong>{leadForManualAssignment.origin}</strong> • Valor: R$ {Number(leadForManualAssignment.propertyValue || 0).toLocaleString('pt-BR')}
              </div>
            </div>

            {/* Broker Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Selecione o Corretor de Plantão:
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {brokers
                  .filter(b => b.active)
                  .sort((a, b) => (b.isDuty ? 1 : 0) - (a.isDuty ? 1 : 0))
                  .map(b => {
                    const isSelected = selectedBrokerForManual === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBrokerForManual(b.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            b.isDuty 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {b.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {b.name}
                              {b.isDuty ? (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                                  Plantão
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                                  Fora de escala
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {b.team} • {b.leadsReceivedToday || 0} leads hoje
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLeadForManualAssignment(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmManualAssignment}
                disabled={!selectedBrokerForManual}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md ${themeColors.primary} disabled:opacity-50`}
              >
                Confirmar Direcionamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DISTRIBUTION RULE */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 ${cardBorderClass} space-y-4 animate-in fade-in-50 zoom-in-95`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {ruleToEdit ? 'Editar Regra de Distribuição' : 'Nova Regra de Distribuição'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure critérios automáticos para rotear leads que atendam a estas condições.
                </p>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Regra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leads Alto Padrão ou Leads Instagram Ads"
                  value={ruleFormData.name || ''}
                  onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Prioridade da Regra
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={ruleFormData.priority || 1}
                    onChange={e => setRuleFormData({ ...ruleFormData, priority: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">1 é avaliado primeiro.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estratégia de Envio
                  </label>
                  <select
                    value={ruleFormData.strategy || 'round_robin'}
                    onChange={e => setRuleFormData({ ...ruleFormData, strategy: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="round_robin">Roleta Equitativa (Alternada)</option>
                    <option value="least_loaded">Menor Carga de Leads Hoje</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Empreendimento Específico
                  </label>
                  <select
                    value={ruleFormData.targetDevelopment || ''}
                    onChange={e => setRuleFormData({ ...ruleFormData, targetDevelopment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Qualquer Empreendimento</option>
                    {developments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Canal de Origem Específico
                  </label>
                  <select
                    value={ruleFormData.targetOrigin || ''}
                    onChange={e => setRuleFormData({ ...ruleFormData, targetOrigin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Qualquer Origem</option>
                    {origins.map(o => (
                      <option key={o.id} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Mínimo do Imóvel (R$)
                </label>
                <input
                  type="number"
                  placeholder="0 para não filtrar por valor"
                  value={ruleFormData.minValue || ''}
                  onChange={e => setRuleFormData({ ...ruleFormData, minValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Corretores Elegíveis (Deixe em branco para todos de plantão):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  {brokers.filter(b => b.active).map(b => {
                    const isChecked = ruleFormData.eligibleBrokerIds?.includes(b.id);
                    return (
                      <label key={b.id} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            const current = ruleFormData.eligibleBrokerIds || [];
                            if (e.target.checked) {
                              setRuleFormData({ ...ruleFormData, eligibleBrokerIds: [...current, b.id] });
                            } else {
                              setRuleFormData({ ...ruleFormData, eligibleBrokerIds: current.filter(id => id !== b.id) });
                            }
                          }}
                          className="w-3.5 h-3.5 rounded text-rose-600"
                        />
                        <span className="truncate">{b.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição da Regra
                </label>
                <textarea
                  rows={2}
                  placeholder="Explicação do propósito desta regra..."
                  value={ruleFormData.description || ''}
                  onChange={e => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md ${themeColors.primary}`}
                >
                  Salvar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
