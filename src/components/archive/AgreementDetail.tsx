import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgreement, deleteAgreement, saveAgreement } from '@/db/database';
import { generatePdf } from '@/lib/pdfGenerator';
import { NdaDocument } from '@/components/step2-preview/NdaDocument';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useNdaStore } from '@/stores/ndaStore';
import type { Agreement } from '@/types';
import { ArrowLeft, Download, Edit, Trash2, Copy, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusConfig = {
  draft: { label: '草稿', icon: Clock, className: 'bg-slate-100 text-slate-600' },
  awaiting_counterparty: { label: '待乙方签署', icon: AlertCircle, className: 'bg-amber-100 text-amber-700' },
  fully_signed: { label: '已完成', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700' },
};

export function AgreementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const loadAgreement = useNdaStore((s) => s.loadAgreement);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      getAgreement(Number(id)).then((a) => {
        if (a) {
          setAgreement(a);
        } else {
          navigate('/archive');
        }
      });
    }
  }, [id, navigate]);

  const handleDownloadPdf = async () => {
    if (!agreement) return;
    const previewEl = document.querySelector('.nda-preview') as HTMLElement;
    if (!previewEl) {
      showToast('未找到协议内容', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const filename = `${agreement.projectName || '保密协议'}_${new Date().toISOString().slice(0, 10)}`;
      await generatePdf(previewEl, filename);
      await saveAgreement({ ...agreement, pdfGenerated: true });
      showToast('PDF已下载');
    } catch (err) {
      showToast('PDF生成失败', 'error');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReuse = () => {
    if (!agreement) return;
    loadAgreement(agreement);
    showToast('协议内容已加载，可重新编辑');
    navigate('/new');
  };

  const handleDelete = async () => {
    if (!agreement?.id || !confirm('确定要删除该协议吗？此操作不可撤销。')) return;
    await deleteAgreement(agreement.id);
    showToast('协议已删除');
    navigate('/archive');
  };

  if (!agreement) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const status = statusConfig[agreement.status];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/archive')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="page-title">{agreement.projectName || '保密协议'}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${status.className}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
              <span className="text-xs text-slate-400">
                创建于 {agreement.createdAt ? new Date(agreement.createdAt).toLocaleDateString('zh-CN') : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownloadPdf} disabled={isGenerating} className="flex items-center gap-2 text-sm">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </Button>
          <Button variant="secondary" onClick={handleReuse} className="flex items-center gap-2 text-sm">
            <Copy className="w-4 h-4" />
            复用
          </Button>
          <Button variant="ghost" onClick={handleDelete} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        <NdaDocument
          projectName={agreement.projectName}
          purpose={agreement.purpose}
          scope={agreement.scope}
          confidentialityPeriod={agreement.confidentialityPeriod}
          stage={agreement.stage}
          notes={agreement.notes}
          partyA={agreement.partyA}
          partyB={agreement.partyB}
          signatureA={agreement.signatureA}
          signatureB={agreement.signatureB}
          signedDateA={agreement.signedDateA}
          signedDateB={agreement.signedDateB}
        />
      </div>
    </div>
  );
}
