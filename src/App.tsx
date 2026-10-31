import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadsTable } from './components/LeadsTable';
import { BrokersPropertiesView } from './components/BrokersPropertiesView';
import { ReportsView } from './components/ReportsView';
import { AiAdvisor } from './components/AiAdvisor';
import { TaskManager } from './components/TaskManager';
import { LeadModal } from './components/LeadModal';
import { LeadDistributionView } from './components/LeadDistributionView';
import { INITIAL_LEADS } from './mockData';
import { useDebouncedLocalStorage } from './hooks/useDebouncedLocalStorage';
import { storageService } from './services/storageService';
import { firestoreService, seedInitialDataIfNeeded } from './services/firestoreService';
import { 
  Lead, 
  PipelineStage, 
  BrokerItem, 
  DevelopmentItem, 
  OriginItem, 
  TeamItem, 
  TaskItem,
  ThemeMode, 
  BorderMode,
  DistributionRule,
  DistributionSettings,
  DistributionLog,
  INITIAL_BROKER_ITEMS,
  INITIAL_DEVELOPMENT_ITEMS,
  INITIAL_ORIGIN_ITEMS,
  INITIAL_TEAM_ITEMS,
  INITIAL_TASKS,
  INITIAL_DISTRIBUTION_RULES,
  INITIAL_DISTRIBUTION_SETTINGS,
  INITIAL_DISTRIBUTION_LOGS
} from './types';
import { distributeLead, createDistributionLog } from './services/distributionEngine';
import { X, Phone, Mail, Building, DollarSign, AlertTriangle } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ChangePasswordModal } from './components/ChangePasswordModal';

export default function App() {
  const { currentUser, isAdmin, loading: authLoading, logout } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  const [leads, setLeads] = useState<Lead[]>(() => storageService.getLeads());
  const [brokers, setBrokers] = useState<BrokerItem[]>(() => storageService.getBrokers());
  const [developments, setDevelopments] = useState<DevelopmentItem[]>(() => storageService.getDevelopments());
  const [origins, setOrigins] = useState<OriginItem[]>(() => storageService.getOrigins());
  const [teams, setTeams] = useState<TeamItem[]>(() => storageService.getTeams());
  const [tasks, setTasks] = useState<TaskItem[]>(() => storageService.getTasks());
  const [theme, setTheme] = useState<ThemeMode>(() => storageService.getTheme());
  const [borderMode, setBorderMode] = useState<BorderMode>(() => storageService.getBorderMode());
  const [distributionRules, setDistributionRules] = useState<DistributionRule[]>(() => storageService.getDistributionRules());
  const [distributionSettings, setDistributionSettings] = useState<DistributionSettings>(() => storageService.getDistributionSettings());
  const [distributionLogs, setDistributionLogs] = useState<DistributionLog[]>(() => storageService.getDistributionLogs());

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<Lead | null>(null);
  const [leadToDeleteId, setLeadToDeleteId] = useState<string | null>(null);

  // Debounced automatic persistence to localStorage for high performance and data safety
  useDebouncedLocalStorage('immoflow_leads', leads, 300);
  useDebouncedLocalStorage('immoflow_brokers', brokers, 300);
  useDebouncedLocalStorage('immoflow_developments', developments, 300);
  useDebouncedLocalStorage('immoflow_origins', origins, 300);
  useDebouncedLocalStorage('immoflow_teams', teams, 300);
  useDebouncedLocalStorage('immoflow_tasks', tasks, 300);
  useDebouncedLocalStorage('immoflow_theme', theme, 100);
  useDebouncedLocalStorage('immoflow_border_mode', borderMode, 100);
  useDebouncedLocalStorage('immoflow_distribution_rules', distributionRules, 300);
  useDebouncedLocalStorage('immoflow_distribution_settings', distributionSettings, 300);
  useDebouncedLocalStorage('immoflow_distribution_logs', distributionLogs, 300);

  // Emergency synchronous flush before unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem('immoflow_leads', JSON.stringify(leads));
        localStorage.setItem('immoflow_brokers', JSON.stringify(brokers));
        localStorage.setItem('immoflow_developments', JSON.stringify(developments));
        localStorage.setItem('immoflow_origins', JSON.stringify(origins));
        localStorage.setItem('immoflow_teams', JSON.stringify(teams));
        localStorage.setItem('immoflow_tasks', JSON.stringify(tasks));
        localStorage.setItem('immoflow_theme', theme);
        localStorage.setItem('immoflow_border_mode', borderMode);
        localStorage.setItem('immoflow_distribution_rules', JSON.stringify(distributionRules));
        localStorage.setItem('immoflow_distribution_settings', JSON.stringify(distributionSettings));
        localStorage.setItem('immoflow_distribution_logs', JSON.stringify(distributionLogs));
      } catch (err) {
        console.error('Erro no salvamento emergency beforeunload:', err);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [leads, brokers, developments, origins, teams, tasks, theme, borderMode, distributionRules, distributionSettings, distributionLogs]);

  // Real-time Firestore sync & seeding on mount
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    let isMounted = true;

    seedInitialDataIfNeeded()
      .catch((err) => console.warn('Could not seed initial data:', err))
      .finally(() => {
        if (!isMounted) return;

        const unsubLeads = firestoreService.subscribeLeads((data) => {
          if (data && data.length > 0) setLeads(data);
        });
        const unsubBrokers = firestoreService.subscribeBrokers((data) => {
          if (data && data.length > 0) setBrokers(data);
        });
        const unsubDevs = firestoreService.subscribeDevelopments((data) => {
          if (data && data.length > 0) setDevelopments(data);
        });
        const unsubOrigins = firestoreService.subscribeOrigins((data) => {
          if (data && data.length > 0) setOrigins(data);
        });
        const unsubTeams = firestoreService.subscribeTeams((data) => {
          if (data && data.length > 0) setTeams(data);
        });
        const unsubTasks = firestoreService.subscribeTasks((data) => {
          if (data) setTasks(data);
        });
        const unsubRules = firestoreService.subscribeDistributionRules((data) => {
          if (data && data.length > 0) setDistributionRules(data);
        });
        const unsubSettings = firestoreService.subscribeDistributionSettings((data) => {
          if (data) setDistributionSettings(data);
        });
        const unsubLogs = firestoreService.subscribeDistributionLogs((data) => {
          if (data) setDistributionLogs(data);
        });

        unsubs = [
          unsubLeads, 
          unsubBrokers, 
          unsubDevs, 
          unsubOrigins, 
          unsubTeams, 
          unsubTasks,
          unsubRules,
          unsubSettings,
          unsubLogs
        ];
      });

    return () => {
      isMounted = false;
      unsubs.forEach(unsub => {
        try { unsub(); } catch { /* ignore */ }
      });
    };
  }, []);

  // Corretor identity
  const userBrokerName = currentUser?.brokerName || currentUser?.displayName || '';

  // Tab guard: non-admin cannot view settings/cadastros or distribution tab
  useEffect(() => {
    if (!isAdmin && (activeTab === 'settings' || activeTab === 'distribution')) {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  // If user has default initial password, prompt modal to customize password
  useEffect(() => {
    if (currentUser?.mustChangePassword) {
      setIsChangePasswordModalOpen(true);
    }
  }, [currentUser?.mustChangePassword]);

  // Pending leads for distribution counter
  const pendingDistributionCount = leads.filter(l => 
    l.distributionStatus === 'pendente_distribuicao' || 
    !l.brokerName || 
    l.brokerName.toLowerCase().includes('triagem') ||
    l.brokerName.toLowerCase().includes('pendente') ||
    l.brokerName.toLowerCase().includes('não atribuído')
  ).length;

  // Role-based filtering of leads and tasks:
  // - Admin: full access to all leads across all brokers
  // - Broker: strictly restricted only to leads assigned to them
  const visibleLeads = isAdmin
    ? leads
    : leads.filter(l => {
        if (!l) return false;
        const bName = l.brokerName ? l.brokerName.toLowerCase().trim() : '';
        const currentBName = userBrokerName ? userBrokerName.toLowerCase().trim() : '';
        const brokerMatches = bName && currentBName && (bName === currentBName || bName.includes(currentBName) || currentBName.includes(bName));
        const emailMatches = l.clientEmail && currentUser?.email && l.clientEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
        return Boolean(brokerMatches || emailMatches);
      });

  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter(t => {
        if (!t) return false;
        const assigned = t.assignedTo ? t.assignedTo.toLowerCase().trim() : '';
        const currentBName = userBrokerName ? userBrokerName.toLowerCase().trim() : '';
        return Boolean(assigned && currentBName && (assigned === currentBName || assigned.includes(currentBName)));
      });

  // Derived simple lists for select inputs and filters
  const brokerNames = brokers.filter(b => b.active).map(b => b.name);
  const availableBrokersForForms = isAdmin 
    ? brokerNames 
    : [userBrokerName || brokerNames[0] || 'Corretor'];
  const devNames = developments.map(d => d.name);
  const originNames = origins.filter(o => o.active).map(o => o.name);

  const handleSaveLead = (leadData: Partial<Lead>) => {
    const defaultDev = devNames[0] || 'Empreendimento Principal';
    const defaultOrigin = originNames[0] || 'Plantão';

    if (leadToEdit) {
      setLeads(prev => prev.map(l => {
        if (l.id === leadToEdit.id) {
          const updated: Lead = {
            ...l,
            ...leadData,
            brokerName: isAdmin ? (leadData.brokerName || l.brokerName) : userBrokerName,
            updatedAt: new Date().toISOString(),
            history: [
              ...l.history,
              {
                id: `h-${Date.now()}`,
                date: new Date().toLocaleString('pt-BR'),
                action: `Lead atualizado (Status: ${leadData.status || l.status})`,
                user: isAdmin ? (leadData.brokerName || l.brokerName) : userBrokerName
              }
            ]
          };
          firestoreService.saveLead(updated);
          return updated;
        }
        return l;
      }));
      showToast('☁️ Lead atualizado no Firestore!');
    } else {
      // Determine distribution routing
      let targetBrokerName = userBrokerName;
      let distStatus: 'distribuido' | 'pendente_distribuicao' = 'distribuido';
      let distMode: 'automatico' | 'manual' | 'direto' = 'direto';
      let distRuleName = '';
      const isAutoRequested = leadData.brokerName?.includes('Roleta') || 
        (!leadData.brokerName && distributionSettings.autoDistributionEnabled);
      const isTriageRequested = leadData.brokerName?.includes('Triagem') || 
        leadData.brokerName?.includes('Pendente');

      if (isAdmin && isAutoRequested) {
        const res = distributeLead(leadData, brokers, distributionRules, distributionSettings);
        if (res.success && res.assignedBroker) {
          targetBrokerName = res.assignedBroker.name;
          distStatus = 'distribuido';
          distMode = 'automatico';
          distRuleName = res.ruleName;

          const nowIso = new Date().toISOString();
          const updatedBrokers = brokers.map(b => {
            if (b.id === res.assignedBroker!.id) {
              const up = { ...b, leadsReceivedToday: (b.leadsReceivedToday || 0) + 1, lastAssignedAt: nowIso };
              firestoreService.saveBroker(up);
              return up;
            }
            return b;
          });
          setBrokers(updatedBrokers);

          const dummyLeadForLog = {
            id: `lead-${Date.now()}`,
            clientName: leadData.clientName || 'Lead',
            clientPhone: leadData.clientPhone || '',
            development: leadData.development || defaultDev,
            origin: leadData.origin || defaultOrigin
          } as Lead;
          const log = createDistributionLog(dummyLeadForLog, res.assignedBroker, 'automatico', res.ruleName, res.ruleApplied?.id);
          firestoreService.saveDistributionLog(log);
          setDistributionLogs(prev => [log, ...prev]);
          showToast(`⚡ Lead distribuído automaticamente para ${targetBrokerName}!`);
        } else {
          targetBrokerName = 'Mesa de Triagem';
          distStatus = 'pendente_distribuicao';
          distMode = 'manual';
          showToast('📥 Lead adicionado à Mesa de Triagem (sem plantonista disponível)');
        }
      } else if (isAdmin && isTriageRequested) {
        targetBrokerName = 'Mesa de Triagem';
        distStatus = 'pendente_distribuicao';
        distMode = 'manual';
        showToast('📥 Lead salvo na Mesa de Triagem!');
      } else if (isAdmin) {
        targetBrokerName = leadData.brokerName || brokerNames[0] || 'Corretor Geral';
        distStatus = 'distribuido';
        distMode = 'direto';
      }
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        clientName: leadData.clientName || '',
        clientPhone: leadData.clientPhone || '',
        clientEmail: leadData.clientEmail || '',
        brokerName: targetBrokerName,
        development: leadData.development || defaultDev,
        origin: leadData.origin || defaultOrigin,
        status: leadData.status || 'lead',
        propertyUnit: leadData.propertyUnit || '',
        propertyValue: leadData.propertyValue || 450000,
        commissionRate: leadData.commissionRate || 5,
        visitDate: leadData.visitDate || '',
        notes: leadData.notes || '',
        pastaStatus: leadData.pastaStatus || 'incompleta',
        creditStatus: leadData.creditStatus || 'em_atendimento',
        rejectionReason: leadData.rejectionReason,
        rejectionDetails: leadData.rejectionDetails,
        nextAction: leadData.nextAction,
        distributionStatus: distStatus,
        distributionMode: distMode,
        distributionRuleName: distRuleName,
        distributedAt: new Date().toISOString(),
        attendanceRecords: leadData.attendanceRecords || [
          {
            id: `att-${Date.now()}`,
            date: new Date().toLocaleString('pt-BR'),
            contactType: 'whatsapp',
            summary: distStatus === 'pendente_distribuicao' ? 'Lead colocado na Mesa de Triagem.' : 'Lead cadastrado no sistema.',
            nextAction: leadData.nextAction || 'Fazer primeiro contato',
            userName: targetBrokerName
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: leadData.documents || [
          { id: 'doc-1', name: 'RG / CPF', status: 'pendente' },
          { id: 'doc-2', name: 'Comprovante de Renda', status: 'pendente' },
          { id: 'doc-3', name: 'Imposto de Renda', status: 'pendente' },
        ],
        history: [
          {
            id: `h-${Date.now()}`,
            date: new Date().toLocaleString('pt-BR'),
            action: distStatus === 'pendente_distribuicao'
              ? `Lead registrado na Mesa de Triagem (Origem: ${leadData.origin || defaultOrigin})`
              : `Lead criado e atribuído para ${targetBrokerName} (Origem: ${leadData.origin || defaultOrigin})`,
            user: targetBrokerName
          }
        ]
      };
      firestoreService.saveLead(newLead);
      setLeads(prev => [newLead, ...prev]);
      showToast('☁️ Novo lead salvo no Firestore!');
    }
    setLeadToEdit(null);
  };

  const handleUpdateStatus = (leadId: string, newStatus: PipelineStage) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const upLead: Lead = {
          ...l,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          history: [
            ...l.history,
            {
              id: `h-${Date.now()}`,
              date: new Date().toLocaleString('pt-BR'),
              action: `Status alterado para: ${newStatus}`,
              user: l.brokerName
            }
          ]
        };
        firestoreService.saveLead(upLead);
        return upLead;
      }
      return l;
    }));
    showToast('☁️ Status sincronizado em nuvem!');
  };

  const confirmDeleteLead = () => {
    if (leadToDeleteId) {
      firestoreService.deleteLead(leadToDeleteId);
      setLeads(prev => prev.filter(l => l.id !== leadToDeleteId));
      setLeadToDeleteId(null);
      showToast('🗑️ Lead removido do Firestore.');
    }
  };

  const handleExportData = () => {
    const jsonStr = storageService.exportBackupJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `immoflow_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 Backup exportado com sucesso!');
  };

  const handleImportData = (jsonString: string) => {
    const success = storageService.importBackupJson(jsonString);
    if (success) {
      setLeads(storageService.getLeads());
      setBrokers(storageService.getBrokers());
      setDevelopments(storageService.getDevelopments());
      setOrigins(storageService.getOrigins());
      setTeams(storageService.getTeams());
      setTasks(storageService.getTasks());
      setTheme(storageService.getTheme());
      setBorderMode(storageService.getBorderMode());
      showToast('📥 Backup importado com sucesso!');
    } else {
      showToast('❌ Erro ao importar backup. Verifique o arquivo JSON.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-3 border-rose-600/30 border-t-rose-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-medium">Carregando ImmoFlow CRM...</p>
        <p className="text-xs text-slate-500 mt-1">Conectando aos serviços em nuvem</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage theme={theme} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar with Theme, Profile & Highlight Border Controls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLeadModal={() => { setLeadToEdit(null); setIsModalOpen(true); }}
        onExportData={handleExportData}
        onImportData={handleImportData}
        theme={theme}
        setTheme={setTheme}
        borderMode={borderMode}
        setBorderMode={setBorderMode}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenChangePasswordModal={() => setIsChangePasswordModalOpen(true)}
        onLogout={logout}
        pendingDistributionCount={pendingDistributionCount}
      />

      {/* Main Content Body (Filtered by user role) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            leads={visibleLeads}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            brokers={brokers}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard
            leads={visibleLeads}
            onUpdateStatus={handleUpdateStatus}
            onEditLead={(lead) => { setLeadToEdit(lead); setIsModalOpen(true); }}
            onDeleteLead={(id) => setLeadToDeleteId(id)}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsTable
            leads={visibleLeads}
            onOpenNewLeadModal={() => { setLeadToEdit(null); setIsModalOpen(true); }}
            onEditLead={(lead) => { setLeadToEdit(lead); setIsModalOpen(true); }}
            onDeleteLead={(id) => setLeadToDeleteId(id)}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
            onUpdateStatus={handleUpdateStatus}
            availableBrokers={availableBrokersForForms}
            availableDevelopments={devNames}
            availableOrigins={originNames}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'settings' && isAdmin && (
          <BrokersPropertiesView 
            brokers={brokers}
            setBrokers={(action) => {
              const next = typeof action === 'function' ? action(brokers) : action;
              setBrokers(next);
              next.forEach(b => firestoreService.saveBroker(b));
              showToast('☁️ Corretores atualizados no Firestore!');
            }}
            developments={developments}
            setDevelopments={(action) => {
              const next = typeof action === 'function' ? action(developments) : action;
              setDevelopments(next);
              next.forEach(d => firestoreService.saveDevelopment(d));
              showToast('☁️ Empreendimentos atualizados no Firestore!');
            }}
            origins={origins}
            setOrigins={(action) => {
              const next = typeof action === 'function' ? action(origins) : action;
              setOrigins(next);
              next.forEach(o => firestoreService.saveOrigin(o));
              showToast('☁️ Canais de origem atualizados!');
            }}
            teams={teams}
            setTeams={(action) => {
              const next = typeof action === 'function' ? action(teams) : action;
              setTeams(next);
              next.forEach(t => firestoreService.saveTeam(t));
              showToast('☁️ Equipes atualizadas em nuvem!');
            }}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager 
            tasks={visibleTasks}
            setTasks={(action) => {
              const next = typeof action === 'function' ? action(tasks) : action;
              setTasks(next);
              next.forEach(t => firestoreService.saveTask(t));
              showToast('☁️ Tarefas sincronizadas com o Firestore!');
            }}
            availableBrokers={availableBrokersForForms}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView 
            leads={visibleLeads}
            availableBrokers={availableBrokersForForms}
            availableDevelopments={devNames}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'distribution' && isAdmin && (
          <LeadDistributionView
            leads={leads}
            onUpdateLead={(upLead) => {
              setLeads(prev => prev.map(l => l.id === upLead.id ? upLead : l));
              firestoreService.saveLead(upLead);
            }}
            brokers={brokers}
            onUpdateBrokers={(upBrokers) => {
              setBrokers(upBrokers);
              upBrokers.forEach(b => firestoreService.saveBroker(b));
            }}
            developments={developments}
            origins={origins}
            distributionRules={distributionRules}
            onUpdateRules={(upRules) => {
              setDistributionRules(upRules);
              upRules.forEach(r => firestoreService.saveDistributionRule(r));
            }}
            distributionSettings={distributionSettings}
            onUpdateSettings={(upSettings) => {
              setDistributionSettings(upSettings);
              firestoreService.saveDistributionSettings(upSettings);
            }}
            distributionLogs={distributionLogs}
            onAddLog={(log) => {
              setDistributionLogs(prev => [log, ...prev]);
              firestoreService.saveDistributionLog(log);
            }}
            onOpenNewLeadModal={() => { setLeadToEdit(null); setIsModalOpen(true); }}
            onSelectLeadDetails={(lead) => setSelectedLeadDetails(lead)}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'ai' && (
          <AiAdvisor 
            leads={visibleLeads}
            theme={theme}
            borderMode={borderMode}
          />
        )}
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        theme={theme}
      />

      {/* New / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setLeadToEdit(null); }}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
        availableBrokers={availableBrokersForForms}
        availableDevelopments={devNames}
        availableOrigins={originNames}
        theme={theme}
        borderMode={borderMode}
        isAdmin={isAdmin}
      />

      {/* Delete Lead In-App Confirmation Modal (no window.confirm) */}
      {leadToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-400 dark:border-rose-900/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Excluir Atendimento
                </h3>
                <p className="text-xs text-slate-500">
                  Tem certeza que deseja remover este lead e todo seu histórico de atendimento?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteLead}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLeadDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Detalhes do Atendimento
                </h3>
                <p className="text-xs text-slate-500">Histórico completo e documentação</p>
              </div>
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl p-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedLeadDetails.clientName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" /> {selectedLeadDetails.clientPhone}</div>
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" /> {selectedLeadDetails.clientEmail || 'Não informado'}</div>
                  <div className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" /> {selectedLeadDetails.development} ({selectedLeadDetails.propertyUnit || 'Unid. pendente'})</div>
                  <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" /> R$ {selectedLeadDetails.propertyValue?.toLocaleString('pt-BR')}</div>
                </div>
              </div>

              {/* Documents Checklist */}
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Checklist de Documentos (Pastas)
                </h5>
                <div className="space-y-2">
                  {selectedLeadDetails.documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{doc.name}</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        doc.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        doc.status === 'enviado' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Histórico de Ações
                </h5>
                <div className="space-y-2">
                  {selectedLeadDetails.history?.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>{h.date}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{h.user}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{h.action}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
