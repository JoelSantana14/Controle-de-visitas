import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  Edit3, 
  Trash2
} from 'lucide-react';
import { Lead, PipelineStage, STAGE_CONFIG, ORIGINS as DEFAULT_ORIGINS, DEVELOPMENTS as DEFAULT_DEVELOPMENTS, BROKERS as DEFAULT_BROKERS, ThemeMode, BorderMode } from '../types';

interface LeadsTableProps {
  leads: Lead[];
  onOpenNewLeadModal: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: PipelineStage) => void;
  availableBrokers?: string[];
  availableDevelopments?: string[];
  availableOrigins?: string[];
  theme?: ThemeMode;
  borderMode?: BorderMode;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onOpenNewLeadModal,
  onEditLead,
  onDeleteLead,
  onSelectLead,
  onUpdateStatus,
  availableBrokers = DEFAULT_BROKERS,
  availableDevelopments = DEFAULT_DEVELOPMENTS,
  availableOrigins = DEFAULT_ORIGINS,
  theme = 'bordo',
  borderMode = 'destacada'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBroker, setFilterBroker] = useState<string>('all');
  const [filterDevelopment, setFilterDevelopment] = useState<string>('all');
  const [filterOrigin, setFilterOrigin] = useState<string>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.propertyUnit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesBroker = filterBroker === 'all' || lead.brokerName === filterBroker;
    const matchesDev = filterDevelopment === 'all' || lead.development === filterDevelopment;
    const matchesOrigin = filterOrigin === 'all' || lead.origin === filterOrigin;

    return matchesSearch && matchesStatus && matchesBroker && matchesDev && matchesOrigin;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const openWhatsApp = (phone: string, clientName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${clientName}, tudo bem? Entrando em contato referente ao seu atendimento no plantão...`);
    const link = document.createElement('a');
    link.href = `https://wa.me/55${cleanPhone}?text=${message}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const borderClass = borderMode === 'destacada'
    ? theme === 'bordo' ? 'border-2 border-rose-800/50 shadow-md' : 'border-2 border-blue-600/50 shadow-md'
    : 'border border-slate-200 dark:border-slate-800 shadow-xs';

  const primaryBtnClass = theme === 'bordo'
    ? 'bg-rose-900 hover:bg-rose-800 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl p-6 space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tabela Completa de Leads & Clientes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filtre por corretor, empreendimento, origem ou status de crédito e plantão.
            </p>
          </div>

          <button
            onClick={onOpenNewLeadModal}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer self-start ${primaryBtnClass}`}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Atendimento</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, tel, unidade..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
            >
              <option value="all">Todos os Status</option>
              {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterBroker}
              onChange={(e) => setFilterBroker(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
            >
              <option value="all">Todos os Corretores ({availableBrokers.length})</option>
              {availableBrokers.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterDevelopment}
              onChange={(e) => setFilterDevelopment(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
            >
              <option value="all">Todos Empreendimentos ({availableDevelopments.length})</option>
              {availableDevelopments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 text-slate-900 dark:text-white"
            >
              <option value="all">Todas as Origens ({availableOrigins.length})</option>
              {availableOrigins.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Leads Table Card */}
      <div className={`bg-white dark:bg-slate-900 ${borderClass} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Empreendimento</th>
                <th className="py-3 px-4">Origem</th>
                <th className="py-3 px-4">Corretor</th>
                <th className="py-3 px-4">Status / Estágio</th>
                <th className="py-3 px-4 text-right">Valor (VGV)</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const stage = STAGE_CONFIG[lead.status];
                  return (
                    <tr 
                      key={lead.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => onSelectLead(lead)}
                          className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-rose-700 dark:hover:text-rose-400"
                        >
                          {lead.clientName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{lead.clientPhone}</span>
                          {lead.clientEmail && <span>• {lead.clientEmail}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{lead.development}</div>
                        <div className="text-xs text-slate-500">{lead.propertyUnit || 'Unid. não definida'}</div>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {lead.origin}
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {lead.brokerName}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateStatus(lead.id, e.target.value as PipelineStage)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stage.bg} ${stage.color} border ${stage.border} focus:outline-none cursor-pointer`}
                        >
                          {Object.entries(STAGE_CONFIG).map(([sKey, sConf]) => (
                            <option key={sKey} value={sKey}>{sConf.label}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(lead.propertyValue)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openWhatsApp(lead.clientPhone, lead.clientName)}
                            title="Abrir WhatsApp"
                            className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditLead(lead)}
                            title="Editar Lead"
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteLead(lead.id)}
                            title="Excluir Lead"
                            className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
