import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Loader2, ArrowRight } from 'lucide-react';
import { Lead, ThemeMode, BorderMode } from '../types';

interface AiAdvisorProps {
  leads: Lead[];
  theme?: ThemeMode;
  borderMode?: BorderMode;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ 
  leads,
  theme = 'bordo',
  borderMode = 'destacada'
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Olá! Sou o **CorretorIA**, seu gerente de vendas imobiliárias e especialista em funil de conversão. Posso analisar os leads em seu plantão, sugerir mensagens de WhatsApp para clientes com crédito condicionado ou pendente de documentos, e ajudar a alancar suas vendas. Como posso ajudar hoje?'
    }
  ]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          leadsSummary: leads.map(l => ({
            client: l.clientName,
            development: l.development,
            origin: l.origin,
            status: l.status,
            broker: l.brokerName,
            value: l.propertyValue
          }))
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages([...newMessages, { role: 'assistant', content: data.result }]);
    } catch (err: any) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: `Erro ao conectar com a IA: ${err.message || 'Verifique se a GEMINI_API_KEY está configurada.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Analisar gargalos do funil e sugerir melhorias de conversão',
    'Escrever mensagem de WhatsApp para leads com crédito condicionado',
    'Quais leads devo priorizar esta semana para fechar vendas?',
    'Resumo do desempenho dos corretores e origens mais rentáveis'
  ];

  const getHeaderGradient = () => {
    switch (theme) {
      case 'bordo': return 'from-rose-950 via-rose-900 to-rose-800';
      case 'azul': return 'from-blue-700 via-blue-800 to-indigo-900';
      case 'esmeralda': return 'from-emerald-800 via-emerald-900 to-teal-950';
      case 'dourado': return 'from-amber-700 via-amber-800 to-yellow-950';
    }
  };

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

  const getButtonBg = () => {
    switch (theme) {
      case 'bordo': return 'bg-rose-900 hover:bg-rose-800 text-white';
      case 'azul': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'esmeralda': return 'bg-emerald-700 hover:bg-emerald-800 text-white';
      case 'dourado': return 'bg-amber-600 hover:bg-amber-700 text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className={`bg-gradient-to-r ${getHeaderGradient()} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">CorretorIA - Assistente Imobiliário Inteligente</h2>
            <p className="text-xs text-rose-100/80">Inteligência artificial integrada para gestão de leads, crédito e fechamentos</p>
          </div>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={loading}
            className={`text-xs font-medium px-3.5 py-2 bg-white dark:bg-slate-900 ${borderMode === 'destacada' ? 'border-2 border-rose-200 dark:border-rose-900/40 hover:border-rose-500' : 'border border-slate-200 dark:border-slate-800 hover:border-rose-500'} text-slate-700 dark:text-slate-300 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer`}
          >
            <span>{qp}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${theme === 'bordo' ? 'text-rose-600' : 'text-blue-500'}`} />
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className={`bg-white dark:bg-slate-900 ${getContainerBorder()} rounded-2xl flex flex-col h-[550px]`}>
        
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' 
                  ? getButtonBg()
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? `${getButtonBg()} rounded-tr-xs`
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 rounded-tl-xs'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
              </div>
              <span>CorretorIA analisando dados do funil e preparando estratégias...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite sua dúvida ou pedido de estratégia para a IA..."
              className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white shadow-xs"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`px-5 py-2.5 ${getButtonBg()} disabled:opacity-50 font-medium text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer`}
            >
              <span>Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
