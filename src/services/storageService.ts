import { Lead, BrokerItem, DevelopmentItem, OriginItem, TeamItem, TaskItem, ThemeMode, BorderMode } from '../types';
import { INITIAL_LEADS } from '../mockData';
import { INITIAL_BROKER_ITEMS, INITIAL_DEVELOPMENT_ITEMS, INITIAL_ORIGIN_ITEMS, INITIAL_TEAM_ITEMS, INITIAL_TASKS } from '../types';

const STORAGE_KEYS = {
  LEADS: 'immoflow_leads',
  BROKERS: 'immoflow_brokers',
  DEVELOPMENTS: 'immoflow_developments',
  ORIGINS: 'immoflow_origins',
  TEAMS: 'immoflow_teams',
  TASKS: 'immoflow_tasks',
  THEME: 'immoflow_theme',
  BORDER_MODE: 'immoflow_border_mode',
};

// Sanitization & Migration helper for Leads
function sanitizeLeads(raw: any[]): Lead[] {
  if (!Array.isArray(raw)) return INITIAL_LEADS;
  return raw.map((item, idx) => ({
    id: item.id || `lead-migrated-${idx}-${Date.now()}`,
    clientName: item.clientName || 'Cliente sem nome',
    clientPhone: item.clientPhone || '(11) 00000-0000',
    clientEmail: item.clientEmail || '',
    brokerName: item.brokerName || 'Carlos Silva',
    development: item.development || 'Residencial Vista Verde',
    origin: item.origin || 'Instagram Ads',
    status: item.status || 'lead',
    propertyUnit: item.propertyUnit || '',
    propertyValue: typeof item.propertyValue === 'number' ? item.propertyValue : 450000,
    commissionRate: typeof item.commissionRate === 'number' ? item.commissionRate : 5,
    visitDate: item.visitDate || '',
    notes: item.notes || '',
    pastaStatus: item.pastaStatus || 'incompleta',
    creditStatus: item.creditStatus || 'em_atendimento',
    rejectionReason: item.rejectionReason,
    rejectionDetails: item.rejectionDetails,
    nextAction: item.nextAction || '',
    attendanceRecords: Array.isArray(item.attendanceRecords) ? item.attendanceRecords : [],
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    documents: Array.isArray(item.documents) ? item.documents : [
      { id: 'doc-1', name: 'RG / CPF', status: 'pendente' },
      { id: 'doc-2', name: 'Comprovante de Renda', status: 'pendente' },
      { id: 'doc-3', name: 'Imposto de Renda', status: 'pendente' },
    ],
    history: Array.isArray(item.history) ? item.history : []
  }));
}

function sanitizeBrokers(raw: any[]): BrokerItem[] {
  if (!Array.isArray(raw)) return INITIAL_BROKER_ITEMS;
  return raw.map((item, idx) => ({
    id: item.id || `b-migrated-${idx}`,
    name: item.name || 'Corretor',
    team: item.team || 'Equipe Padrão',
    creci: item.creci || '00000-F',
    phone: item.phone || '',
    email: item.email || '',
    monthlyGoal: typeof item.monthlyGoal === 'number' ? item.monthlyGoal : 1200000,
    active: typeof item.active === 'boolean' ? item.active : true,
  }));
}

function sanitizeDevelopments(raw: any[]): DevelopmentItem[] {
  if (!Array.isArray(raw)) return INITIAL_DEVELOPMENT_ITEMS;
  return raw.map((item, idx) => ({
    id: item.id || `d-migrated-${idx}`,
    name: item.name || 'Empreendimento',
    type: item.type || 'Apartamento Padrão',
    developer: item.developer || 'Construtora',
    address: item.address || 'Localização',
    unitsTotal: typeof item.unitsTotal === 'number' ? item.unitsTotal : 50,
    unitsAvailable: typeof item.unitsAvailable === 'number' ? item.unitsAvailable : 20,
    priceRange: item.priceRange || 'Sob Consulta',
    estimatedVGV: typeof item.estimatedVGV === 'number' ? item.estimatedVGV : 20000000,
    status: item.status || 'lancamento',
  }));
}

function sanitizeOrigins(raw: any[]): OriginItem[] {
  if (!Array.isArray(raw)) return INITIAL_ORIGIN_ITEMS;
  return raw.map((item, idx) => ({
    id: item.id || `o-migrated-${idx}`,
    name: item.name || 'Canal',
    category: item.category || 'digital',
    description: item.description || '',
    active: typeof item.active === 'boolean' ? item.active : true,
  }));
}

function sanitizeTeams(raw: any[]): TeamItem[] {
  if (!Array.isArray(raw)) return INITIAL_TEAM_ITEMS;
  return raw.map((item, idx) => ({
    id: item.id || `t-migrated-${idx}`,
    name: item.name || 'Equipe',
    leader: item.leader || 'Líder',
    description: item.description || '',
  }));
}

function sanitizeTasks(raw: any[]): TaskItem[] {
  if (!Array.isArray(raw)) return INITIAL_TASKS;
  return raw.map((item, idx) => ({
    id: item.id || `task-migrated-${idx}`,
    title: item.title || 'Tarefa',
    description: item.description || '',
    dueDate: item.dueDate || new Date().toISOString().slice(0, 10),
    priority: item.priority || 'media',
    status: item.status || 'pendente',
    assignedTo: item.assignedTo || 'Corretor',
    relatedClient: item.relatedClient || '',
    createdAt: item.createdAt || new Date().toISOString(),
  }));
}

export const storageService = {
  getLeads(): Lead[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (saved !== null) {
        return sanitizeLeads(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler leads do localStorage:', e);
    }
    return INITIAL_LEADS;
  },
  setLeads(leads: Lead[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch (e) {
      console.error('Erro ao salvar leads no localStorage:', e);
    }
  },

  getBrokers(): BrokerItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BROKERS);
      if (saved !== null) {
        return sanitizeBrokers(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler corretores:', e);
    }
    return INITIAL_BROKER_ITEMS;
  },
  setBrokers(brokers: BrokerItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(brokers));
    } catch (e) {
      console.error('Erro ao salvar corretores:', e);
    }
  },

  getDevelopments(): DevelopmentItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVELOPMENTS);
      if (saved !== null) {
        return sanitizeDevelopments(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler empreendimentos:', e);
    }
    return INITIAL_DEVELOPMENT_ITEMS;
  },
  setDevelopments(devs: DevelopmentItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVELOPMENTS, JSON.stringify(devs));
    } catch (e) {
      console.error('Erro ao salvar empreendimentos:', e);
    }
  },

  getOrigins(): OriginItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORIGINS);
      if (saved !== null) {
        return sanitizeOrigins(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler origens:', e);
    }
    return INITIAL_ORIGIN_ITEMS;
  },
  setOrigins(origins: OriginItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORIGINS, JSON.stringify(origins));
    } catch (e) {
      console.error('Erro ao salvar origens:', e);
    }
  },

  getTeams(): TeamItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (saved !== null) {
        return sanitizeTeams(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler equipes:', e);
    }
    return INITIAL_TEAM_ITEMS;
  },
  setTeams(teams: TeamItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    } catch (e) {
      console.error('Erro ao salvar equipes:', e);
    }
  },

  getTasks(): TaskItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved !== null) {
        return sanitizeTasks(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler tarefas:', e);
    }
    return INITIAL_TASKS;
  },
  setTasks(tasks: TaskItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Erro ao salvar tarefas:', e);
    }
  },

  getTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved) return saved as ThemeMode;
    } catch (e) {}
    return 'bordo';
  },
  setTheme(theme: ThemeMode) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {}
  },

  getBorderMode(): BorderMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BORDER_MODE);
      if (saved) return saved as BorderMode;
    } catch (e) {}
    return 'destacada';
  },
  setBorderMode(mode: BorderMode) {
    try {
      localStorage.setItem(STORAGE_KEYS.BORDER_MODE, mode);
    } catch (e) {}
  },

  exportBackupJson(): string {
    const backup = {
      leads: this.getLeads(),
      brokers: this.getBrokers(),
      developments: this.getDevelopments(),
      origins: this.getOrigins(),
      teams: this.getTeams(),
      tasks: this.getTasks(),
      theme: this.getTheme(),
      borderMode: this.getBorderMode(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.leads) this.setLeads(sanitizeLeads(data.leads));
      if (data.brokers) this.setBrokers(sanitizeBrokers(data.brokers));
      if (data.developments) this.setDevelopments(sanitizeDevelopments(data.developments));
      if (data.origins) this.setOrigins(sanitizeOrigins(data.origins));
      if (data.teams) this.setTeams(sanitizeTeams(data.teams));
      if (data.tasks) this.setTasks(sanitizeTasks(data.tasks));
      if (data.theme) this.setTheme(data.theme);
      if (data.borderMode) this.setBorderMode(data.borderMode);
      return true;
    } catch (e) {
      console.error('Erro ao importar JSON de backup:', e);
      return false;
    }
  }
};
