export type PipelineStage = 
  | 'lead' 
  | 'visita_plantao' 
  | 'montagem_pasta' 
  | 'credito_condicionado' 
  | 'credito_reprovado' 
  | 'credito_aprovado' 
  | 'venda_realizada';

export type ThemeMode = 'bordo' | 'azul' | 'esmeralda' | 'dourado';
export type BorderMode = 'destacada' | 'suave';

export interface BrokerItem {
  id: string;
  name: string;
  team: string;
  creci: string;
  phone: string;
  email: string;
  monthlyGoal: number;
  active: boolean;
}

export interface DevelopmentItem {
  id: string;
  name: string;
  type: string; // ex: "Apartamento", "Casa em Condomínio", "Loteamento", "Comercial"
  developer: string;
  address: string;
  unitsTotal: number;
  unitsAvailable: number;
  priceRange: string;
  estimatedVGV: number;
  status: 'lancamento' | 'obras' | 'pronto';
}

export interface OriginItem {
  id: string;
  name: string;
  category: 'digital' | 'presencial' | 'indicacao' | 'parceria';
  description?: string;
  active: boolean;
}

export interface TeamItem {
  id: string;
  name: string;
  leader: string;
  description: string;
}

export type ContactType = 'ligacao' | 'whatsapp' | 'email' | 'presencial';
export type RejectionReason = 'bacen' | 'comprometimento_renda' | 'spc_serasa' | 'conres' | 'scr' | 'outros';

export interface AttendanceRecord {
  id: string;
  date: string;
  contactType: ContactType;
  summary: string;
  nextAction?: string;
  userName: string;
}

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
  pastaStatus?: 'completa' | 'incompleta' | 'em_atendimento' | 'visita';
  creditStatus?: 'em_atendimento' | 'visita' | 'aprovado' | 'condicionado' | 'reprovado';
  rejectionReason?: RejectionReason;
  rejectionDetails?: string;
  nextAction?: string;
  attendanceRecords: AttendanceRecord[];
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

export const INITIAL_BROKER_ITEMS: BrokerItem[] = [
  { id: 'b-1', name: 'Carlos Silva', team: 'Equipe Plantão Alpha', creci: '184920-F', phone: '(11) 98765-4321', email: 'carlos.silva@imob.com', monthlyGoal: 1500000, active: true },
  { id: 'b-2', name: 'Ana Souza', team: 'Equipe Lançamentos', creci: '192834-F', phone: '(11) 97123-8899', email: 'ana.souza@imob.com', monthlyGoal: 1200000, active: true },
  { id: 'b-3', name: 'Roberto Mendes', team: 'Equipe Alto Padrão', creci: '164729-F', phone: '(11) 94433-2211', email: 'roberto.m@imob.com', monthlyGoal: 2000000, active: true },
  { id: 'b-4', name: 'Juliana Castro', team: 'Equipe Plantão Alpha', creci: '201948-F', phone: '(11) 96543-1122', email: 'juliana.castro@imob.com', monthlyGoal: 1200000, active: true },
  { id: 'b-5', name: 'Marcos Vinícius', team: 'Equipe Lançamentos', creci: '178392-F', phone: '(11) 99888-7766', email: 'marcos.v@imob.com', monthlyGoal: 1000000, active: true },
  { id: 'b-6', name: 'Fernanda Lima', team: 'Equipe Hunter Digital', creci: '210943-F', phone: '(11) 93322-5544', email: 'fernanda.lima@imob.com', monthlyGoal: 1500000, active: true },
];

export const INITIAL_DEVELOPMENT_ITEMS: DevelopmentItem[] = [
  { id: 'd-1', name: 'Residencial Vista Verde', type: 'Apartamento', developer: 'Incorporadora Horizonte', address: 'Av. Paulista, 1200 - Jardins', unitsTotal: 120, unitsAvailable: 34, priceRange: 'R$ 380k - R$ 520k', estimatedVGV: 54000000, status: 'obras' },
  { id: 'd-2', name: 'Torre Metrópole', type: 'Apartamento Studio / 1D', developer: 'Metrópole Urbanismo', address: 'Rua Bela Cintra, 850 - Consolação', unitsTotal: 180, unitsAvailable: 45, priceRange: 'R$ 450k - R$ 750k', estimatedVGV: 98000000, status: 'lancamento' },
  { id: 'd-3', name: 'Condomínio Horizon', type: 'Casa em Condomínio', developer: 'Viva Bem Construtora', address: 'Rod. dos Bandeirantes, Km 32', unitsTotal: 65, unitsAvailable: 12, priceRange: 'R$ 850k - R$ 1.4M', estimatedVGV: 68000000, status: 'pronto' },
  { id: 'd-4', name: 'Residencial Jardins do Sul', type: 'Apartamento Familiar', developer: 'Sul Engenharia', address: 'Rua Vergueiro, 3400 - Chácara Klabin', unitsTotal: 96, unitsAvailable: 28, priceRange: 'R$ 340k - R$ 490k', estimatedVGV: 39000000, status: 'obras' },
  { id: 'd-5', name: 'Edifício Grand Palais', type: 'Alto Padrão / Coberturas', developer: 'Palais Empreendimentos', address: 'Al. Gabriel Monteiro da Silva, 450', unitsTotal: 40, unitsAvailable: 8, priceRange: 'R$ 1.2M - R$ 3.5M', estimatedVGV: 82000000, status: 'pronto' },
  { id: 'd-6', name: 'Vila Bella Park', type: 'Sobrados & Vilas', developer: 'Bella Empreendimentos', address: 'Estrada do Campo Limpo, 1500', unitsTotal: 84, unitsAvailable: 19, priceRange: 'R$ 550k - R$ 780k', estimatedVGV: 56000000, status: 'lancamento' },
];

export const INITIAL_ORIGIN_ITEMS: OriginItem[] = [
  { id: 'o-1', name: 'Instagram Ads', category: 'digital', description: 'Campanhas de tráfego e leads no Instagram', active: true },
  { id: 'o-2', name: 'Facebook Ads', category: 'digital', description: 'Formulários instantâneos no Meta Ads', active: true },
  { id: 'o-3', name: 'Portal ZAP / VivaReal', category: 'digital', description: 'Anúncios nos portais do Grupo OLX', active: true },
  { id: 'o-4', name: 'OLX Imóveis', category: 'digital', description: 'Classificados OLX Direto', active: true },
  { id: 'o-5', name: 'Indicação de Cliente', category: 'indicacao', description: 'Clientes satisfeitos e parentes', active: true },
  { id: 'o-6', name: 'Passante / Plantão', category: 'presencial', description: 'Visita espontânea ao stand de vendas', active: true },
  { id: 'o-7', name: 'Google Search', category: 'digital', description: 'Google Ads Pesquisa e Rede de Display', active: true },
  { id: 'o-8', name: 'Parceria Corretor', category: 'parceria', description: 'Co-corretagem e imobiliárias parceiras', active: true },
];

export const INITIAL_TEAM_ITEMS: TeamItem[] = [
  { id: 't-1', name: 'Equipe Plantão Alpha', leader: 'Carlos Silva', description: 'Focada em atendimento no stand principal e alta conversão' },
  { id: 't-2', name: 'Equipe Lançamentos', leader: 'Ana Souza', description: 'Especialistas em vendas na planta e tabelas de investidores' },
  { id: 't-3', name: 'Equipe Alto Padrão', leader: 'Roberto Mendes', description: 'Atendimento exclusivo de coberturas e imóveis de luxo' },
  { id: 't-4', name: 'Equipe Hunter Digital', leader: 'Fernanda Lima', description: 'Qualificação ultrarrápida de leads vindos de tráfego pago' },
];

// String arrays for backwards compatibility
export const ORIGINS = INITIAL_ORIGIN_ITEMS.map(o => o.name);
export const DEVELOPMENTS = INITIAL_DEVELOPMENT_ITEMS.map(d => d.name);
export const BROKERS = INITIAL_BROKER_ITEMS.map(b => b.name);
