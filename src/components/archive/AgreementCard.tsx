import { useNavigate } from 'react-router-dom';
import type { Agreement } from '@/types';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface AgreementCardProps {
  agreement: Agreement;
}

const statusConfig = {
  draft: { label: '草稿', icon: Clock, className: 'bg-slate-100 text-slate-600' },
  awaiting_counterparty: { label: '待乙方签署', icon: AlertCircle, className: 'bg-amber-100 text-amber-700' },
  fully_signed: { label: '已完成', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700' },
};

export function AgreementCard({ agreement }: AgreementCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[agreement.status];
  const StatusIcon = status.icon;

  return (
    <button
      onClick={() => navigate(`/archive/${agreement.id}`)}
      className="card p-4 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gold-500 flex-shrink-0" />
          <h3 className="font-semibold text-slate-900 truncate">
            {agreement.projectName || '未命名项目'}
          </h3>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0 ml-2 ${status.className}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>
      <div className="text-sm text-slate-500 space-y-1">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="truncate max-w-full">甲方：{agreement.partyA?.name || '—'}</span>
          {agreement.partyB && <span className="truncate max-w-full">乙方：{agreement.partyB.name}</span>}
        </div>
        <div className="text-xs text-slate-400">
          {agreement.updatedAt
            ? `更新于 ${new Date(agreement.updatedAt).toLocaleDateString('zh-CN')}`
            : ''}
        </div>
      </div>
    </button>
  );
}
