import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { decodeShareData, isShortToken } from '@/lib/shareLink';
import { retrieveShareData } from '@/lib/shareApi';
import { generatePdf, generatePdfDataUrl } from '@/lib/pdfGenerator';
import { NdaDocument } from '@/components/step2-preview/NdaDocument';
import { SignaturePad } from '@/components/step3-sign/SignaturePad';
import { CounterPartyForm } from '@/components/counter-party/CounterPartyForm';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Party, Agreement } from '@/types';
import { Shield, Download, CheckCircle, Loader2, AlertCircle, Mail } from 'lucide-react';
import type { ShareData } from '@/lib/shareLink';

export function CounterSignPage() {
  const { encoded } = useParams<{ encoded: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [partyB, setPartyB] = useState<Party | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [signedDate, setSignedDate] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const { showToast } = useToast();

  const notificationEmail = shareData?.notificationEmail || shareData?.agreement.partyA?.email || '';

  useEffect(() => {
    if (!encoded) {
      setError('无效的签署链接');
      return;
    }

    const loadData = async () => {
      let data: ShareData | null = null;

      if (isShortToken(encoded)) {
        data = await retrieveShareData(encoded);
      } else {
        data = decodeShareData(encoded);
      }

      if (!data) {
        setError('链接已失效或格式错误，请联系发起方重新发送');
        return;
      }
      setShareData(data);
    };

    loadData();
  }, [encoded]);

  const handlePartySubmit = (party: Party) => {
    setPartyB(party);
  };

  const handleSign = (dataUrl: string) => {
    setSignature(dataUrl);
    const dateStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    setSignedDate(dateStr);
  };

  const handleComplete = async () => {
    if (!partyB || !signature) {
      showToast('请填写信息并签名', 'error');
      return;
    }

    setIsDone(true);
    setIsSending(true);
    setSendError(null);

    if (!notificationEmail) {
      setSendError('未配置通知邮箱，请联系甲方手动发送');
      showToast('签署成功，但未配置通知邮箱', 'error');
      setIsSending(false);
      return;
    }

    const previewEl = document.querySelector('.nda-preview') as HTMLElement;
    if (!previewEl) {
      setSendError('PDF生成失败，请手动下载后发送');
      setIsSending(false);
      return;
    }

    try {
      const pdfDataUrl = await generatePdfDataUrl(previewEl);

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: notificationEmail,
          from_name: partyB.name,
          from_email: partyB.email,
          project_name: shareData?.agreement.projectName || '保密协议',
          pdf_data_url: pdfDataUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || '邮件发送失败');
      }

      setSendSuccess(true);
      showToast('签署完成，PDF已发送至甲方邮箱');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '邮件发送失败';
      setSendError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    const previewEl = document.querySelector('.nda-preview') as HTMLElement;
    if (!previewEl || !shareData) return;

    setIsGenerating(true);
    try {
      const filename = `${shareData.agreement.projectName || '保密协议'}_签署版_${new Date().toISOString().slice(0, 10)}`;
      await generatePdf(previewEl, filename);
      showToast('PDF已下载');
    } catch (err) {
      showToast('PDF生成失败', 'error');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">链接无效</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  const { agreement } = shareData;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <div className="bg-navy-900 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Shield className="w-6 h-6 text-gold-500 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">NDA保密协议在线签署</h1>
            <p className="text-xs text-slate-400 hidden sm:block">轻量化商务工具 · 极简签署流程</p>
          </div>
        </div>
        {!isDone && (
          <span className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
            待签署
          </span>
        )}
        {isDone && (
          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            签署完成
          </span>
        )}
      </div>

      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* NDA Document */}
          <div className="flex-1 overflow-auto">
            <NdaDocument
              projectName={agreement.projectName || ''}
              purpose={agreement.purpose || ''}
              scope={agreement.scope || ''}
              confidentialityPeriod={agreement.confidentialityPeriod || ''}
              stage={agreement.stage || ''}
              notes={agreement.notes || ''}
              partyA={agreement.partyA || null}
              partyB={partyB}
              signatureA={agreement.signatureA || null}
              signatureB={signature}
              signedDateA={agreement.signedDateA || null}
              signedDateB={signedDate}
            />
          </div>

          {/* Signing panel */}
          <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
            {!isDone ? (
              <>
                <div className="card p-6">
                  <CounterPartyForm initialData={shareData.agreement.partyB} onSubmit={handlePartySubmit} />
                </div>
                <div className="card p-6">
                  <SignaturePad value={signature} onChange={handleSign} label="乙方手写签名" />
                </div>
                <Button
                  onClick={handleComplete}
                  disabled={!partyB || !signature}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  确认签署
                </Button>
              </>
            ) : (
              <div className="card p-6 space-y-5">
                <div className="text-center">
                  {isSending ? (
                    <>
                      <Mail className="w-12 h-12 text-gold-500 mx-auto mb-3 animate-pulse" />
                      <h3 className="text-lg font-semibold text-slate-900">正在发送邮件...</h3>
                      <p className="text-sm text-slate-500 mt-1">正在生成完整PDF并发送至甲方邮箱</p>
                    </>
                  ) : sendSuccess ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900">签署完成</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        完整签署版PDF已发送至甲方邮箱，您也可下载PDF留存
                      </p>
                    </>
                  ) : sendError ? (
                    <>
                      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900">签署完成</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {sendError}，请手动下载PDF后发送给甲方
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900">签署完成</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        您已完成本保密协议的在线签署，可下载完整PDF留存
                      </p>
                    </>
                  )}
                </div>
                <Button
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      下载完整PDF
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-400">
        <p>本工具仅供商务洽谈参考使用，不具备正式法律强制效力</p>
      </div>
    </div>
  );
}
