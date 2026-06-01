import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Party } from '@/types';
import { Check } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(1, '请输入姓名/机构名称'),
  email: z.string().email('请输入有效的邮箱地址').min(1, '请输入邮箱'),
});

type FormData = z.infer<typeof formSchema>;

interface CounterPartyFormProps {
  initialData?: Partial<Party> | null;
  onSubmit: (party: Party) => void;
}

export function CounterPartyForm({ initialData, onSubmit }: CounterPartyFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        email: initialData.email || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name,
      email: data.email,
      contactPerson: data.name,
      title: '',
      phone: '',
      address: '',
      type: 'company',
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">乙方信息</h3>
      <p className="text-sm text-slate-500">请填写您的信息以完成签署</p>
      <Input label="姓名/机构名称 *" {...register('name')} placeholder="您的姓名或机构全称" error={errors.name?.message} />
      <Input label="邮箱 *" {...register('email')} type="email" placeholder="email@example.com" error={errors.email?.message} />
      <Button type="submit" className="w-full flex items-center justify-center gap-2">
        {isSubmitSuccessful ? (
          <>
            <Check className="w-4 h-4" />
            已确认
          </>
        ) : (
          '确认乙方信息'
        )}
      </Button>
    </form>
  );
}
