import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Compass, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Phone, 
  Mail, 
  DollarSign, 
  MapPin, 
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  UserCheck,
  UserX,
  Copy,
  Lock,
  Shield,
  UserPlus
} from 'lucide-react';
import { BrokerItem, DevelopmentItem, OriginItem, TeamItem, ThemeMode, BorderMode, AppUser, UserRole } from '../types';
import { useAuth, DEFAULT_INITIAL_PASSWORD, MASTER_ADMIN_EMAIL } from '../contexts/AuthContext';

interface BrokersPropertiesViewProps {
  brokers: BrokerItem[];
  setBrokers: React.Dispatch<React.SetStateAction<BrokerItem[]>>;
  developments: DevelopmentItem[];
  setDevelopments: React.Dispatch<React.SetStateAction<DevelopmentItem[]>>;
  origins: OriginItem[];
  setOrigins: React.Dispatch<React.SetStateAction<OriginItem[]>>;
  teams: TeamItem[];
  setTeams: React.Dispatch<React.SetStateAction<TeamItem[]>>;
  theme: ThemeMode;
  borderMode: BorderMode;
}

export const BrokersPropertiesView: React.FC<BrokersPropertiesViewProps> = ({
  brokers,
  setBrokers,
  developments,
  setDevelopments,
  origins,
  setOrigins,
  teams,
  setTeams,
  theme,
  borderMode
}) => {
  const { usersList, adminCreateUser, adminToggleUserStatus, adminDeleteUser } = useAuth();
  const [subTab, setSubTab] = useState<'brokers' | 'developments' | 'origins' | 'teams' | 'users'>('brokers');

  // Modal states
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<BrokerItem | null>(null);
  const [brokerForm, setBrokerForm] = useState<Partial<BrokerItem>>({
    name: '',
    team: teams[0]?.name || 'Equipe Plantão Alpha',
    creci: '',
    phone: '',
    email: '',
    monthlyGoal: 1200000,
    active: true,
  });

  // User Access Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState<{
    displayName: string;
    email: string;
    role: UserRole;
    brokerId: string;
    brokerName: string;
    phone: string;
    creci: string;
    initialPassword: string;
  }>({
    displayName: '',
    email: '',
    role: 'broker',
    brokerId: '',
    brokerName: '',
    phone: '',
    creci: '',
    initialPassword: DEFAULT_INITIAL_PASSWORD,
  });
  const [userCreationLoading, setUserCreationLoading] = useState(false);
  const [userCreationError, setUserCreationError] = useState<string | null>(null);
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<{
    email: string;
    password: string;
    name: string;
    role: string;
  } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [editingDev, setEditingDev] = useState<DevelopmentItem | null>(null);
  const [devForm, setDevForm] = useState<Partial<DevelopmentItem>>({
    name: '',
    type: 'Apartamento',
    developer: '',
    address: '',
    unitsTotal: 50,
    unitsAvailable: 20,
    priceRange: 'R$ 400k - R$ 800k',
    estimatedVGV: 25000000,
    status: 'lancamento',
  });

  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [originForm, setOriginForm] = useState<Partial<OriginItem>>({
    name: '',
    category: 'digital',
    description: '',
    active: true,
  });

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'broker' | 'dev' | 'origin' | 'user';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'broker', id: '', name: '' });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Broker Handlers
  const openNewBroker = () => {
    setEditingBroker(null);
    setBrokerForm({
      name: '',
      team: teams[0]?.name || 'Equipe Plantão Alpha',
      creci: '',
      phone: '',
      email: '',
      monthlyGoal: 1200000,
      active: true,
    });
    setIsBrokerModalOpen(true);
  };

  const openEditBroker = (b: BrokerItem) => {
    setEditingBroker(b);
    setBrokerForm(b);
    setIsBrokerModalOpen(true);
  };

  const handleSaveBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerForm.name?.trim()) return;

    if (editingBroker) {
      setBrokers(prev => prev.map(b => b.id === editingBroker.id ? { ...b, ...brokerForm } as BrokerItem : b));
    } else {
      const newB: BrokerItem = {
        id: `b-${Date.now()}`,
        name: brokerForm.name.trim(),
        team: brokerForm.team || 'Equipe Plantão Alpha',
        creci: brokerForm.creci || 'Em registro',
        phone: brokerForm.phone || '',
        email: brokerForm.email || '',
        monthlyGoal: Number(brokerForm.monthlyGoal) || 1200000,
        active: brokerForm.active ?? true,
      };
      setBrokers(prev => [newB, ...prev]);
    }
    setIsBrokerModalOpen(false);
  };

  // Development Handlers
  const openNewDev = () => {
    setEditingDev(null);
    setDevForm({
      name: '',
      type: 'Apartamento',
      developer: '',
      address: '',
      unitsTotal: 50,
      unitsAvailable: 20,
      priceRange: 'R$ 400k - R$ 800k',
      estimatedVGV: 25000000,
      status: 'lancamento',
    });
    setIsDevModalOpen(true);
  };

  const openEditDev = (d: DevelopmentItem) => {
    setEditingDev(d);
    setDevForm(d);
    setIsDevModalOpen(true);
  };

  const handleSaveDev = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devForm.name?.trim()) return;

    if (editingDev) {
      setDevelopments(prev => prev.map(d => d.id === editingDev.id ? { ...d, ...devForm } as DevelopmentItem : d));
    } else {
      const newD: DevelopmentItem = {
        id: `d-${Date.now()}`,
        name: devForm.name.trim(),
        type: devForm.type || 'Apartamento',
        developer: devForm.developer || 'Construtora Parceira',
        address: devForm.address || 'Endereço do Plantão',
        unitsTotal: Number(devForm.unitsTotal) || 50,
        unitsAvailable: Number(devForm.unitsAvailable) || 20,
        priceRange: devForm.priceRange || 'Sob Consulta',
        estimatedVGV: Number(devForm.estimatedVGV) || 20000000,
        status: devForm.status || 'lancamento',
      };
      setDevelopments(prev => [newD, ...prev]);
    }
    setIsDevModalOpen(false);
  };

  // Origin Handlers
  const openNewOrigin = () => {
    setOriginForm({
      name: '',
      category: 'digital',
      description: '',
      active: true,
    });
    setIsOriginModalOpen(true);
  };

  const handleSaveOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originForm.name?.trim()) return;

    const newO: OriginItem = {
      id: `o-${Date.now()}`,
      name: originForm.name.trim(),
      category: originForm.category || 'digital',
      description: originForm.description || '',
      active: originForm.active ?? true,
    };
    setOrigins(prev => [newO, ...prev]);
    setIsOriginModalOpen(false);
  };

  const openNewUser = (prefilledBroker?: BrokerItem) => {
    setUserCreationError(null);
    setUserForm({
      displayName: prefilledBroker ? prefilledBroker.name : '',
      email: prefilledBroker ? prefilledBroker.email : '',
      role: 'broker',
      brokerId: prefilledBroker ? prefilledBroker.id : (brokers[0]?.id || ''),
      brokerName: prefilledBroker ? prefilledBroker.name : (brokers[0]?.name || ''),
      phone: prefilledBroker ? prefilledBroker.phone : '',
      creci: prefilledBroker ? prefilledBroker.creci : '',
      initialPassword: DEFAULT_INITIAL_PASSWORD,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.displayName.trim()) {
      setUserCreationError('Nome e e-mail são obrigatórios.');
      return;
    }
    setUserCreationLoading(true);
    setUserCreationError(null);

    const res = await adminCreateUser({
      displayName: userForm.displayName.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      brokerId: userForm.brokerId || undefined,
      brokerName: userForm.brokerName || userForm.displayName,
      phone: userForm.phone,
      creci: userForm.creci,
      initialPassword: userForm.initialPassword || DEFAULT_INITIAL_PASSWORD,
    });

    setUserCreationLoading(false);
    if (res.success) {
      setIsUserModalOpen(false);
      setCreatedCredentialsModal({
        name: userForm.displayName,
        email: userForm.email,
        password: res.initialPassword || DEFAULT_INITIAL_PASSWORD,
        role: userForm.role === 'admin' ? 'Administrador' : 'Corretor',
      });
    } else {
      setUserCreationError(res.error || 'Erro ao criar usuário.');
    }
  };

  // Confirm delete
  const executeDelete = () => {
    if (deleteConfirm.type === 'broker') {
      setBrokers(prev => prev.filter(b => b.id !== deleteConfirm.id));
    } else if (deleteConfirm.type === 'dev') {
      setDevelopments(prev => prev.filter(d => d.id !== deleteConfirm.id));
    } else if (deleteConfirm.type === 'origin') {
      setOrigins(prev => prev.filter(o => o.id !== deleteConfirm.id));
    } else if (deleteConfirm.type === 'user') {
      adminDeleteUser(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, type: 'broker', id: '', name: '' });
  };

  const borderClass = borderMode === 'destacada'
    ? theme === 'bordo' 
      ? 'border-2 border-rose-800/60 shadow-md shadow-rose-950/10' 
      : 'border-2 border-blue-600/50 shadow-md'
    : 'border border-slate-200 dark:border-slate-800 shadow-xs';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl text-white ${
        theme === 'bordo' 
          ? 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 shadow-xl shadow-rose-950/20' 
          : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 shadow-xl shadow-blue-500/10'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5 text-rose-200" />
              <span>Gestão Central de Cadastros</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Corretores, Empreendimentos & Origens
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Cadastre novos corretores, equipes de vendas, imóveis e canais de captação. Todas as informações sincronizam imediatamente com o funil, relatórios e formulário de leads.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSubTab('users'); openNewUser(); }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/30"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Novo Usuário / Login</span>
            </button>
            <button
              onClick={openNewBroker}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Novo Corretor</span>
            </button>
            <button
              onClick={openNewDev}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/30"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Empreendimento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs (Horizontally scrollable with no text squishing) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scroll-smooth">
        <button
          onClick={() => setSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
            subTab === 'users'
              ? theme === 'bordo' ? 'bg-rose-900 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Usuários & Acessos ({usersList.length})</span>
        </button>

        <button
          onClick={() => setSubTab('brokers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
            subTab === 'brokers'
              ? theme === 'bordo' ? 'bg-rose-900 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Corretores & Equipes ({brokers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('developments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
            subTab === 'developments'
              ? theme === 'bordo' ? 'bg-rose-900 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Empreendimentos & Imóveis ({developments.length})</span>
        </button>

        <button
          onClick={() => setSubTab('origins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
            subTab === 'origins'
              ? theme === 'bordo' ? 'bg-rose-900 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Canais de Origem ({origins.length})</span>
        </button>
      </div>

      {/* SUBTAB 0: USERS & ACCESS MANAGEMENT */}
      {subTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Usuários e Permissões de Acesso
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cadastre e gerencie logins de corretores e administradores. Corretores visualizam apenas seus próprios clientes; administradores têm visão global.
              </p>
            </div>
            <button
              onClick={() => openNewUser()}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex-shrink-0 ${
                theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800 shadow-rose-950/20' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Login</span>
            </button>
          </div>

          {/* Master Admin Notice Banner */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">
                Administrador Master: <strong>{MASTER_ADMIN_EMAIL}</strong>
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed">
                Esta conta possui privilégio irrestrito de gestão sobre todos os corretores, leads, comissões e configurações da plataforma.
              </p>
            </div>
          </div>

          {/* Users Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersList.map((user) => {
              const isMaster = user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
              return (
                <div
                  key={user.uid}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 ${borderClass} space-y-4 hover:shadow-md transition-all relative flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isMaster || user.role === 'admin'
                            ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {user.displayName?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                              {user.displayName}
                            </h3>
                            {isMaster && (
                              <span title="Master Admin" className="text-amber-500">★</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.active !== false
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {user.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Nível de Acesso:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          isMaster || user.role === 'admin'
                            ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {isMaster ? 'Super Admin' : user.role === 'admin' ? 'Administrador' : 'Corretor (Restrito)'}
                        </span>
                      </div>

                      {user.role === 'broker' && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          <span className="text-slate-500">Corretor Vinculado:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {user.brokerName || user.displayName}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">Status da Senha:</span>
                        <span className={`text-[10px] font-semibold ${
                          user.mustChangePassword
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {user.mustChangePassword ? 'Padrão (Pendente troca)' : 'Senha Pessoal Ativa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isMaster && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        onClick={() => adminToggleUserStatus(user.uid, user.active === false ? true : false)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          user.active !== false
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {user.active !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>{user.active !== false ? 'Desativar' : 'Ativar'}</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'user', id: user.uid, name: user.displayName })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 1: BROKERS & TEAMS */}
      {subTab === 'brokers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Lista de Corretores Cadastrados</h2>
              <p className="text-xs text-slate-500">Membros da equipe com metas mensais de vendas e CRECI.</p>
            </div>
            <button
              onClick={openNewBroker}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer ${
                theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Corretor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brokers.map((broker) => (
              <div 
                key={broker.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 ${borderClass} space-y-4 hover:shadow-md transition-all relative group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                      theme === 'bordo' ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300' : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {broker.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{broker.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">CRECI: {broker.creci}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      broker.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {broker.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                      broker.isDuty 
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {broker.isDuty ? '⚡ Plantão Ativo' : 'Fora da Escala'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Equipe: <strong className="text-slate-800 dark:text-slate-200">{broker.team}</strong></span>
                  </div>
                  {broker.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{broker.phone}</span>
                    </div>
                  )}
                  {broker.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{broker.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Meta Mensal: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(broker.monthlyGoal)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openEditBroker(broker)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Editar Corretor"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, type: 'broker', id: broker.id, name: broker.name })}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Excluir Corretor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: DEVELOPMENTS & PROPERTIES */}
      {subTab === 'developments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Empreendimentos e Imóveis em Plantão</h2>
              <p className="text-xs text-slate-500">Lançamentos, unidades em estoque, construtoras e VGV estimado.</p>
            </div>
            <button
              onClick={openNewDev}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer ${
                theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Empreendimento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {developments.map((dev) => (
              <div
                key={dev.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 ${borderClass} space-y-4 hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{dev.name}</h3>
                    <p className="text-xs text-slate-500">{dev.developer} • {dev.type}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    dev.status === 'lancamento' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                    dev.status === 'obras' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {dev.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{dev.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unidades Disponíveis:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{dev.unitsAvailable} de {dev.unitsTotal}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Faixa de Preço:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{dev.priceRange}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>VGV Estimado:</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(dev.estimatedVGV)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openEditDev(dev)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, type: 'dev', id: dev.id, name: dev.name })}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ORIGINS */}
      {subTab === 'origins' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Canais de Captação & Origens de Leads</h2>
              <p className="text-xs text-slate-500">Mapeamento dos canais de marketing e visitas ao plantão.</p>
            </div>
            <button
              onClick={openNewOrigin}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer ${
                theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Canal de Origem</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {origins.map((origin) => (
              <div
                key={origin.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 ${borderClass} space-y-3 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{origin.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {origin.category}
                    </span>
                  </div>
                  {origin.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{origin.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ativo no CRM
                  </span>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, type: 'origin', id: origin.id, name: origin.name })}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: BROKER FORM */}
      {isBrokerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-2xl ${borderClass} shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBroker ? 'Editar Corretor' : 'Novo Corretor'}
              </h3>
              <button onClick={() => setIsBrokerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBroker} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={brokerForm.name || ''}
                  onChange={(e) => setBrokerForm({ ...brokerForm, name: e.target.value })}
                  placeholder="Ex: Joel Santana"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CRECI</label>
                  <input
                    type="text"
                    value={brokerForm.creci || ''}
                    onChange={(e) => setBrokerForm({ ...brokerForm, creci: e.target.value })}
                    placeholder="Ex: 123456-F"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Equipe / Squad</label>
                  <input
                    type="text"
                    value={brokerForm.team || ''}
                    onChange={(e) => setBrokerForm({ ...brokerForm, team: e.target.value })}
                    placeholder="Ex: Equipe Plantão Alpha"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={brokerForm.phone || ''}
                    onChange={(e) => setBrokerForm({ ...brokerForm, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Mensal (R$ VGV)</label>
                  <input
                    type="number"
                    value={brokerForm.monthlyGoal || 1200000}
                    onChange={(e) => setBrokerForm({ ...brokerForm, monthlyGoal: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  value={brokerForm.email || ''}
                  onChange={(e) => setBrokerForm({ ...brokerForm, email: e.target.value })}
                  placeholder="corretor@imobiliaria.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBrokerModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm ${
                    theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {editingBroker ? 'Atualizar Corretor' : 'Cadastrar Corretor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEVELOPMENT FORM */}
      {isDevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-2xl ${borderClass} shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingDev ? 'Editar Empreendimento' : 'Novo Empreendimento'}
              </h3>
              <button onClick={() => setIsDevModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDev} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Empreendimento *</label>
                <input
                  type="text"
                  required
                  value={devForm.name || ''}
                  onChange={(e) => setDevForm({ ...devForm, name: e.target.value })}
                  placeholder="Ex: Residencial Parque dos Pássaros"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Imóvel</label>
                  <select
                    value={devForm.type || 'Apartamento'}
                    onChange={(e) => setDevForm({ ...devForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Stúdio">Stúdio</option>
                    <option value="Cobertura">Cobertura</option>
                    <option value="Apartamento Duplex">Apartamento Duplex</option>
                    <option value="Apartamento Triplex">Apartamento Triplex</option>
                    <option value="Kitnet">Kitnet</option>
                    <option value="Loft">Loft</option>
                    <option value="Apartamento Padrão">Apartamento Padrão</option>
                    <option value="Casa">Casa</option>
                    <option value="Sobrado">Sobrado</option>
                    <option value="Casa em Condomínio">Casa em Condomínio</option>
                    <option value="Terreno em Condomínio">Terreno em Condomínio</option>
                    <option value="Chácara">Chácara</option>
                    <option value="Chácara em Condomínio">Chácara em Condomínio</option>
                    <option value="Sítio">Sítio</option>
                    <option value="Fazenda">Fazenda</option>
                    <option value="Galpão">Galpão</option>
                    <option value="Salão Comercial">Salão Comercial</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status da Obra</label>
                  <select
                    value={devForm.status || 'lancamento'}
                    onChange={(e) => setDevForm({ ...devForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="lancamento">Lançamento</option>
                    <option value="obras">Em Obras</option>
                    <option value="pronto">Pronto para Morar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Construtora / Incorporadora</label>
                  <input
                    type="text"
                    value={devForm.developer || ''}
                    onChange={(e) => setDevForm({ ...devForm, developer: e.target.value })}
                    placeholder="Ex: Construtora Aliança"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">VGV Estimado (R$)</label>
                  <input
                    type="number"
                    value={devForm.estimatedVGV || 20000000}
                    onChange={(e) => setDevForm({ ...devForm, estimatedVGV: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço / Localização do Plantão</label>
                <input
                  type="text"
                  value={devForm.address || ''}
                  onChange={(e) => setDevForm({ ...devForm, address: e.target.value })}
                  placeholder="Ex: Av. Brasil, 1500 - Centro"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDevModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm ${
                    theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {editingDev ? 'Atualizar Empreendimento' : 'Cadastrar Empreendimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORIGIN FORM */}
      {isOriginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-2xl ${borderClass} shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Novo Canal de Origem de Leads</h3>
              <button onClick={() => setIsOriginModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrigin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Canal / Origem *</label>
                <input
                  type="text"
                  required
                  value={originForm.name || ''}
                  onChange={(e) => setOriginForm({ ...originForm, name: e.target.value })}
                  placeholder="Ex: TikTok Ads / Outdoor / Parceria XP"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <select
                  value={originForm.category || 'digital'}
                  onChange={(e) => setOriginForm({ ...originForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="digital">Digital / Tráfego Pago / Redes</option>
                  <option value="presencial">Presencial / Plantão / Passante</option>
                  <option value="indicacao">Indicação de Clientes</option>
                  <option value="parceria">Parceria / Co-corretagem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={originForm.description || ''}
                  onChange={(e) => setOriginForm({ ...originForm, description: e.target.value })}
                  placeholder="Detalhes sobre este canal de captação..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOriginModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm ${
                    theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Salvar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: USER ACCESS FORM */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Cadastrar Usuário de Acesso
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {userCreationError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{userCreationError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Usuário *
                </label>
                <input
                  type="text"
                  required
                  value={userForm.displayName}
                  onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
                  placeholder="Ex: Carlos Silva"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="carlos.silva@imob.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Acesso
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="broker">Corretor (Restrito)</option>
                    <option value="admin">Administrador (Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vincular Corretor
                  </label>
                  <select
                    value={userForm.brokerName}
                    onChange={(e) => {
                      const sel = brokers.find(b => b.name === e.target.value);
                      setUserForm({
                        ...userForm,
                        brokerName: e.target.value,
                        brokerId: sel?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Mesmo Nome / Novo</option>
                    {brokers.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Senha Padrão Inicial
                </label>
                <input
                  type="text"
                  required
                  value={userForm.initialPassword}
                  onChange={(e) => setUserForm({ ...userForm, initialPassword: e.target.value })}
                  placeholder="Ex: Immo123!"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  O corretor poderá alterar esta senha no painel dele a qualquer momento.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={userCreationLoading}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm cursor-pointer disabled:opacity-50 ${
                    theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {userCreationLoading ? 'Criando...' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS SUCCESS MODAL (Shareable with broker) */}
      {createdCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Usuário Cadastrado com Sucesso!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Envie os dados de acesso abaixo para o usuário realizar seu primeiro login:
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nome:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{createdCredentialsModal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">E-mail (Login):</span>
                <span className="font-semibold text-rose-700 dark:text-rose-400 font-mono">{createdCredentialsModal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Senha Inicial:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{createdCredentialsModal.password}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nível de Acesso:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{createdCredentialsModal.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = `*ImmoFlow CRM - Dados de Acesso*\nOlá ${createdCredentialsModal.name},\nSeu acesso foi liberado:\n• *E-mail:* ${createdCredentialsModal.email}\n• *Senha Inicial:* ${createdCredentialsModal.password}\n\nVocê pode alterar a senha a qualquer momento no seu perfil.`;
                  navigator.clipboard.writeText(text);
                  setCopiedSuccess(true);
                  setTimeout(() => setCopiedSuccess(false), 2500);
                }}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSuccess ? 'Dados Copiados!' : 'Copiar para WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentialsModal(null)}
                className={`py-2.5 px-5 text-white font-semibold text-xs rounded-xl cursor-pointer ${
                  theme === 'bordo' ? 'bg-rose-900 hover:bg-rose-800' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (No window.confirm!) */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Confirmar Exclusão</h3>
              <p className="text-xs text-slate-500 mt-1">
                Deseja realmente remover <strong>{deleteConfirm.name}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, type: 'broker', id: '', name: '' })}
                className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
