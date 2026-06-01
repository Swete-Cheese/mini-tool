import type { Party, AgreementFormData } from '@/types';

interface TemplateData extends AgreementFormData {
  partyA: Party | null;
  partyB: Party | null;
}

export function generateNdaHtml(data: TemplateData): string {
  const { projectName, purpose, scope, confidentialityPeriod, stage, notes, partyA, partyB } = data;
  const scopeText = scope || `（1）项目背景、交易结构、商业计划及财务数据；
（2）客户资料、供应商信息、合同文本；
（3）技术资料、知识产权信息；
（4）双方就本项目进行的沟通内容、会议纪要；
（5）甲方明确标注为"保密"或乙方应当合理认知为保密信息的其他信息。`;

  const notesText = notes || '双方无特别约定。';

  return `
<div class="nda-document">
  <div class="text-center mb-10">
    <h1 class="text-2xl font-bold tracking-widest document-font text-slate-900">保 密 协 议</h1>
    <div class="w-16 h-px bg-gold-500 mx-auto mt-4"></div>
  </div>

  <div class="document-font text-[15px] leading-relaxed text-slate-800 space-y-5">
    <div class="party-info">
      <p class="mb-3"><strong>甲方（披露方）：</strong>${partyA?.name || '_______________'}</p>
      <p class="mb-1 indent-4">法定代表人/授权代表：${partyA?.contactPerson || '_______________'}</p>
      ${partyA?.title ? `<p class="mb-1 indent-4">职务：${partyA.title}</p>` : ''}
      ${partyA?.phone ? `<p class="mb-1 indent-4">联系电话：${partyA.phone}</p>` : ''}
    </div>

    <div class="party-info mt-6">
      <p class="mb-3"><strong>乙方（接收方）：</strong>${partyB?.name || '_______________'}</p>
      ${partyB?.email ? `<p class="mb-1 indent-4">邮箱：${partyB.email}</p>` : ''}
      ${partyB?.contactPerson && partyB.contactPerson !== partyB.name ? `<p class="mb-1 indent-4">法定代表人/授权代表：${partyB.contactPerson}</p>` : ''}
      ${partyB?.title ? `<p class="mb-1 indent-4">职务：${partyB.title}</p>` : ''}
      ${partyB?.phone ? `<p class="mb-1 indent-4">联系电话：${partyB.phone}</p>` : ''}
      ${partyB?.address ? `<p class="mb-1 indent-4">联系地址：${partyB.address}</p>` : ''}
    </div>

    <p class="mt-8 indent-8">
      鉴于甲乙双方就<strong>${projectName || '_______________'}</strong>（下称"本项目"）相关事宜进行沟通与合作，为明确双方的保密义务，经友好协商，达成如下协议：
    </p>

    <div class="mt-6">
      <h3 class="text-base font-bold mb-3">第一条&emsp;保密信息范围</h3>
      <p class="indent-8">本协议所称"保密信息"是指，甲方就本项目向乙方披露的、与本项目相关的一切非公开信息，包括但不限于：</p>
      <div class="indent-8 mt-1 whitespace-pre-line">${scopeText}</div>
    </div>

    <div class="mt-5">
      <h3 class="text-base font-bold mb-3">第二条&emsp;保密义务</h3>
      <p class="indent-8">2.1 乙方承诺对保密信息严格保密，未经甲方书面同意，不得向任何第三方披露、泄露或公开。</p>
      <p class="indent-8 mt-2">2.2 乙方仅可为评估本项目之目的使用保密信息，不得用于任何其他目的。</p>
      <p class="indent-8 mt-2">2.3 乙方应将保密信息的知悉范围严格限定于其内部为评估本项目而必须知悉的董事、高级管理人员及核心项目团队成员，并确保该等人员遵守与本协议同等严格的保密义务。</p>
    </div>

    <div class="mt-5">
      <h3 class="text-base font-bold mb-3">第三条&emsp;保密期限</h3>
      <p class="indent-8">本协议项下的保密义务自双方签署之日起生效，有效期为<strong>${confidentialityPeriod || '_______________'}</strong>。保密期限届满后，乙方仍应对保密信息承担永久保密义务，但保密信息已进入公共领域的除外。</p>
    </div>

    <div class="mt-5">
      <h3 class="text-base font-bold mb-3">第四条&emsp;项目阶段说明</h3>
      <p class="indent-8">本项目当前处于<strong>${stage || '_______________'}</strong>阶段。双方确认，本协议的签署不构成任何投资承诺或交易义务，双方均有权随时终止就本项目的进一步沟通。</p>
    </div>

    <div class="mt-5">
      <h3 class="text-base font-bold mb-3">第五条&emsp;特别约定</h3>
      <p class="indent-8">${notesText}</p>
    </div>

    <div class="mt-5">
      <h3 class="text-base font-bold mb-3">第六条&emsp;其他</h3>
      <p class="indent-8">6.1 本协议一式两份，甲乙双方各执一份，具有同等法律效力。</p>
      <p class="indent-8 mt-2">6.2 本协议自双方签署之日起生效。</p>
    </div>

    <div class="mt-12">
      <table class="w-full">
        <tr>
          <td class="w-1/2 pr-8 align-top">
            <p class="font-bold mb-4">甲方（盖章/签字）：</p>
            <div class="signature-area" data-signature-side="A" style="min-height:60px;"></div>
            <p class="mt-2 text-sm text-slate-500">日期：_______________</p>
          </td>
          <td class="w-1/2 pl-8 align-top">
            <p class="font-bold mb-4">乙方（盖章/签字）：</p>
            <div class="signature-area" data-signature-side="B" style="min-height:60px;"></div>
            <p class="mt-2 text-sm text-slate-500">日期：_______________</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
</div>`;
}
