import { Lead, BrokerItem, DistributionRule, DistributionSettings, DistributionLog } from '../types';

export interface DistributionResult {
  success: boolean;
  assignedBroker?: BrokerItem;
  ruleApplied?: DistributionRule;
  ruleName: string;
  mode: 'automatico' | 'manual';
  reason: string;
}

/**
 * Core engine for distributing leads to on-duty brokers based on rules and configuration
 */
export function distributeLead(
  lead: Partial<Lead>,
  brokers: BrokerItem[],
  rules: DistributionRule[],
  settings: DistributionSettings
): DistributionResult {
  // 1. Identify active duty brokers
  const allActiveDutyBrokers = brokers.filter(
    b => b.active && b.isDuty && b.dutyStatus !== 'offline'
  );

  if (allActiveDutyBrokers.length === 0) {
    return {
      success: false,
      ruleName: 'Sem plantonistas',
      mode: 'automatico',
      reason: 'Não há corretores com plantão ativo e disponível no momento.',
    };
  }

  // 2. Filter out overloaded brokers if preventOverload is on
  let eligibleDutyBrokers = allActiveDutyBrokers;
  if (settings.preventOverload) {
    const underLimitBrokers = allActiveDutyBrokers.filter(
      b => (b.leadsReceivedToday || 0) < (b.maxLeadsPerDay || 10)
    );
    if (underLimitBrokers.length > 0) {
      eligibleDutyBrokers = underLimitBrokers;
    }
  }

  // 3. Evaluate matching rules ordered by priority (lower number = higher priority)
  const activeRules = [...rules]
    .filter(r => r.active)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of activeRules) {
    // Check development filter
    if (rule.targetDevelopment && rule.targetDevelopment.trim() !== '') {
      if (lead.development !== rule.targetDevelopment) continue;
    }

    // Check origin filter
    if (rule.targetOrigin && rule.targetOrigin.trim() !== '') {
      if (lead.origin !== rule.targetOrigin) continue;
    }

    // Check minimum value
    if (typeof rule.minValue === 'number' && rule.minValue > 0) {
      if ((lead.propertyValue || 0) < rule.minValue) continue;
    }

    // Check maximum value
    if (typeof rule.maxValue === 'number' && rule.maxValue > 0) {
      if ((lead.propertyValue || 0) > rule.maxValue) continue;
    }

    // Determine candidates for this rule
    let candidates: BrokerItem[] = [];
    if (rule.eligibleBrokerIds && rule.eligibleBrokerIds.length > 0) {
      candidates = eligibleDutyBrokers.filter(b => rule.eligibleBrokerIds.includes(b.id));
      // If eligible brokers are not on duty, check if they are in allActiveDutyBrokers
      if (candidates.length === 0) {
        candidates = allActiveDutyBrokers.filter(b => rule.eligibleBrokerIds.includes(b.id));
      }
    } else {
      // Rule applies to all available duty brokers
      candidates = eligibleDutyBrokers;
    }

    if (candidates.length > 0) {
      const selectedBroker = pickBrokerByStrategy(candidates, rule.strategy || settings.defaultStrategy);
      return {
        success: true,
        assignedBroker: selectedBroker,
        ruleApplied: rule,
        ruleName: rule.name,
        mode: 'automatico',
        reason: `Roteado pela regra: "${rule.name}" (${rule.strategy === 'least_loaded' ? 'Menor Carga' : 'Roleta'})`,
      };
    }
  }

  // 4. Default Fallback Roleta
  const fallbackBroker = pickBrokerByStrategy(eligibleDutyBrokers, settings.defaultStrategy);
  return {
    success: true,
    assignedBroker: fallbackBroker,
    ruleName: 'Roleta Geral de Plantão',
    mode: 'automatico',
    reason: `Roteado pela Roleta Geral (${settings.defaultStrategy === 'least_loaded' ? 'Menor Carga' : 'Ordem Circular'})`,
  };
}

/**
 * Strategy selector: Round Robin or Least Loaded
 */
export function pickBrokerByStrategy(
  candidates: BrokerItem[],
  strategy: 'round_robin' | 'least_loaded'
): BrokerItem {
  if (candidates.length === 1) return candidates[0];

  if (strategy === 'least_loaded') {
    // Pick the one with fewest leads received today
    const sorted = [...candidates].sort((a, b) => {
      const leadsA = a.leadsReceivedToday || 0;
      const leadsB = b.leadsReceivedToday || 0;
      if (leadsA !== leadsB) return leadsA - leadsB;
      // Tie breaker: last assigned at
      const timeA = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
      const timeB = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
      return timeA - timeB;
    });
    return sorted[0];
  }

  // Round robin: Pick broker with the oldest assignment time or lowest dutyOrder
  const sorted = [...candidates].sort((a, b) => {
    const timeA = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
    const timeB = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    return (a.dutyOrder || 0) - (b.dutyOrder || 0);
  });

  return sorted[0];
}

/**
 * Create a distribution log entry
 */
export function createDistributionLog(
  lead: Lead,
  broker: BrokerItem,
  mode: 'automatico' | 'manual',
  ruleName: string,
  ruleId?: string
): DistributionLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    leadId: lead.id,
    leadName: lead.clientName,
    clientPhone: lead.clientPhone,
    brokerId: broker.id,
    brokerName: broker.name,
    mode,
    ruleId,
    ruleName,
    timestamp: new Date().toLocaleString('pt-BR'),
    development: lead.development,
    origin: lead.origin,
  };
}

/**
 * Build WhatsApp direct notification link
 */
export function buildBrokerNotificationUrl(broker: BrokerItem, lead: Partial<Lead>): string {
  const cleanPhone = (broker.phone || '').replace(/\D/g, '');
  if (!cleanPhone) return '';

  const fullNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const message = `*NOVO LEAD ATRIBUÍDO NO IMMOFLOW CRM* 🚀\n\n` +
    `Olá *${broker.name}*, um novo lead foi direcionado para você!\n\n` +
    `👤 *Cliente:* ${lead.clientName || 'Lead'}\n` +
    `📱 *WhatsApp:* ${lead.clientPhone || 'Não informado'}\n` +
    `🏢 *Empreendimento:* ${lead.development || 'Geral'}\n` +
    `📍 *Origem:* ${lead.origin || 'Plantão'}\n` +
    `💰 *Interesse:* R$ ${Number(lead.propertyValue || 0).toLocaleString('pt-BR')}\n\n` +
    `_Acesse o ImmoFlow CRM para iniciar o atendimento agora mesmo!_`;

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}
