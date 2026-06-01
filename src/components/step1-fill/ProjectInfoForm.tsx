import { Input } from '@/components/ui/Input';
import { useNdaStore } from '@/stores/ndaStore';
import { PERIOD_OPTIONS } from '@/types';

export function ProjectInfoForm() {
  const { projectName, purpose, scope, confidentialityPeriod, notes, updateField } = useNdaStore();

  return (
    <div className="space-y-4">
      <h3 className="section-title">项目信息</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="项目名称"
          placeholder="例如：XX科技A轮融资"
          value={projectName}
          onChange={(e) => updateField('projectName', e.target.value)}
        />
        <div>
          <label className="label">保密期限</label>
          <select
            className="input-field"
            value={confidentialityPeriod}
            onChange={(e) => updateField('confidentialityPeriod', e.target.value)}
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="合作事由"
          placeholder="简要说明合作背景"
          value={purpose}
          onChange={(e) => updateField('purpose', e.target.value)}
        />
      </div>
      <div>
        <label className="label">保密信息范围（可自定义）</label>
        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder={`留空则默认适用以下标准条款：
（1）项目背景、交易结构、商业计划及财务数据；
（2）客户资料、供应商信息、合同文本；
（3）技术资料、知识产权信息；
（4）双方就本项目进行的沟通内容、会议纪要；
（5）甲方明确标注为"保密"或乙方应当合理认知为保密信息的其他信息。`}
          value={scope}
          onChange={(e) => updateField('scope', e.target.value)}
        />
      </div>
      <div>
        <label className="label">特别约定/备注</label>
        <textarea
          className="input-field min-h-[80px] resize-y"
          placeholder={'可填写特殊约定事项（留空则默认为「双方无特别约定」）'}
          value={notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
