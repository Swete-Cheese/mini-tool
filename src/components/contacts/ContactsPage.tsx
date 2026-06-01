import { useState, useEffect } from 'react';
import { PartyCard } from '@/components/step1-fill/PartyCard';
import { PartyFormModal } from '@/components/step1-fill/PartyFormModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getAllParties, saveParty, deleteParty, searchParties } from '@/db/database';
import type { Party } from '@/types';
import { Plus, Search, Users } from 'lucide-react';

export function ContactsPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const loadParties = async () => {
    if (searchQuery.trim()) {
      const results = await searchParties(searchQuery);
      setParties(results);
    } else {
      const all = await getAllParties();
      setParties(all);
    }
  };

  useEffect(() => {
    loadParties();
  }, [searchQuery]);

  const handleSave = async (party: Party) => {
    await saveParty(party);
    showToast(editingParty ? '机构信息已更新' : '机构已添加');
    setEditingParty(null);
    loadParties();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该机构信息吗？')) return;
    await deleteParty(id);
    showToast('机构已删除');
    loadParties();
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingParty(null);
    setModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-title mb-1">机构通讯录</h2>
          <p className="text-slate-400 text-sm">管理常用合作机构信息，新建NDA时可一键选择填充</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加机构
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="搜索机构名称或联系人..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {parties.length === 0 ? (
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="暂无机构信息"
          description={searchQuery ? '未找到匹配的机构' : '添加常用合作机构，新建NDA时无需重复填写'}
          action={
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加第一个机构
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              side="A"
              onEdit={() => handleEdit(party)}
              onRemove={() => party.id && handleDelete(party.id)}
            />
          ))}
        </div>
      )}

      <PartyFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingParty(null);
        }}
        onSave={handleSave}
        initialData={editingParty}
      />
    </div>
  );
}
