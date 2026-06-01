import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2;
}

const steps = [
  { num: 1, label: '填写信息' },
  { num: 2, label: '签署导出' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > step.num
                  ? 'bg-emerald-500 text-white'
                  : currentStep === step.num
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-700 text-slate-500'
              }`}
            >
              {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium ${
                currentStep >= step.num ? 'text-slate-200' : 'text-slate-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-1rem] rounded transition-colors ${
                currentStep > step.num ? 'bg-emerald-500' : 'bg-navy-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
