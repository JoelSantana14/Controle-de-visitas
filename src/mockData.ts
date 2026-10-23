import { Lead } from './types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    clientName: 'Ricardo Alcantara',
    clientPhone: '(11) 98765-4321',
    clientEmail: 'ricardo.alcantara@email.com',
    brokerName: 'Carlos Silva',
    development: 'Residencial Vista Verde',
    origin: 'Instagram Ads',
    status: 'lead',
    propertyUnit: 'Apto 102B',
    propertyValue: 420000,
    commissionRate: 5,
    notes: 'Interessado em unidades de 2 dormitórios com suíte e vaga dupla. Pretende financiamento.',
    pastaStatus: 'incompleta',
    creditStatus: 'em_atendimento',
    nextAction: 'Enviar tabela de preços e ligar amanhã',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
    documents: [
      { id: 'doc-1', name: 'RG / CPF', status: 'pendente' },
      { id: 'doc-2', name: 'Comprovante de Renda', status: 'pendente' },
      { id: 'doc-3', name: 'Imposto de Renda', status: 'pendente' },
    ],
    attendanceRecords: [
      {
        id: 'ar-1',
        date: '18/10/2026 10:00',
        contactType: 'whatsapp',
        summary: 'Primeiro contato via anúncio Instagram. Demonstrou interesse em Apto 2 dorms.',
        nextAction: 'Enviar tabela de preços e ligar amanhã',
        userName: 'Carlos Silva'
      }
    ],
    history: [
      { id: 'h-1', date: '2026-10-18 10:00', action: 'Lead criado via Instagram Ads', user: 'Carlos Silva' }
    ]
  },
  {
    id: 'lead-2',
    clientName: 'Camila Ribeiro',
    clientPhone: '(11) 97123-8899',
    clientEmail: 'camila.ribeiro@email.com',
    brokerName: 'Ana Souza',
    development: 'Torre Metrópole',
    origin: 'Portal ZAP / VivaReal',
    status: 'visita_plantao',
    propertyUnit: 'Apto 504',
    propertyValue: 580000,
    commissionRate: 5.5,
    visitDate: '2026-10-22T15:30',
    notes: 'Confirmou visita ao plantão hoje às 15:30. Acompanhada do cônjuge.',
    pastaStatus: 'incompleta',
    creditStatus: 'visita',
    nextAction: 'Aguardar visita às 15:30 no plantão',
    createdAt: '2026-10-16T14:20:00Z',
    updatedAt: '2026-10-20T09:15:00Z',
    documents: [
      { id: 'doc-1', name: 'RG / CPF', status: 'enviado' },
      { id: 'doc-2', name: 'Comprovante de Renda', status: 'pendente' },
      { id: 'doc-3', name: 'Imposto de Renda', status: 'pendente' },
    ],
    attendanceRecords: [
      {
        id: 'ar-1',
        date: '16/10/2026 14:20',
        contactType: 'ligacao',
        summary: 'Ligação realizada. Apresentado o empreendimento e agendada visita ao plantão.',
        nextAction: 'Aguardar visita às 15:30',
        userName: 'Ana Souza'
      }
    ],
    history: [
      { id: 'h-1', date: '2026-10-16 14:20', action: 'Lead criado via Portal ZAP', user: 'Ana Souza' },
      { id: 'h-2', date: '2026-10-20 09:15', action: 'Visita ao plantão agendada para 22/10', user: 'Ana Souza' }
    ]
  },
  {
    id: 'lead-3',
    clientName: 'Bruno Henrique Souza',
    clientPhone: '(11) 96543-1122',
    clientEmail: 'bruno.hs@email.com',
    brokerName: 'Juliana Castro',
    development: 'Condomínio Horizon',
    origin: 'Indicação de Cliente',
    status: 'montagem_pasta',
    propertyUnit: 'Casa 14',
    propertyValue: 890000,
    commissionRate: 6,
    visitDate: '2026-10-14T11:00',
    notes: 'Visita realizada com sucesso. Gostou da planta garden. Montando pasta para aprovação de crédito SBPE.',
    pastaStatus: 'completa',
    creditStatus: 'em_atendimento',
    nextAction: 'Protocolar na mesa de crédito do banco',
    createdAt: '2026-10-12T08:30:00Z',
    updatedAt: '2026-10-19T16:40:00Z',
    documents: [
      { id: 'doc-1', name: 'RG / CPF', status: 'aprovado' },
      { id: 'doc-2', name: 'Comprovante de Renda', status: 'aprovado' },
      { id: 'doc-3', name: 'Imposto de Renda', status: 'enviado' },
    ],
    attendanceRecords: [
      {
        id: 'ar-1',
        date: '14/10/2026 11:00',
        contactType: 'presencial',
        summary: 'Visita presencial no stand realizada com sucesso. Cliente demonstrou forte interesse.',
        nextAction: 'Coletar comprovante de renda atualizado',
        userName: 'Juliana Castro'
      },
      {
        id: 'ar-2',
        date: '19/10/2026 16:40',
        contactType: 'whatsapp',
        summary: 'Recebimento de documentos por WhatsApp. Montagem de pasta 100% concluída.',
        nextAction: 'Protocolar na mesa de crédito',
        userName: 'Juliana Castro'
      }
    ],
    history: [
      { id: 'h-1', date: '2026-10-12 08:30', action: 'Lead criado via Indicação', user: 'Juliana Castro' },
      { id: 'h-2', date: '2026-10-19 16:40', action: 'Pasta de documentação em montagem', user: 'Juliana Castro' }
    ]
  },
  {
    id: 'lead-4',
    clientName: 'Mariana Duarte',
    clientPhone: '(11) 99888-7766',
    clientEmail: 'mariana.duarte@email.com',
    brokerName: 'Marcos Vinícius',
    development: 'Residencial Jardins do Sul',
    origin: 'Facebook Ads',
    status: 'credito_condicionado',
    propertyUnit: 'Apto 81',
    propertyValue: 350000,
    commissionRate: 5,
    visitDate: '2026-10-10T14:00',
    notes: 'Banco solicitou comprovação de renda complementar ou inclusão de comprador para aprovação total.',
    pastaStatus: 'completa',
    creditStatus: 'condicionado',
    rejectionReason: 'comprometimento_renda',
    rejectionDetails: 'Comprometimento de renda ultrapassou o teto de 30% da renda familiar bruta informada.',
    nextAction: 'Apresentar opção de composição de renda com segundo proponente.',
    createdAt: '2026-10-08T11:15:00Z',
    updatedAt: '2026-10-21T11:20:00Z',
    documents: [
      { id: 'doc-1', name: 'RG / CPF', status: 'aprovado' },
      { id: 'doc-2', name: 'Extratos Bancários', status: 'pendente' },
      { id: 'doc-3', name: 'Imposto de Renda', status: 'aprovado' },
    ],
    attendanceRecords: [
      {
        id: 'ar-1',
        date: '21/10/2026 11:20',
        contactType: 'email',
        summary: 'Retorno da análise de crédito bancária apontando Crédito Condicionado por comprometimento de renda.',
        nextAction: 'Apresentar opção de composição de renda para o cliente',
        userName: 'Marcos Vinícius'
      }
    ],
    history: [
      { id: 'h-1', date: '2026-10-08 11:15', action: 'Lead criado via Facebook Ads', user: 'Marcos Vinícius' },
      { id: 'h-2', date: '2026-10-21 11:20', action: 'Análise de crédito retornou Condicionada', user: 'Marcos Vinícius' }
    ]
  },
  {
    id: 'lead-5',
    clientName: 'Fernando Costa',
    clientPhone: '(11) 94433-2211',
    clientEmail: 'fernando.costa@email.com',
    brokerName: 'Roberto Mendes',
    development: 'Edifício Grand Palais',
    origin: 'Passante / Plantão',
    status: 'credito_reprovado',
    propertyUnit: 'Cobertura 1201',
    propertyValue: 1250000,
    commissionRate: 6,
    visitDate: '2026-10-05T16:00',
    notes: 'Restrição no CPF impediu a aprovação do financiamento imobiliário neste momento.',
    pastaStatus: 'completa',
    creditStatus: 'reprovado',
    rejectionReason: 'spc_serasa',
    rejectionDetails: 'Apontamento ativo no SPC e Serasa referente a protesto bancário.',
    nextAction: 'Aguardar regularização do CPF para nova consulta em 60 dias.',
    createdAt: '2026-10-05T16:00:00Z',
    updatedAt: '2026-10-15T14:10:00Z',
    documents: [
      { id: 'doc-1', name: 'RG / CPF', status: 'aprovado' },
      { id: 'doc-2', name: 'Comprovante de Renda', status: 'aprovado' },
      { id: 'doc-3', name: 'Consulta SPC/Serasa', status: 'pendente' },
    ],
    attendanceRecords: [
      {
        id: 'ar-1',
        date: '15/10/2026 14:10',
        contactType: 'ligacao',
        summary: 'Informado sobre restrição creditícia apontada no SPC e Serasa pelo banco.',
        nextAction: 'Orientar cliente sobre regularização e manter contato mensal',
        userName: 'Roberto Mendes'
      }
    ],
    history: [
      { id: 'h-1', date: '2026-10-05 16:00', action: 'Passante no Plantão', user: 'Roberto Mendes' },
      { id: 'h-2', date: '2026-10-15 14:10', action: 'Crédito Reprovado pelo banco', user: 'Roberto Mendes' }
    ]
  },
  {
    id: 'lead-6',
    clientName: 'Patrícia Nogueira',
    clientPhone: '(11) 93322-5544',
    clientEmail: 'patricia.nogueira@email.com',
    brokerName: 'Ana Souza',
    development: 'Residencial Vista Verde',
    origin: 'Google Search',
    status: 'credito_aprovado',
    propertyUnit: 'Apto 310A',
    propertyValue: 460000,
    commissionRate: 5,
    visitDate: '2026-10-02T10:00',
    notes: 'Crédito 100% aprovado pela Caixa Econômica Federal (SBPE). Pronto para assinatura do contrato.',
    pastaStatus: 'completa',
    creditStatus: 'aprovado',
    nextAction: 'Agendar assinatura do contrato com o banco.',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-20T17:00:00Z',
    documents: [
      { id: 'doc-1', name: 'RG / CPF', status: 'aprovado' },
      { id: 'doc-2', name: 'Comprovante de Renda', status: 'aprovado' },
      { id: 'doc-3', name: 'Avaliação do Imóvel', status: 'aprovado' },
    ],
    attendanceRecords: [
      {
        id: 'ar-1',
        date: '20/10/2026 17:00',
        contactType: 'whatsapp',
        summary: 'Notificação de crédito 100% Aprovado pela Caixa Econômica Federal.',
        nextAction: 'Marcar assinatura do contrato',
        userName: 'Ana Souza'
      }
    ],
    history: [
      { id: 'h-1', date: '2026-09-28 09:00', action: 'Lead criado via Google Search', user: 'Ana Souza' },
      { id: 'h-2', date: '2026-10-20 17:00', action: 'Crédito Aprovado pelo Banco', user: 'Ana Souza' }
    ]
  },
  {
    id: 'lead-7',
    clientName: 'Lucas Eduardo Martins',
    clientPhone: '(11) 91122-3344',
    clientEmail: 'lucas.martins@email.com',
    brokerName: 'Carlos Silva',
    development: 'Vila Bella Park',
    origin: 'Parceria Corretor',
    status: 'venda_realizada',
    propertyUnit: 'Casa 08',
    propertyValue: 620000,
    commissionRate: 6,
    visitDate: '2026-09-15T14:30',
    notes: 'Contrato assinado e registrado! Venda concluída com sucesso.',
    pastaStatus: 'completa',
    creditStatus: 'aprovado',
    nextAction: 'Acompanhar entrega de chaves e vistoria.',
    createdAt: '2026-09-10T11:00:00Z',
    updatedAt: '2026-10-10T12:00:00Z',
    documents: [
      { id: 'doc-1', name: 'Contrato Assinado', status: 'aprovado' },
      { id: 'doc-2', name: 'ITBI Pago', status: 'aprovado' },
      { id: 'doc-3', name: 'Registro de Imóveis', status: 'aprovado' },
    ],
    attendanceRecords: [
      {
        id: 'ar-1',
        date: '10/10/2026 12:00',
        contactType: 'presencial',
        summary: 'Assinatura de contrato concluída com sucesso no cartório.',
        nextAction: 'Acompanhar vistoria final',
        userName: 'Carlos Silva'
      }
    ],
    history: [
      { id: 'h-1', date: '2026-09-10 11:00', action: 'Lead criado via Parceria', user: 'Carlos Silva' },
      { id: 'h-2', date: '2026-10-10 12:00', action: 'Venda Realizada e Contrato Assinado', user: 'Carlos Silva' }
    ]
  }
];
