export interface Party {
  id?: number;
  name: string;
  contactPerson: string;
  title: string;
  phone: string;
  email: string;
  address?: string;
  type: 'gp_investor' | 'listed_company' | 'lp_individual' | 'ma_advisor'
      | 'fa_advisor' | 'search_fund' | 'river_guide'
      | 'investor' | 'advisor' | 'company' | 'other';
  createdAt?: Date;
  updatedAt?: Date;
}

export type AgreementStatus = 'draft' | 'awaiting_counterparty' | 'fully_signed';

export interface Agreement {
  id?: number;
  projectName: string;
  purpose: string;
  scope: string;
  confidentialityPeriod: string;
  stage: string;
  notes: string;

  partyA: Party;
  partyB: Party | null;

  signatureA: string | null;
  signatureB: string | null;
  signedDateA: string | null;
  signedDateB: string | null;

  status: AgreementStatus;
  shareToken: string | null;
  pdfGenerated: boolean;
  notificationEmail?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface AgreementFormData {
  projectName: string;
  purpose: string;
  scope: string;
  confidentialityPeriod: string;
  stage: string;
  notes: string;
}

export const STAGE_OPTIONS = [
  '初步接洽',
  '项目评估',
  '尽职调查',
  '交易谈判',
  '投资协议阶段',
] as const;

export const PERIOD_OPTIONS = ['1年', '2年', '3年', '5年'] as const;

export const PARTY_TYPE_LABELS: Record<Party['type'], string> = {
  gp_investor: 'GP投资机构',
  listed_company: '上市公司',
  lp_individual: 'LP 个人',
  ma_advisor: 'M&A 并购顾问',
  fa_advisor: 'FA财务顾问',
  search_fund: 'Search Fund 搜索基金',
  river_guide: '河流向导（律师、会计师、银行）',
  investor: '投资机构',
  advisor: '财务顾问',
  company: '标的公司',
  other: '其他',
};
