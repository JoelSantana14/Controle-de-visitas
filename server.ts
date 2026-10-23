import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Gemini AI endpoint
  app.post('/api/ai-analyze', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { prompt, leadsSummary } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt não fornecido.' });
      }

      const systemInstruction = `Você é o CorretorIA, um gerente geral de vendas imobiliárias experiente, consultor sênior de crédito habitacional (SBPE, FGTS, Minha Casa Minha Vida) e estrategista de plantão de vendas.
Seu objetivo é analisar os dados dos leads, corretores, empreendimentos e origens de tráfego, oferecendo:
1. Diagnóstico do funil (taxa de conversão de leads para visitas, montagem de pastas e aprovação de crédito).
2. Estratégias práticas para destravar crédito condicionado (fiador, comprovação de renda informal, co-titular).
3. Scripts humanizados e prontos para envio no WhatsApp para cada situação de cliente.
4. Análise de ROI por canal de marketing e direcionamento tático para a equipe de corretores.
Responda sempre em português do Brasil com formatação elegante em Markdown, direto ao ponto e motivador.`;

      if (apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Try primary and fallback models from @google/genai
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
        let lastError = null;

        for (const model of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${systemInstruction}\n\nContexto dos Leads e Empreendimentos no CRM:\n${JSON.stringify(leadsSummary, null, 2)}\n\nSolicitação do Corretor / Gestor:\n${prompt}`,
                    },
                  ],
                },
              ],
            });

            if (response.text) {
              return res.json({ result: response.text });
            }
          } catch (modelErr: any) {
            console.warn(`Model ${model} falhou:`, modelErr.message || modelErr);
            lastError = modelErr;
          }
        }

        console.error('Todos os modelos remotos do Gemini falharam temporariamente:', lastError);
      }

      // Contextual local intelligence fallback if external API is temporarily unavailable or rate-limited
      const leads = Array.isArray(leadsSummary) ? leadsSummary : [];
      const total = leads.length;
      const visits = leads.filter((l: any) => l.status === 'visita_plantao').length;
      const pastas = leads.filter((l: any) => l.status === 'montagem_pasta').length;
      const condicionados = leads.filter((l: any) => l.status === 'credito_condicionado').length;
      const aprovados = leads.filter((l: any) => l.status === 'credito_aprovado').length;
      const vendas = leads.filter((l: any) => l.status === 'venda_realizada').length;

      let fallbackText = '';
      const promptLower = (prompt || '').toLowerCase();

      if (promptLower.includes('whatsapp') || promptLower.includes('mensagem')) {
        fallbackText = `### 📲 Modelos de Mensagens de WhatsApp para seus Clientes

**1. Para Lead com Crédito Condicionado:**
> "Olá, [Nome do Cliente]! Tudo bem? Aqui é o seu corretor do [Empreendimento]. Tenho uma excelente notícia: seu processo no banco avançou! Para liberarmos 100% da sua aprovação, o analista pediu apenas a complementação de [documento/comprovante]. Conseguimos enviar isso hoje para garantir as condições da tabela?"

**2. Confirmação de Visita ao Plantão:**
> "Olá [Nome do Cliente], tudo bem? Estamos te esperando hoje às [Horário] aqui no plantão do [Empreendimento]! O café já está pronto e separei a planta decorada que você mais gostou. Qualquer imprevisto me avise por aqui!"

**3. Follow-up de Crédito Aprovado:**
> "Parabéns, [Nome do Cliente]! Seu crédito imobiliário foi **100% APROVADO** pelo banco! A unidade [Unidade] está reservada para você. Quando podemos nos encontrar para assinar a proposta e garantir sua nova conquista?"`;
      } else if (promptLower.includes('gargalo') || promptLower.includes('funil') || promptLower.includes('convers')) {
        fallbackText = `### 📊 Diagnóstico do Funil de Vendas ImmoFlow

Analisando a base atual de **${total} leads**:
- **Visitas ao Plantão:** ${visits} clientes em atendimento presencial.
- **Pastas em Montagem:** ${pastas} clientes reunindo documentos.
- **Créditos Condicionados:** ${condicionados} processos travados aguardando documentação complementar.
- **Crédito Aprovado:** ${aprovados} clientes prontos para fechar contrato.
- **Vendas Realizadas:** ${vendas} fechamentos concretizados.

**💡 Ações Recomendadas para Destravar Vendas:**
1. **Prioridade Máxima nos Condicionados:** Entre em contato imediato com os ${condicionados} clientes com crédito condicionado. Solicite composição de renda com cônjuge/familiar ou extratos bancários atualizados.
2. **Aceleração da Montagem de Pastas:** Estabeleça um prazo de 48h para o recolhimento de RG, comprovante de residência e IRPF para enviar ao correspondente bancário.
3. **Foco no Fechamento dos Aprovados:** Agende reunião presencial com os clientes aprovados para assinatura imediata da proposta antes do fechamento do mês.`;
      } else {
        fallbackText = `### 🏢 Análise Estratégica do CorretorIA

Com base nos registros atuais do seu plantão:
- **Pipeline Ativo:** ${total} leads cadastrados com **${vendas} vendas concluídas** e **${aprovados} créditos prontos para contrato**.
- **Canal de Destaque:** Os canais digitais (Instagram Ads e Portais) são os que mais alimentam o início do funil.
- **Recomendação Tática:** O maior ganho financeiro imediato está em converter os clientes com **Crédito Aprovado (${aprovados})** e solucionar as pendências dos **Condicionados (${condicionados})**.

*Dica do Gestor:* Mantenha o checklist de documentos atualizado no ImmoFlow e registre cada contato no histórico para que nenhum lead esfrie no plantão!`;
      }

      res.json({ result: fallbackText });
    } catch (error: any) {
      console.error('Erro na API do Gemini:', error);
      res.status(500).json({ error: error.message || 'Erro ao processar IA' });
    }
  });

  // Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
