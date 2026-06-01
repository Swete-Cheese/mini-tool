import type { Party } from '@/types';
import { PARTY_TYPE_LABELS } from '@/types';
import { Building2, User, Briefcase, Phone, MapPin, Mail } from 'lucide-react';

interface PartyCardProps {
  party: Party;
  side: 'A' | 'B';
  onEdit?: () => void;
  onRemove?: () => void;
}

export function PartyCard({ party, side, onEdit, onRemove }: PartyCardProps) {
  const label = side === 'A' ? '甲方（披露方）' : '乙方（接收方）';

  return (
    <div className="card p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2.5 py-1 rounded-full">
          {label}
        </span>
        <span className="text-xs text-slate-400">{PARTY_TYPE_LABELS[party.type]}</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-900">{party.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-700">{party.contactPerson}</span>
          {party.title && (
            <>
              <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2" />
              <span className="text-slate-500">{party.title}</span>
            </>
          )}
        </div>
        {party.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500">{party.phone}</span>
          </div>
        )}
        {party.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500">{party.email}</span>
          </div>
        )}
        {party.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 text-xs">{party.address}</span>
          </div>
        )}
      </div>
      {(onEdit || onRemove) && (
        <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100">
          {onEdit && (
            <button onClick={onEdit} className="text-xs text-slate-500 hover:text-gold-500 bg-slate-100 hover:bg-gold-50 px-2.5 py-1.5 rounded transition-colors">
              编辑
            </button>
          )}
          {onRemove && (
            <button onClick={onRemove} className="text-xs text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors">
              移除
            </button>
          )}
        </div>
      )}
    </div>
  );
}
