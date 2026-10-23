import React, { useState } from 'react';
import { CheckSquare, Plus, Calendar, User, Clock, AlertCircle, CheckCircle2, Trash2, Edit3, X, Check, Filter } from 'lucide-react';
import { TaskItem, TaskPriority, TaskStatus, ThemeMode, BorderMode } from '../types';

interface TaskManagerProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  availableBrokers: string[];
  availableClients?: string[];
  theme?: ThemeMode;
  borderMode?: BorderMode;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  setTasks,
  availableBrokers,
  availableClients = [],
  theme = 'bordo',
  borderMode = 'destacada'
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBroker, setFilterBroker] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [taskForm, setTaskForm] = useState<Partial<TaskItem>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().slice(0, 10),
    priority: 'media',
    status: 'pendente',
    assignedTo: availableBrokers[0] || 'Corretor Geral',
    relatedClient: '',
  });

  const openNewTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      dueDate: new Date().toISOString().slice(0, 10),
      priority: 'media',
      status: 'pendente',
      assignedTo: availableBrokers[0] || 'Corretor Geral',
      relatedClient: '',
    });
    setIsModalOpen(true);
  };

  const openEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setTaskForm(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title?.trim()) return;

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskForm } as TaskItem : t));
    } else {
      const newTask: TaskItem = {
        id: `t-${Date.now()}`,
        title: taskForm.title.trim(),
        description: taskForm.description || '',
        dueDate: taskForm.dueDate || new Date().toISOString().slice(0, 10),
        priority: (taskForm.priority as TaskPriority) || 'media',
        status: (taskForm.status as TaskStatus) || 'pendente',
        assignedTo: taskForm.assignedTo || availableBrokers[0] || 'Geral',
        relatedClient: taskForm.relatedClient || '',
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus: TaskStatus = t.status === 'pendente' ? 'em_andamento' : t.status === 'em_andamento' ? 'concluido' : 'pendente';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterBroker !== 'all' && task.assignedTo !== filterBroker) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const getContainerBorder = () => {
    if (borderMode === 'destacada') {
      switch (theme) {
        case 'bordo': return 'border-2 border-rose-300 dark:border-rose-900/60 shadow-md';
        case 'azul': return 'border-2 border-blue-300 dark:border-blue-900/60 shadow-md';
        case 'esmeralda': return 'border-2 border-emerald-300 dark:border-emerald-900/60 shadow-md';
        case 'dourado': return 'border-2 border-amber-300 dark:border-amber-900/60 shadow-md';
      }
    }
    return 'border border-slate-200 dark:border-slate-800 shadow-sm';
  };

  const getThemeButtonBg = () => {
    switch (theme) {
      case 'bordo': return 'bg-rose-900 hover:bg-rose-800 text-white';
      case 'azul': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'esmeralda': return 'bg-emerald-700 hover:bg-emerald-800 text-white';
      case 'dourado': return 'bg-amber-600 hover:bg-amber-700 text-white';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header & Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl text-white ${
        theme === 'bordo' 
          ? 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 shadow-xl shadow-rose-950/20' 
          : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 shadow-xl shadow-blue-500/10'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-rose-200" />
              <span>Produtividade & Operacional</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Gerenciador de Tarefas
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Organize follow-ups, prazos de documentação, simulações de financiamento e tarefas diárias da equipe imobiliária.
            </p>
          </div>

          <button
            onClick={openNewTask}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer self-start"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 ${getContainerBorder()} space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filtros de Tarefas</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredTasks.length} de {tasks.length} tarefas exibidas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
            <select
              value={filterBroker}
              onChange={(e) => setFilterBroker(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="all">Todos os Corretores</option>
              {availableBrokers.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Nenhuma tarefa encontrada com estes filtros.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'concluido';
            return (
              <div 
                key={task.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 ${getContainerBorder()} space-y-3 transition-all flex flex-col justify-between ${isCompleted ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/40' : ''}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(task.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border cursor-pointer transition-colors ${
                          isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <h3 className={`font-bold text-sm text-slate-900 dark:text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h3>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      task.priority === 'alta' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      task.priority === 'media' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7">{task.description}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 pl-7 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Resp: <strong className="text-slate-700 dark:text-slate-300">{task.assignedTo}</strong></span>
                  </div>

                  {task.relatedClient && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-400">
                        Cliente: {task.relatedClient}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Prazo: {task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTask(task)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-2xl ${getContainerBorder()} shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Ex: Ligar para confirmar documentação"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Detalhes ou instruções da tarefa..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                  <select
                    value={taskForm.assignedTo || availableBrokers[0]}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {availableBrokers.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Data Limite (Prazo)</label>
                  <input
                    type="date"
                    value={taskForm.dueDate || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={taskForm.priority || 'media'}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={taskForm.status || 'pendente'}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente Relacionado (Opcional)</label>
                <input
                  type="text"
                  value={taskForm.relatedClient || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, relatedClient: e.target.value })}
                  placeholder="Ex: Roberto Carlos"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm ${getThemeButtonBg()}`}
                >
                  {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
