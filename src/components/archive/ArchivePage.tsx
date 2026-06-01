import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgreementCard } from './AgreementCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { getAllAgreements, searchAgreements } from '@/db/database';
import type { Agreement } from '@/types';
import { Search, Plus, FileText } from 'lucide-react';

type FilterStatus = 'all' | Agreement['status'];

export function ArchivePage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const navigate = useNavigate();

  const loadAgreements = async () => {
    let results: Agreement[];
    if (searchQuery.trim()) {
      results = await searchAgreements(searchQuery);
    } else {
      results = await getAllAgreements();
    }
    if (statusFilter !== 'all') {
      results = results.filter((a) => a.status === statusFilter);
    }
    setAgreements(results);
  };

  useEffect(() => {
    loadAgreements();
  }, [searchQuery, statusFilter]);

  const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'draft', label: '草稿' },
    { value: 'awaiting_counterparty', label: '待签署' },
    { value: 'fully_signed', label: '已完成' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-title mb-1">历史协议存档</h2>
          <p className="text-slate-400 text-sm">所有已生成和已签署的NDA协议，支持快速查阅和二次复用</p>
        </div>
        <Button onClick={() => navigate('/new')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建NDA
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="搜索项目名称或机构名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-navy-800 rounded-lg p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === tab.value
                  ? 'bg-gold-500 text-navy-900 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {agreements.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-16 h-16" />}
          title="暂无协议记录"
          description={searchQuery || statusFilter !== 'all' ? '没有找到匹配的协议' : '创建第一份NDA保密协议'}
          action={
            <Button onClick={() => navigate('/new')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建NDA
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {agreements.map((agreement) => (
            <AgreementCard key={agreement.id} agreement={agreement} />
          ))}
        </div>
      )}
    </div>
  );
}
