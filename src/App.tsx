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
  INITIAL_BROKER_ITEMS,
  INITIAL_DEVELOPMENT_ITEMS,
  INITIAL_ORIGIN_ITEMS,
  INITIAL_TEAM_ITEMS,
  INITIAL_TASKS
} from './types';
import { X, Phone, Mail, Building, DollarSign, AlertTriangle } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => storageService.getLeads());
  const [brokers, setBrokers] = useState<BrokerItem[]>(() => storageService.getBrokers());
  const [developments, setDevelopments] = useState<DevelopmentItem[]>(() => storageService.getDevelopments());
  const [origins, setOrigins] = useState<OriginItem[]>(() => storageService.getOrigins());
  const [teams, setTeams] = useState<TeamItem[]>(() => storageService.getTeams());
  const [tasks, setTasks] = useState<TaskItem[]>(() => storageService.getTasks());
  const [theme, setTheme] = useState<ThemeMode>(() => storageService.getTheme());
  const [borderMode, setBorderMode] = useState<BorderMode>(() => storageService.getBorderMode());

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
      } catch (err) {
        console.error('Erro no salvamento emergency beforeunload:', err);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [leads, brokers, developments, origins, teams, tasks, theme, borderMode]);

  // Real-time Firestore sync & seeding on mount
  useEffect(() => {
    seedInitialDataIfNeeded().then(() => {
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

      return () => {
        unsubLeads();
        unsubBrokers();
        unsubDevs();
        unsubOrigins();
        unsubTeams();
        unsubTasks();
      };
    });
  }, []);

  // Derived simple lists for select inputs and filters
  const brokerNames = brokers.filter(b => b.active).map(b => b.name);
  const devNames = developments.map(d => d.name);
  const originNames = origins.filter(o => o.active).map(o => o.name);

  const handleSaveLead = (leadData: Partial<Lead>) => {
    const defaultBroker = brokerNames[0] || 'Corretor Geral';
    const defaultDev = devNames[0] || 'Empreendimento Principal';
    const defaultOrigin = originNames[0] || 'Plantão';

    if (leadToEdit) {
      setLeads(prev => prev.map(l => {
        if (l.id === leadToEdit.id) {
          const updated: Lead = {
            ...l,
            ...leadData,
            updatedAt: new Date().toISOString(),
            history: [
              ...l.history,
              {
                id: `h-${Date.now()}`,
                date: new Date().toLocaleString('pt-BR'),
                action: `Lead atualizado (Status: ${leadData.status || l.status})`,
                user: leadData.brokerName || l.brokerName
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
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        clientName: leadData.clientName || '',
        clientPhone: leadData.clientPhone || '',
        clientEmail: leadData.clientEmail || '',
        brokerName: leadData.brokerName || defaultBroker,
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
        attendanceRecords: leadData.attendanceRecords || [
          {
            id: `att-${Date.now()}`,
            date: new Date().toLocaleString('pt-BR'),
            contactType: 'whatsapp',
            summary: 'Lead cadastrado no sistema.',
            nextAction: leadData.nextAction || 'Fazer primeiro contato',
            userName: leadData.brokerName || defaultBroker
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
            action: `Lead criado (Origem: ${leadData.origin || defaultOrigin})`,
            user: leadData.brokerName || defaultBroker
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar with Theme & Highlight Border Controls */}
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
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            leads={leads}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            brokers={brokers}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard
            leads={leads}
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
            leads={leads}
            onOpenNewLeadModal={() => { setLeadToEdit(null); setIsModalOpen(true); }}
            onEditLead={(lead) => { setLeadToEdit(lead); setIsModalOpen(true); }}
            onDeleteLead={(id) => setLeadToDeleteId(id)}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
            onUpdateStatus={handleUpdateStatus}
            availableBrokers={brokerNames}
            availableDevelopments={devNames}
            availableOrigins={originNames}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'settings' && (
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
            tasks={tasks}
            setTasks={(action) => {
              const next = typeof action === 'function' ? action(tasks) : action;
              setTasks(next);
              next.forEach(t => firestoreService.saveTask(t));
              showToast('☁️ Tarefas sincronizadas com o Firestore!');
            }}
            availableBrokers={brokerNames}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView 
            leads={leads}
            availableBrokers={brokerNames}
            availableDevelopments={devNames}
            theme={theme}
            borderMode={borderMode}
          />
        )}

        {activeTab === 'ai' && (
          <AiAdvisor 
            leads={leads}
            theme={theme}
            borderMode={borderMode}
          />
        )}
      </main>

      {/* New / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setLeadToEdit(null); }}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
        availableBrokers={brokerNames}
        availableDevelopments={devNames}
        availableOrigins={originNames}
        theme={theme}
        borderMode={borderMode}
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
