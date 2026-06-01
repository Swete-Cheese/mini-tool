import LZString from 'lz-string';
import type { Agreement } from '@/types';

export interface ShareData {
  agreement: Partial<Agreement>;
  notificationEmail?: string;
}

export function encodeShareData(agreement: Agreement): string {
  const shareData: ShareData = {
    agreement: {
      id: agreement.id,
      projectName: agreement.projectName,
      purpose: agreement.purpose,
      scope: agreement.scope,
      confidentialityPeriod: agreement.confidentialityPeriod,
      stage: agreement.stage,
      notes: agreement.notes,
      partyA: agreement.partyA,
      partyB: agreement.partyB,
      signatureA: agreement.signatureA,
      signatureB: null,
      signedDateA: agreement.signedDateA,
      signedDateB: null,
      status: agreement.status,
      shareToken: null,
      pdfGenerated: false,
    },
    notificationEmail: agreement.notificationEmail || agreement.partyA?.email,
  };

  const json = JSON.stringify(shareData);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeShareData(encoded: string): ShareData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const data = JSON.parse(json);
    return data as ShareData;
  } catch {
    return null;
  }
}

export function generateShareUrl(encoded: string): string {
  const { origin } = window.location;
  const base = import.meta.env.BASE_URL || '/';
  return `${origin}${base}#/sign/${encoded}`;
}

export function generateShortShareUrl(token: string): string {
  const { origin } = window.location;
  const base = import.meta.env.BASE_URL || '/';
  return `${origin}${base}#/sign/${token}`;
}

/** Detect if a sign param is a short token (new API) or old-style encoded data */
export function isShortToken(param: string): boolean {
  return param.length <= 12;
}
