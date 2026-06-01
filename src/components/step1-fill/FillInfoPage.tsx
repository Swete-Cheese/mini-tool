import { useState } from 'react';
import { ProjectInfoForm } from './ProjectInfoForm';
import { PartySelector } from './PartySelector';
import { PartyCard } from './PartyCard';
import { PartyFormModal } from './PartyFormModal';
import { useNdaStore } from '@/stores/ndaStore';
import { saveParty } from '@/db/database';
import type { Party } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ArrowRight } from 'lucide-react';

export function FillInfoPage() {
  const { partyA, partyB, setParty, setStep } = useNdaStore();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSide, setModalSide] = useState<'A' | 'B'>('A');
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  const openAddModal = (side: 'A' | 'B') => {
    setModalSide(side);
    setEditingParty(null);
    setModalOpen(true);
  };

  const openEditModal = (side: 'A' | 'B', party: Party) => {
    setModalSide(side);
    setEditingParty(party);
    setModalOpen(true);
  };

  const handleSaveParty = async (party: Party) => {
    await saveParty(party);
    setParty(modalSide, party);
    showToast(editingParty ? '机构信息已更新' : '机构信息已保存');
  };

  const handleNext = () => {
    if (!partyA) {
      showToast('请选择甲方（披露方）', 'error');
      return;
    }
    setStep(2);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="page-title mb-2">新建保密协议</h2>
      <p className="text-slate-400 text-sm mb-8">填写项目信息并选择合作双方，即可生成NDA协议</p>

      <div className="card p-6 mb-6">
        <ProjectInfoForm />
      </div>

      <div className="card p-6 mb-6">
        <h3 className="section-title">合作双方信息</h3>
        <div className="space-y-6">
          <div>
            {partyA ? (
              <PartyCard
                party={partyA}
                side="A"
                onEdit={() => openEditModal('A', partyA)}
                onRemove={() => setParty('A', null as unknown as Party)}
              />
            ) : (
              <PartySelector
                side="A"
                selectedParty={partyA}
                onSelect={(p) => setParty('A', p)}
                onAddNew={() => openAddModal('A')}
              />
            )}
          </div>
          <div>
            {partyB ? (
              <PartyCard
                party={partyB}
                side="B"
                onEdit={() => openEditModal('B', partyB)}
                onRemove={() => setParty('B', null as unknown as Party)}
              />
            ) : (
              <PartySelector
                side="B"
                selectedParty={partyB}
                onSelect={(p) => setParty('B', p)}
                onAddNew={() => openAddModal('B')}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="flex items-center gap-2">
          下一步：签署导出
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <PartyFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveParty}
        initialData={editingParty}
      />
    </div>
  );
}
