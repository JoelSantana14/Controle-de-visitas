export type PipelineStage = 
  | 'lead' 
  | 'visita_plantao' 
  | 'montagem_pasta' 
  | 'credito_condicionado' 
  | 'credito_reprovado' 
  | 'credito_aprovado' 
  | 'venda_realizada';

export interface DocumentItem {
  id: string;
  name: string;
  status: 'pendente' | 'enviado' | 'aprovado';
}

export interface HistoryItem {
  id: string;
  date: string;
  action: string;
  user: string;
}

export interface Lead {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  brokerName: string;
  development: string;
  origin: string;
  status: PipelineStage;
  propertyUnit: string;
  propertyValue: number;
  commissionRate: number; // e.g. 5%
  visitDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  documents: DocumentItem[];
  history: HistoryItem[];
}

export interface FilterOptions {
  search: string;
  status: string;
  broker: string;
  development: string;
  origin: string;
}

export const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bg: string; border: string; icon: string }> = {
  lead: {
    label: 'Novo Lead',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'UserPlus',
  },
  visita_plantao: {
    label: 'Visita ao Plantão',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'MapPin',
  },
  montagem_pasta: {
    label: 'Montagem de Pasta',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'FolderOpen',
  },
  credito_condicionado: {
    label: 'Crédito Condicionado',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'AlertCircle',
  },
  credito_reprovado: {
    label: 'Crédito Reprovado',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    icon: 'XCircle',
  },
  credito_aprovado: {
    label: 'Crédito Aprovado',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'CheckCircle2',
  },
  venda_realizada: {
    label: 'Venda Realizada',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'BadgePercent',
  },
};

export const ORIGINS = [
  'Instagram Ads',
  'Facebook Ads',
  'Portal ZAP / VivaReal',
  'OLX Imóveis',
  'Indicação de Cliente',
  'Passante / Plantão',
  'Google Search',
  'Parceria Corretor',
];

export const DEVELOPMENTS = [
  'Residencial Vista Verde',
  'Torre Metrópole',
  'Condomínio Horizon',
  'Residencial Jardins do Sul',
  'Edifício Grand Palais',
  'Vila Bella Park',
];

export const BROKERS = [
  'Carlos Silva',
  'Ana Souza',
  'Roberto Mendes',
  'Juliana Castro',
  'Marcos Vinícius',
  'Fernanda Lima',
];
