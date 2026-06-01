import { useRef } from 'react';
import { NdaDocument } from '@/components/step2-preview/NdaDocument';
import { SignaturePad } from './SignaturePad';
import { ExportPanel } from './ExportPanel';
import { useNdaStore } from '@/stores/ndaStore';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export function SignPage() {
  const store = useNdaStore();
  const { showToast } = useToast();

  const handleConfirmSignature = () => {
    if (!store.signatureA) {
      showToast('请先在签名板中签署您的签名', 'error');
      return;
    }
    showToast('签名已确认');
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="page-title mb-1">签署与导出</h2>
          <p className="text-slate-400 text-sm">手写签名后即可下载PDF或分享给乙方签署</p>
        </div>
        <Button variant="secondary" onClick={() => store.setStep(1)} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回填写
        </Button>
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Main content: NDA preview + signature */}
        <div className="flex-1 space-y-6">
          {/* NDA Document */}
          <div className="overflow-auto">
            <NdaDocument
              projectName={store.projectName}
              purpose={store.purpose}
              scope={store.scope}
              confidentialityPeriod={store.confidentialityPeriod}
              stage={store.stage}
              notes={store.notes}
              partyA={store.partyA}
              partyB={store.partyB}
              signatureA={store.signatureA}
              signatureB={store.signatureB}
              signedDateA={store.signedDateA}
              signedDateB={store.signedDateB}
            />
          </div>

          {/* Signature area */}
          <div className="card p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">甲方签署</h3>
              <p className="text-sm text-slate-500">{store.partyA?.name || '甲方'} - 请在此手写签名</p>
            </div>
            <SignaturePad
              value={store.signatureA}
              onChange={(dataUrl) => store.setSignature('A', dataUrl)}
              label="甲方手写签名"
            />
            {store.signatureA && (
              <p className="text-xs text-slate-400 mt-2">
                签署日期：{store.signedDateA || new Date().toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar: Export */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <ExportPanel />
        </div>
      </div>
    </div>
  );
}
