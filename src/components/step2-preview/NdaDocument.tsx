import { forwardRef } from 'react';
import type { Party } from '@/types';
import { generateNdaHtml } from '@/lib/ndaTemplate';

interface NdaDocumentProps {
  projectName: string;
  purpose: string;
  scope: string;
  confidentialityPeriod: string;
  stage: string;
  notes: string;
  partyA: Party | null;
  partyB: Party | null;
  signatureA?: string | null;
  signatureB?: string | null;
  signedDateA?: string | null;
  signedDateB?: string | null;
}

export const NdaDocument = forwardRef<HTMLDivElement, NdaDocumentProps>(
  ({ signatureA, signatureB, signedDateA, signedDateB, ...data }, ref) => {
    const html = generateNdaHtml(data);

    // Post-process to inject signature images and dates
    const withSignatures = html
      .replace(
        '<div class="signature-area" data-signature-side="A" style="min-height:60px;"></div>',
        `<div class="signature-area" data-signature-side="A" style="min-height:60px;">${
          signatureA ? `<img src="${signatureA}" alt="甲方签名" style="max-height:55px; max-width:200px; display:block;" />` : ''
        }</div>`
      )
      .replace(
        '<div class="signature-area" data-signature-side="B" style="min-height:60px;"></div>',
        `<div class="signature-area" data-signature-side="B" style="min-height:60px;">${
          signatureB ? `<img src="${signatureB}" alt="乙方签名" style="max-height:55px; max-width:200px; display:block;" />` : ''
        }</div>`
      )
      .replace(
        '<p class="mt-2 text-sm text-slate-500">日期：_______________</p>',
        `<p class="mt-2 text-sm text-slate-500">日期：${signedDateA || '_______________'}</p>`
      )
      .replace(
        /<p class="mt-2 text-sm text-slate-500">日期：_______________<\/p>/,
        '' // will be used by the second occurrence through different approach
      );

    // More precise replacement for dates in the signature table
    const finalHtml = withSignatures.replace(
      /日期：_______________<\/p>\s*<\/td>\s*<td[^>]*>[\s\S]*?日期：_______________/,
      (_match) => {
        return _match
          .replace('日期：_______________', `日期：${signedDateA || '_______________'}`)
          .replace('日期：_______________', `日期：${signedDateB || '_______________'}`);
      }
    );

    return (
      <div
        ref={ref}
        className="nda-preview bg-white text-slate-900 p-4 sm:p-8 md:p-14 rounded-lg shadow-lg max-w-[210mm] mx-auto"
        style={{ minHeight: '297mm' }}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />
    );
  }
);

NdaDocument.displayName = 'NdaDocument';
