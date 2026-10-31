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

export type UserRole = 'admin' | 'broker';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  brokerId?: string;
  brokerName?: string;
  phone?: string;
  creci?: string;
  active: boolean;
  createdAt: string;
  mustChangePassword?: boolean;
}

export interface BrokerItem {
  id: string;
  name: string;
  team: string;
  creci: string;
  phone: string;
  email: string;
  monthlyGoal: number;
  active: boolean;
  // Duty & Lead Distribution fields
  isDuty?: boolean;
  dutyShift?: 'manha' | 'tarde' | 'noite' | 'integral';
  dutyOrder?: number;
  leadsReceivedToday?: number;
  maxLeadsPerDay?: number;
  dutyStatus?: 'disponivel' | 'em_atendimento' | 'pausa' | 'offline';
  lastAssignedAt?: string;
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

export type DistributionStrategy = 'round_robin' | 'least_loaded';

export interface DistributionRule {
  id: string;
  name: string;
  active: boolean;
  priority: number;
  strategy: DistributionStrategy;
  targetDevelopment?: string; // empty means any development
  targetOrigin?: string; // empty means any origin
  minValue?: number;
  maxValue?: number;
  eligibleBrokerIds: string[]; // empty means all duty brokers
  description?: string;
}

export interface DistributionSettings {
  autoDistributionEnabled: boolean;
  defaultStrategy: DistributionStrategy;
  notifyBrokerOnWhatsapp: boolean;
  preventOverload: boolean; // respect maxLeadsPerDay
  fallbackBrokerId?: string;
}

export interface DistributionLog {
  id: string;
  leadId: string;
  leadName: string;
  clientPhone: string;
  brokerId: string;
  brokerName: string;
  mode: 'automatico' | 'manual';
  ruleId?: string;
  ruleName: string;
  timestamp: string;
  development?: string;
  origin?: string;
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
  // Distribution fields
  distributionStatus?: 'distribuido' | 'pendente_distribuicao';
  distributionMode?: 'automatico' | 'manual' | 'direto';
  distributionRuleName?: string;
  distributedAt?: string;
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
  { 
    id: 'b-1', 
    name: 'Carlos Silva', 
    team: 'Equipe Plantão Alpha', 
    creci: '184920-F', 
    phone: '(11) 98765-4321', 
    email: 'carlos.silva@imob.com', 
    monthlyGoal: 1500000, 
    active: true,
    isDuty: true,
    dutyShift: 'integral',
    dutyOrder: 1,
    leadsReceivedToday: 2,
    maxLeadsPerDay: 8,
    dutyStatus: 'disponivel',
    lastAssignedAt: new Date(Date.now() - 3600000).toISOString()
  },
  { 
    id: 'b-2', 
    name: 'Ana Souza', 
    team: 'Equipe Lançamentos', 
    creci: '192834-F', 
    phone: '(11) 97123-8899', 
    email: 'ana.souza@imob.com', 
    monthlyGoal: 1200000, 
    active: true,
    isDuty: true,
    dutyShift: 'tarde',
    dutyOrder: 2,
    leadsReceivedToday: 1,
    maxLeadsPerDay: 6,
    dutyStatus: 'disponivel',
    lastAssignedAt: new Date(Date.now() - 7200000).toISOString()
  },
  { 
    id: 'b-3', 
    name: 'Roberto Mendes', 
    team: 'Equipe Alto Padrão', 
    creci: '164729-F', 
    phone: '(11) 94433-2211', 
    email: 'roberto.m@imob.com', 
    monthlyGoal: 2000000, 
    active: true,
    isDuty: true,
    dutyShift: 'integral',
    dutyOrder: 3,
    leadsReceivedToday: 3,
    maxLeadsPerDay: 5,
    dutyStatus: 'em_atendimento',
    lastAssignedAt: new Date(Date.now() - 1800000).toISOString()
  },
  { 
    id: 'b-4', 
    name: 'Juliana Castro', 
    team: 'Equipe Plantão Alpha', 
    creci: '201948-F', 
    phone: '(11) 96543-1122', 
    email: 'juliana.castro@imob.com', 
    monthlyGoal: 1200000, 
    active: true,
    isDuty: true,
    dutyShift: 'manha',
    dutyOrder: 4,
    leadsReceivedToday: 1,
    maxLeadsPerDay: 7,
    dutyStatus: 'disponivel',
    lastAssignedAt: new Date(Date.now() - 10800000).toISOString()
  },
  { 
    id: 'b-5', 
    name: 'Marcos Vinícius', 
    team: 'Equipe Lançamentos', 
    creci: '178392-F', 
    phone: '(11) 99888-7766', 
    email: 'marcos.v@imob.com', 
    monthlyGoal: 1000000, 
    active: true,
    isDuty: false,
    dutyShift: 'manha',
    dutyOrder: 5,
    leadsReceivedToday: 0,
    maxLeadsPerDay: 5,
    dutyStatus: 'offline'
  },
  { 
    id: 'b-6', 
    name: 'Fernanda Lima', 
    team: 'Equipe Hunter Digital', 
    creci: '210943-F', 
    phone: '(11) 93322-5544', 
    email: 'fernanda.lima@imob.com', 
    monthlyGoal: 1500000, 
    active: true,
    isDuty: true,
    dutyShift: 'integral',
    dutyOrder: 6,
    leadsReceivedToday: 2,
    maxLeadsPerDay: 10,
    dutyStatus: 'disponivel',
    lastAssignedAt: new Date(Date.now() - 5400000).toISOString()
  },
];

export const INITIAL_DEVELOPMENT_ITEMS: DevelopmentItem[] = [
  { id: 'd-1', name: 'Residencial Vista Verde', type: 'Apartamento Padrão', developer: 'Incorporadora Horizonte', address: 'Av. Paulista, 1200 - Jardins', unitsTotal: 120, unitsAvailable: 34, priceRange: 'R$ 380k - R$ 520k', estimatedVGV: 54000000, status: 'obras' },
  { id: 'd-2', name: 'Studio Urban Pinheiros', type: 'Stúdio', developer: 'Metrópole Urbanismo', address: 'Rua Bela Cintra, 850 - Consolação', unitsTotal: 180, unitsAvailable: 45, priceRange: 'R$ 350k - R$ 550k', estimatedVGV: 78000000, status: 'lancamento' },
  { id: 'd-3', name: 'Condomínio Horizon', type: 'Casa em Condomínio', developer: 'Viva Bem Construtora', address: 'Rod. dos Bandeirantes, Km 32', unitsTotal: 65, unitsAvailable: 12, priceRange: 'R$ 850k - R$ 1.4M', estimatedVGV: 68000000, status: 'pronto' },
  { id: 'd-4', name: 'Edifício Grand Palais', type: 'Cobertura', developer: 'Palais Empreendimentos', address: 'Al. Gabriel Monteiro da Silva, 450', unitsTotal: 40, unitsAvailable: 8, priceRange: 'R$ 1.8M - R$ 4.5M', estimatedVGV: 92000000, status: 'pronto' },
  { id: 'd-5', name: 'Duplex Skyline Jardins', type: 'Apartamento Duplex', developer: 'Sul Engenharia', address: 'Rua Oscar Freire, 900', unitsTotal: 30, unitsAvailable: 6, priceRange: 'R$ 1.2M - R$ 2.4M', estimatedVGV: 60000000, status: 'obras' },
  { id: 'd-6', name: 'Loteamento Fazenda Real', type: 'Terreno em Condomínio', developer: 'Terra Nova Loteamentos', address: 'Rodovia Castelo Branco, Km 68', unitsTotal: 150, unitsAvailable: 42, priceRange: 'R$ 220k - R$ 480k', estimatedVGV: 45000000, status: 'lancamento' },
  { id: 'd-7', name: 'Chácara Recanto das Flores', type: 'Chácara em Condomínio', developer: 'Interior Life', address: 'Estância de Itu, SP', unitsTotal: 25, unitsAvailable: 5, priceRange: 'R$ 650k - R$ 1.1M', estimatedVGV: 25000000, status: 'pronto' },
  { id: 'd-8', name: 'Centro Logístico Anhanguera', type: 'Galpão', developer: 'Industrial Parks', address: 'Rod. Anhanguera, Km 40', unitsTotal: 20, unitsAvailable: 4, priceRange: 'R$ 2.5M - R$ 6.0M', estimatedVGV: 80000000, status: 'pronto' },
  { id: 'd-9', name: 'Business Center Paulista', type: 'Salão Comercial', developer: 'Comercial Properties', address: 'Av. Paulista, 2000', unitsTotal: 60, unitsAvailable: 15, priceRange: 'R$ 450k - R$ 900k', estimatedVGV: 40000000, status: 'obras' },
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

export type TaskPriority = 'baixa' | 'media' | 'alta';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluido';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  relatedClient?: string;
  createdAt: string;
}

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Enviar simulação de financiamento',
    description: 'Enviar laudo e taxas atualizadas para o cliente Roberto Carlos.',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    priority: 'alta',
    status: 'pendente',
    assignedTo: 'Carlos Silva',
    relatedClient: 'Roberto Carlos',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    title: 'Confirmar visita ao plantão Alpha',
    description: 'Ligar para confirmar horário de visitação no stand de vendas.',
    dueDate: new Date().toISOString().slice(0, 10),
    priority: 'media',
    status: 'em_andamento',
    assignedTo: 'Ana Souza',
    relatedClient: 'Juliana Mendes',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_DISTRIBUTION_SETTINGS: DistributionSettings = {
  autoDistributionEnabled: true,
  defaultStrategy: 'round_robin',
  notifyBrokerOnWhatsapp: true,
  preventOverload: true,
  fallbackBrokerId: 'b-1'
};

export const INITIAL_DISTRIBUTION_RULES: DistributionRule[] = [
  {
    id: 'rule-1',
    name: 'Alto Padrão & Coberturas',
    active: true,
    priority: 1,
    strategy: 'least_loaded',
    targetDevelopment: 'Edifício Grand Palais',
    minValue: 1000000,
    eligibleBrokerIds: ['b-3'], // Roberto Mendes
    description: 'Direciona imóveis de alto luxo ou com valor > R$ 1M para corretores especialistas'
  },
  {
    id: 'rule-2',
    name: 'Tráfego Pago & Redes Sociais',
    active: true,
    priority: 2,
    strategy: 'round_robin',
    targetOrigin: 'Instagram Ads',
    eligibleBrokerIds: ['b-6', 'b-1'], // Fernanda Lima & Carlos Silva
    description: 'Fila de resposta rápida para leads de campanhas digitais no Instagram'
  },
  {
    id: 'rule-3',
    name: 'Passantes & Visitas Stand',
    active: true,
    priority: 3,
    strategy: 'round_robin',
    targetOrigin: 'Passante / Plantão',
    eligibleBrokerIds: ['b-1', 'b-4'], // Carlos Silva & Juliana Castro (Equipe Plantão Alpha)
    description: 'Distribuição direta para a equipe física do stand de vendas'
  },
  {
    id: 'rule-4',
    name: 'Roleta Geral de Plantão (Equitativa)',
    active: true,
    priority: 10,
    strategy: 'round_robin',
    eligibleBrokerIds: [], // Todos os plantonistas ativos
    description: 'Roleta alternada entre todos os corretores que estiverem com plantão ativo hoje'
  }
];

export const INITIAL_DISTRIBUTION_LOGS: DistributionLog[] = [
  {
    id: 'log-1',
    leadId: 'lead-1',
    leadName: 'João da Silva',
    clientPhone: '(11) 98765-4321',
    brokerId: 'b-1',
    brokerName: 'Carlos Silva',
    mode: 'automatico',
    ruleId: 'rule-3',
    ruleName: 'Passantes & Visitas Stand',
    timestamp: new Date(Date.now() - 7200000).toLocaleString('pt-BR'),
    development: 'Residencial Vista Verde',
    origin: 'Passante / Plantão'
  },
  {
    id: 'log-2',
    leadId: 'lead-2',
    leadName: 'Mariana Duarte',
    clientPhone: '(11) 91234-5678',
    brokerId: 'b-6',
    brokerName: 'Fernanda Lima',
    mode: 'automatico',
    ruleId: 'rule-2',
    ruleName: 'Tráfego Pago & Redes Sociais',
    timestamp: new Date(Date.now() - 14400000).toLocaleString('pt-BR'),
    development: 'Studio Urban Pinheiros',
    origin: 'Instagram Ads'
  },
  {
    id: 'log-3',
    leadId: 'lead-3',
    leadName: 'Lucas Ferreira',
    clientPhone: '(11) 99876-5432',
    brokerId: 'b-3',
    brokerName: 'Roberto Mendes',
    mode: 'manual',
    ruleName: 'Direcionamento Manual pelo Gestor',
    timestamp: new Date(Date.now() - 28800000).toLocaleString('pt-BR'),
    development: 'Edifício Grand Palais',
    origin: 'Portal ZAP / VivaReal'
  }
];

