import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Party } from '@/types';
import { PARTY_TYPE_LABELS } from '@/types';

const partySchema = z.object({
  name: z.string().min(1, '请输入机构名称'),
  contactPerson: z.string().min(1, '请输入联系人'),
  title: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  type: z.enum(['gp_investor', 'listed_company', 'lp_individual', 'ma_advisor', 'fa_advisor', 'search_fund', 'river_guide', 'investor', 'advisor', 'company', 'other']),
});

type PartyFormData = z.infer<typeof partySchema>;

interface PartyFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (party: Party) => void;
  initialData?: Party | null;
}

export function PartyFormModal({ open, onClose, onSave, initialData }: PartyFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          contactPerson: initialData.contactPerson,
          title: initialData.title || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
          type: initialData.type,
        }
      : { name: '', contactPerson: '', title: '', phone: '', email: '', type: 'gp_investor' },
  });

  const onSubmit = (data: PartyFormData) => {
    onSave({
      ...data,
      ...(initialData?.id ? { id: initialData.id } : {}),
      createdAt: initialData?.createdAt,
      updatedAt: new Date(),
    });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? '编辑机构信息' : '添加机构信息'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="机构名称 *" {...register('name')} placeholder="例如：红杉资本" error={errors.name?.message} />
          <Input label="联系人 *" {...register('contactPerson')} placeholder="姓名" error={errors.contactPerson?.message} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="职务" {...register('title')} placeholder="例如：投资总监" />
          <Input label="电话" {...register('phone')} placeholder="手机或座机" />
        </div>
        <Input label="邮箱" {...register('email')} placeholder="email@example.com" />
        <div>
          <label className="label">机构类型</label>
          <select {...register('type')} className="input-field">
            {Object.entries(PARTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
          <Button type="submit">{initialData ? '保存修改' : '添加'}</Button>
        </div>
      </form>
    </Modal>
  );
}
