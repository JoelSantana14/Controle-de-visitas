import React, { useState, useEffect } from 'react';
import { Building2, Users, Compass, Plus, Trash2, Check } from 'lucide-react';
import { BROKERS as INITIAL_BROKERS, DEVELOPMENTS as INITIAL_DEVELOPMENTS, ORIGINS as INITIAL_ORIGINS } from '../types';

export const BrokersPropertiesView: React.FC = () => {
  const [brokers, setBrokers] = useState<string[]>(() => {
    const saved = localStorage.getItem('immoflow_brokers');
    return saved ? JSON.parse(saved) : INITIAL_BROKERS;
  });

  const [developments, setDevelopments] = useState<string[]>(() => {
    const saved = localStorage.getItem('immoflow_developments');
    return saved ? JSON.parse(saved) : INITIAL_DEVELOPMENTS;
  });

  const [origins, setOrigins] = useState<string[]>(() => {
    const saved = localStorage.getItem('immoflow_origins');
    return saved ? JSON.parse(saved) : INITIAL_ORIGINS;
  });

  const [newBroker, setNewBroker] = useState('');
  const [newDevelopment, setNewDevelopment] = useState('');
  const [newOrigin, setNewOrigin] = useState('');

  useEffect(() => {
    localStorage.setItem('immoflow_brokers', JSON.stringify(brokers));
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem('immoflow_developments', JSON.stringify(developments));
  }, [developments]);

  useEffect(() => {
    localStorage.setItem('immoflow_origins', JSON.stringify(origins));
  }, [origins]);

  const addBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroker.trim() || brokers.includes(newBroker.trim())) return;
    setBrokers([...brokers, newBroker.trim()]);
    setNewBroker('');
  };

  const removeBroker = (name: string) => {
    if (confirm(`Remover corretor(a) ${name}?`)) {
      setBrokers(brokers.filter(b => b !== name));
    }
  };

  const addDevelopment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevelopment.trim() || developments.includes(newDevelopment.trim())) return;
    setDevelopments([...developments, newDevelopment.trim()]);
    setNewDevelopment('');
  };

  const removeDevelopment = (name: string) => {
    if (confirm(`Remover empreendimento ${name}?`)) {
      setDevelopments(developments.filter(d => d !== name));
    }
  };

  const addOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim() || origins.includes(newOrigin.trim())) return;
    setOrigins([...origins, newOrigin.trim()]);
    setNewOrigin('');
  };

  const removeOrigin = (name: string) => {
    if (confirm(`Remover origem ${name}?`)) {
      setOrigins(origins.filter(o => o !== name));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Painel de Cadastro: Corretores, Empreendimentos e Origens</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adicione ou remova corretores da equipe, empreendimentos/imóveis em plantão e canais de captação de leads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Brokers Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Equipe de Corretores</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full">
              {brokers.length} corretores
            </span>
          </div>

          <form onSubmit={addBroker} className="flex gap-2">
            <input
              type="text"
              value={newBroker}
              onChange={(e) => setNewBroker(e.target.value)}
              placeholder="Nome do Corretor..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>

          <div className="space-y-2 overflow-y-auto max-h-[300px] flex-1">
            {brokers.map((broker) => (
              <div key={broker} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{broker}</span>
                <button
                  onClick={() => removeBroker(broker)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Excluir Corretor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Developments Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Empreendimentos / Imóveis</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
              {developments.length} locais
            </span>
          </div>

          <form onSubmit={addDevelopment} className="flex gap-2">
            <input
              type="text"
              value={newDevelopment}
              onChange={(e) => setNewDevelopment(e.target.value)}
              placeholder="Nome do Empreendimento..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>

          <div className="space-y-2 overflow-y-auto max-h-[300px] flex-1">
            {developments.map((dev) => (
              <div key={dev} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dev}</span>
                <button
                  onClick={() => removeDevelopment(dev)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Excluir Empreendimento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Origins Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Origens de Leads</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full">
              {origins.length} canais
            </span>
          </div>

          <form onSubmit={addOrigin} className="flex gap-2">
            <input
              type="text"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              placeholder="Canal de Origem..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>

          <div className="space-y-2 overflow-y-auto max-h-[300px] flex-1">
            {origins.map((orig) => (
              <div key={orig} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{orig}</span>
                <button
                  onClick={() => removeOrigin(orig)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Excluir Origem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
