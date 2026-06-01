import { create } from 'zustand';
import type { Party, Agreement, AgreementFormData } from '@/types';

interface NdaState {
  step: 1 | 2;

  // Form data
  projectName: string;
  purpose: string;
  scope: string;
  confidentialityPeriod: string;
  stage: string;
  notes: string;

  // Parties
  partyA: Party | null;
  partyB: Party | null;

  // Signature
  signatureA: string | null;
  signatureB: string | null;
  signedDateA: string | null;
  signedDateB: string | null;

  // Working agreement ID
  agreementId: number | null;
  shareToken: string | null;

  // Actions
  setStep: (step: 1 | 2) => void;
  updateField: (field: keyof AgreementFormData, value: string) => void;
  setParty: (side: 'A' | 'B', party: Party) => void;
  setSignature: (side: 'A' | 'B', dataUrl: string) => void;
  setSignedDate: (side: 'A' | 'B') => void;
  setAgreementId: (id: number) => void;
  setShareToken: (token: string) => void;
  loadAgreement: (agreement: Agreement) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as const,
  projectName: '',
  purpose: '',
  scope: '',
  confidentialityPeriod: '2年',
  stage: 'NDA',
  notes: '',
  partyA: null,
  partyB: null,
  signatureA: null,
  signatureB: null,
  signedDateA: null,
  signedDateB: null,
  agreementId: null,
  shareToken: null,
};

export const useNdaStore = create<NdaState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  updateField: (field, value) => set({ [field]: value }),

  setParty: (side, party) =>
    set(side === 'A' ? { partyA: party } : { partyB: party }),

  setSignature: (side, dataUrl) => {
    const dateStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    set(
      side === 'A'
        ? { signatureA: dataUrl, signedDateA: dateStr }
        : { signatureB: dataUrl, signedDateB: dateStr }
    );
  },

  setSignedDate: (side) => {
    const dateStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    set(side === 'A' ? { signedDateA: dateStr } : { signedDateB: dateStr });
  },

  setAgreementId: (agreementId) => set({ agreementId }),
  setShareToken: (shareToken) => set({ shareToken }),

  loadAgreement: (agreement) =>
    set({
      projectName: agreement.projectName,
      purpose: agreement.purpose,
      scope: agreement.scope,
      confidentialityPeriod: agreement.confidentialityPeriod,
      stage: agreement.stage,
      notes: agreement.notes,
      partyA: agreement.partyA,
      partyB: agreement.partyB,
      signatureA: agreement.signatureA,
      signatureB: agreement.signatureB,
      signedDateA: agreement.signedDateA,
      signedDateB: agreement.signedDateB,
      agreementId: agreement.id ?? null,
      shareToken: agreement.shareToken,
      step: 1,
    }),

  reset: () => set({ ...initialState }),
}));
