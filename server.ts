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
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no ambiente.' });
      }

      const { prompt, leadsSummary } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `Você é o CorretorIA, um gerente de vendas imobiliárias sênior e especialista em CRM, funil de conversão, análise de crédito (aprovados, reprovados, condicionados), origens de leads, visitas ao plantão e fechamento de contratos. 
Analise os dados fornecidos e dê conselhos práticos, estratégias de conversão, mensagens personalizadas de WhatsApp para clientes ou insights para o corretor em português do Brasil, de forma clara, profissional e motivadora.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nContexto dos Leads/Vendas:\n${JSON.stringify(leadsSummary, null, 2)}\n\nSolicitação do Usuário:\n${prompt}` }] }
        ],
      });

      res.json({ result: response.text });
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
