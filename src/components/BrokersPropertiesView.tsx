import React from 'react';
import { Building2, Users, Compass, ShieldCheck } from 'lucide-react';
import { BROKERS, DEVELOPMENTS, ORIGINS } from '../types';

export const BrokersPropertiesView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Equipe, Empreendimentos e Origens de Leads</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configuração de corretores cadastrados, empreendimentos ativos e canais de captação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Brokers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Corretores Ativos</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full">
              {BROKERS.length} corretores
            </span>
          </div>

          <div className="space-y-2">
            {BROKERS.map((broker) => (
              <div key={broker} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{broker}</span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Ativo no Plantão
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Developments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Empreendimentos & Imóveis</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
              {DEVELOPMENTS.length} locais
            </span>
          </div>

          <div className="space-y-2">
            {DEVELOPMENTS.map((dev) => (
              <div key={dev} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dev}</span>
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  Plantão Vendas
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Origins */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Origens de Leads</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full">
              {ORIGINS.length} canais
            </span>
          </div>

          <div className="space-y-2">
            {ORIGINS.map((orig) => (
              <div key={orig} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{orig}</span>
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                  Canal de Captação
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
