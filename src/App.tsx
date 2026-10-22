import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadsTable } from './components/LeadsTable';
import { BrokersPropertiesView } from './components/BrokersPropertiesView';
import { ReportsView } from './components/ReportsView';
import { AiAdvisor } from './components/AiAdvisor';
import { LeadModal } from './components/LeadModal';
import { INITIAL_LEADS } from './mockData';
import { Lead, PipelineStage, BROKERS } from './types';
import { X, Phone, Mail, Building, DollarSign } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('immoflow_leads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LEADS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<Lead | null>(null);

  useEffect(() => {
    localStorage.setItem('immoflow_leads', JSON.stringify(leads));
  }, [leads]);

  const handleSaveLead = (leadData: Partial<Lead>) => {
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
          return updated;
        }
        return l;
      }));
    } else {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        clientName: leadData.clientName || '',
        clientPhone: leadData.clientPhone || '',
        clientEmail: leadData.clientEmail || '',
        brokerName: leadData.brokerName || BROKERS[0],
        development: leadData.development || 'Residencial Vista Verde',
        origin: leadData.origin || 'Instagram Ads',
        status: leadData.status || 'lead',
        propertyUnit: leadData.propertyUnit || '',
        propertyValue: leadData.propertyValue || 400000,
        commissionRate: leadData.commissionRate || 5,
        visitDate: leadData.visitDate || '',
        notes: leadData.notes || '',
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
            action: `Lead criado (Origem: ${leadData.origin})`,
            user: leadData.brokerName || BROKERS[0]
          }
        ]
      };
      setLeads(prev => [newLead, ...prev]);
    }
    setLeadToEdit(null);
  };

  const handleUpdateStatus = (leadId: string, newStatus: PipelineStage) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
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
      }
      return l;
    }));
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead e todo o histórico?')) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `immoflow_leads_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLeadModal={() => { setLeadToEdit(null); setIsModalOpen(true); }}
        onExportData={handleExportData}
        onImportData={() => {}}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            leads={leads}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard
            leads={leads}
            onUpdateStatus={handleUpdateStatus}
            onEditLead={(lead) => { setLeadToEdit(lead); setIsModalOpen(true); }}
            onDeleteLead={handleDeleteLead}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsTable
            leads={leads}
            onOpenNewLeadModal={() => { setLeadToEdit(null); setIsModalOpen(true); }}
            onEditLead={(lead) => { setLeadToEdit(lead); setIsModalOpen(true); }}
            onDeleteLead={handleDeleteLead}
            onSelectLead={(lead) => setSelectedLeadDetails(lead)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'settings' && (
          <BrokersPropertiesView />
        )}

        {activeTab === 'reports' && (
          <ReportsView leads={leads} />
        )}

        {activeTab === 'ai' && (
          <AiAdvisor leads={leads} />
        )}
      </main>

      {/* New / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setLeadToEdit(null); }}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
      />

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
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="text-base font-bold text-blue-900 dark:text-blue-200">{selectedLeadDetails.clientName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-blue-800 dark:text-blue-300">
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedLeadDetails.clientPhone}</div>
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selectedLeadDetails.clientEmail || 'Não informado'}</div>
                  <div className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {selectedLeadDetails.development} ({selectedLeadDetails.propertyUnit})</div>
                  <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> R$ {selectedLeadDetails.propertyValue?.toLocaleString('pt-BR')}</div>
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
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
