import React from 'react';
import { 
  User, 
  Phone, 
  Building, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  MessageCircle, 
  Edit3, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Lead, PipelineStage, STAGE_CONFIG, ThemeMode, BorderMode } from '../types';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, newStatus: PipelineStage) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onSelectLead: (lead: Lead) => void;
  theme?: ThemeMode;
  borderMode?: BorderMode;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onUpdateStatus,
  onEditLead,
  onDeleteLead,
  onSelectLead,
  theme = 'bordo',
  borderMode = 'destacada',
}) => {
  const stages: PipelineStage[] = [
    'lead',
    'visita_plantao',
    'montagem_pasta',
    'credito_condicionado',
    'credito_aprovado',
    'credito_reprovado',
    'venda_realizada',
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const getNextStage = (current: PipelineStage): PipelineStage | null => {
    const map: Record<PipelineStage, PipelineStage | null> = {
      lead: 'visita_plantao',
      visita_plantao: 'montagem_pasta',
      montagem_pasta: 'credito_condicionado',
      credito_condicionado: 'credito_aprovado',
      credito_aprovado: 'venda_realizada',
      credito_reprovado: null,
      venda_realizada: null,
    };
    return map[current];
  };

  const getPrevStage = (current: PipelineStage): PipelineStage | null => {
    const map: Record<PipelineStage, PipelineStage | null> = {
      lead: null,
      visita_plantao: 'lead',
      montagem_pasta: 'visita_plantao',
      credito_condicionado: 'montagem_pasta',
      credito_aprovado: 'credito_condicionado',
      credito_reprovado: 'montagem_pasta',
      venda_realizada: 'credito_aprovado',
    };
    return map[current];
  };

  const getBorderClass = () => {
    if (borderMode === 'destacada') {
      switch (theme) {
        case 'bordo': return 'border-2 border-rose-300 dark:border-rose-900/60 hover:border-rose-500 shadow-sm';
        case 'azul': return 'border-2 border-blue-300 dark:border-blue-900/60 hover:border-blue-500 shadow-sm';
        case 'esmeralda': return 'border-2 border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-500 shadow-sm';
        case 'dourado': return 'border-2 border-amber-300 dark:border-amber-900/60 hover:border-amber-500 shadow-sm';
      }
    }
    return 'border border-slate-200 dark:border-slate-800';
  };

  const getNextBtnBg = () => {
    switch (theme) {
      case 'bordo': return 'bg-rose-900 hover:bg-rose-800 text-white';
      case 'azul': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'esmeralda': return 'bg-emerald-700 hover:bg-emerald-800 text-white';
      case 'dourado': return 'bg-amber-600 hover:bg-amber-700 text-white';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Kanban Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl ${borderMode === 'destacada' ? 'border-2 border-rose-200 dark:border-rose-900/50' : 'border border-slate-200 dark:border-slate-800'} shadow-xs`}>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Funil de Vendas & Acompanhamento de Leads
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Arraste ou mova os cartões entre as etapas do plantão, crédito e fechamento.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          <span>Total no Funil: {leads.length} leads</span>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start overflow-x-auto pb-6">
        {stages.map((stageKey) => {
          const config = STAGE_CONFIG[stageKey];
          const stageLeads = leads.filter(l => l.status === stageKey);
          const stageVGV = stageLeads.reduce((acc, curr) => acc + (curr.propertyValue || 0), 0);

          return (
            <div 
              key={stageKey}
              className={`bg-slate-50 dark:bg-slate-900/50 ${borderMode === 'destacada' ? 'border-2 border-slate-200 dark:border-slate-800' : 'border border-slate-200 dark:border-slate-800'} rounded-2xl p-3 flex flex-col min-w-[260px] max-h-[80vh]`}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-xl ${config.bg} border ${config.border} mb-3 flex items-center justify-between`}>
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatCurrency(stageVGV)}
                  </p>
                </div>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${config.color} bg-white dark:bg-slate-900 shadow-xs`}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400">Nenhum lead nesta etapa</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const next = getNextStage(lead.status);
                    const prev = getPrevStage(lead.status);

                    return (
                      <div
                        key={lead.id}
                        className={`bg-white dark:bg-slate-900 ${getBorderClass()} rounded-xl p-4 transition-all group relative space-y-3`}
                      >
                        {/* Top Card Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div 
                            onClick={() => onSelectLead(lead)}
                            className="cursor-pointer"
                          >
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-rose-700 dark:hover:text-rose-400 transition-colors">
                              {lead.clientName}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              {lead.development} ({lead.propertyUnit || 'Unid. não def.'})
                            </p>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditLead(lead)}
                              title="Editar"
                              className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteLead(lead.id)}
                              title="Excluir"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Origin & Broker */}
                        <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                          <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span className="text-slate-400">Origem:</span>
                            <span className="font-semibold">{lead.origin}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span className="text-slate-400">Corretor:</span>
                            <span className="font-semibold">{lead.brokerName}</span>
                          </div>
                        </div>

                        {/* Property Value & Visit Date */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatCurrency(lead.propertyValue)}
                          </span>
                          {lead.visitDate && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(lead.visitDate).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons & Quick Move */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <a
                            href={`https://wa.me/55${lead.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.clientName}, tudo bem? Aqui é da equipe de atendimento imobiliário sobre o ${lead.development}...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir conversa no WhatsApp"
                            className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <div className="flex items-center gap-1">
                            {prev && (
                              <button
                                onClick={() => onUpdateStatus(lead.id, prev)}
                                title="Mover para etapa anterior"
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {next && (
                              <button
                                onClick={() => onUpdateStatus(lead.id, next)}
                                title="Avançar para próxima etapa"
                                className={`p-1.5 ${getNextBtnBg()} rounded-lg shadow-xs transition-colors cursor-pointer`}
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
