import { useNdaStore } from '@/stores/ndaStore';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { FillInfoPage } from '@/components/step1-fill/FillInfoPage';
import { SignPage } from '@/components/step3-sign/SignPage';

export function NewNdaWizard() {
  const step = useNdaStore((s) => s.step);

  return (
    <div>
      <StepIndicator currentStep={step} />
      {step === 1 && <FillInfoPage />}
      {step === 2 && <SignPage />}
    </div>
  );
}
