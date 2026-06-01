import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { searchParties } from '@/db/database';
import type { Party } from '@/types';

interface PartySelectorProps {
  side: 'A' | 'B';
  selectedParty: Party | null;
  onSelect: (party: Party) => void;
  onAddNew: () => void;
}

export function PartySelector({ side, selectedParty, onSelect, onAddNew }: PartySelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Party[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const label = side === 'A' ? '甲方（披露方）' : '乙方（接收方）';
  const placeholder = side === 'A' ? '搜索或选择披露方机构...' : '搜索或选择接收方机构...';

  useEffect(() => {
    if (query.trim().length > 0) {
      setLoading(true);
      const timer = setTimeout(async () => {
        const parties = await searchParties(query);
        setResults(parties);
        setLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    } else if (isOpen) {
      searchParties('').then(setResults);
    }
  }, [query, isOpen]);

  return (
    <div className="relative">
      <label className="label">{label}</label>
      {selectedParty ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700">
            <span className="font-semibold">{selectedParty.name}</span>
            <span className="text-slate-400 mx-2">|</span>
            {selectedParty.contactPerson}
          </div>
          <button
            onClick={() => {
              onSelect(null as unknown as Party);
              setIsOpen(true);
            }}
            className="text-xs text-slate-500 hover:text-gold-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-gold-300 transition-colors flex-shrink-0"
          >
            更换
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder={placeholder}
              value={query}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 text-sm text-gold-500 hover:text-gold-400 border border-gold-500/30 hover:border-gold-400 rounded-lg px-3 py-2 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            新增
          </button>
        </div>
      )}

      {isOpen && !selectedParty && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-xl max-h-52 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-slate-400 text-center">搜索中...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-slate-400 text-center">
              无匹配结果，点击"新增"添加
            </div>
          ) : (
            results.map((party) => (
              <button
                key={party.id}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                onMouseDown={() => {
                  onSelect(party);
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                <div className="text-sm font-semibold text-slate-900">{party.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {party.contactPerson}{party.title ? ` · ${party.title}` : ''}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
