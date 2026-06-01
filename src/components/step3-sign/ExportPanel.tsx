import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { generatePdf } from '@/lib/pdfGenerator';
import { generateShortShareUrl } from '@/lib/shareLink';
import { storeShareData } from '@/lib/shareApi';
import { saveAgreement } from '@/db/database';
import { useNdaStore } from '@/stores/ndaStore';
import type { Agreement } from '@/types';
import { Download, Link, Copy, Check, Loader2 } from 'lucide-react';

export function ExportPanel() {
  const store = useNdaStore();
  const { showToast } = useToast();
  const docRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState(store.partyA?.email || '');

  const buildAgreementData = (): Agreement => ({
    id: store.agreementId ?? undefined,
    projectName: store.projectName,
    purpose: store.purpose,
    scope: store.scope,
    confidentialityPeriod: store.confidentialityPeriod,
    stage: store.stage,
    notes: store.notes,
    partyA: store.partyA!,
    partyB: store.partyB,
    signatureA: store.signatureA,
    signatureB: store.signatureB,
    signedDateA: store.signedDateA,
    signedDateB: store.signedDateB,
    status: store.signatureA ? 'awaiting_counterparty' : 'draft',
    shareToken: store.shareToken,
    pdfGenerated: false,
    notificationEmail: notificationEmail || store.partyA?.email,
  });

  const handleDownloadPdf = async () => {
    if (!store.signatureA) {
      showToast('请先签署您的签名', 'error');
      return;
    }

    const previewEl = document.querySelector('.nda-preview') as HTMLElement;
    if (!previewEl) {
      showToast('未找到协议预览内容', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const filename = `${store.projectName || '保密协议'}_${new Date().toISOString().slice(0, 10)}`;
      await generatePdf(previewEl, filename);

      // Update agreement with pdfGenerated flag
      const agreement = buildAgreementData();
      agreement.pdfGenerated = true;
      const id = await saveAgreement(agreement);
      store.setAgreementId(id);

      showToast('PDF已生成并下载');
    } catch (err) {
      showToast('PDF生成失败，请重试', 'error');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleGenerateLink = async () => {
    if (!store.signatureA) {
      showToast('请先签署您的签名', 'error');
      return;
    }

    setIsGeneratingLink(true);
    try {
      const agreement = buildAgreementData();
      const id = await saveAgreement(agreement);
      store.setAgreementId(id);

      const token = await storeShareData({
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
        notificationEmail: agreement.notificationEmail,
      });
      const url = generateShortShareUrl(token);

      await saveAgreement({ ...agreement, id, shareToken: token });

      setShareUrl(url);
      showToast('分享链接已生成');
    } catch (err) {
      showToast('生成分享链接失败，请重试', 'error');
      console.error(err);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <h3 className="section-title text-slate-900">导出与分享</h3>

      <div>
        <p className="text-sm text-slate-500 mb-3">下载签署后的NDA协议为PDF文件，保存至本地</p>
        <Button
          onClick={handleDownloadPdf}
          disabled={isGenerating || !store.signatureA}
          className="w-full flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              正在生成PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              下载PDF文件
            </>
          )}
        </Button>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <p className="text-sm text-slate-500 mb-3">
          生成独立签署链接，转发给乙方在线签署（无需对方注册登录）
        </p>
        <Input
          label="签署完成通知邮箱"
          type="email"
          placeholder="签署完成后PDF将发送至此邮箱"
          value={notificationEmail}
          onChange={(e) => setNotificationEmail(e.target.value)}
          className="mb-3"
        />
        <Button
          variant="secondary"
          onClick={handleGenerateLink}
          disabled={!store.signatureA || isGeneratingLink}
          className="w-full flex items-center justify-center gap-2 mb-3"
        >
          {isGeneratingLink ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              生成分享链接
            </>
          )}
        </Button>

        {shareUrl && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-slate-700 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                copied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-gold-500 bg-white border border-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        提示：甲方先签署后，将链接发送给乙方。乙方打开链接即可在线签署，无需下载任何软件。链接有效期为30天。
      </p>
    </div>
  );
}
