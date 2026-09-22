import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, FileText, Hospital, Calendar, DollarSign, AlertCircle, MapPin, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { FileUpload } from '../ui/FileUpload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { cn } from '../../utils/cn';
import { formatINR } from '../../utils/currency';
import { useAuth } from '../../hooks/useAuth';
import { useSubmitClaim } from '../../hooks/useApi';

const claimSchema = z.object({
  policyNumber: z.string().min(1, 'Please select a policy'),
  provider: z.string().min(2, 'Provider name is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  dischargeDate: z.string().min(1, 'Discharge date is required'),
  hospitalAddress: z.string().min(5, 'Hospital address is required'),
  claimAmount: z.number().min(1, 'Claim amount must be greater than 0'),
  claimType: z.string().min(1, 'Claim type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

const CLAIM_TYPES = [
  { value: 'HOSPITALIZATION', label: 'Hospitalization' },
  { value: 'DAYCARE', label: 'Daycare Procedure' },
  { value: 'OPD', label: 'OPD Consultation' },
  { value: 'PHARMACY', label: 'Pharmacy/Medicines' },
];

const STEPS = [
  { id: 1, title: 'Policy & Member', icon: FileText },
  { id: 2, title: 'Hospital Details', icon: Hospital },
  { id: 3, title: 'Documents', icon: FileText },
];

export function ClaimWizard({ policies = [] }) {
  const { user } = useAuth();
  const submitClaim = useSubmitClaim();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      policyNumber: '',
      provider: '',
      admissionDate: '',
      dischargeDate: '',
      hospitalAddress: '',
      claimAmount: '',
      claimType: 'HOSPITALIZATION',
      description: '',
    },
  });

  const watchedPolicy = watch('policyNumber');
  const selectedPolicy = (policies || []).find(p => p.policyNumber === watchedPolicy);

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('policyNumber', data.policyNumber);
      formData.append('provider', data.provider);
      formData.append('admissionDate', data.admissionDate);
      formData.append('dischargeDate', data.dischargeDate);
      formData.append('hospitalAddress', data.hospitalAddress);
      formData.append('claimAmount', data.claimAmount);
      formData.append('claimType', data.claimType);
      formData.append('description', data.description);
      files.forEach((f) => {
        formData.append('documents', f.file);
        formData.append('documentTypes', f.documentType);
      });

      await submitClaim.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Select
                {...register('policyNumber')}
                options={policies.map(p => ({ value: p.policyNumber, label: `${p.policyName} (${p.policyNumber}) - ${formatINR(p.remainingBalance)} available` }))}
                error={errors.policyNumber?.message}
                className="pl-10"
                placeholder="Select a policy"
              />
            </div>
            {selectedPolicy && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Coverage Limit</p>
                    <p className="font-semibold">{formatINR(selectedPolicy.coverageLimit)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Remaining Balance</p>
                    <p className="font-semibold text-green-600">{formatINR(selectedPolicy.remainingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Deductible</p>
                    <p className="font-semibold">{formatINR(selectedPolicy.deductible)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Policy Type</p>
                    <p className="font-semibold">{selectedPolicy.policyType}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="relative">
              <Hospital className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                {...register('provider')}
                placeholder="Hospital / Medical Provider"
                error={errors.provider?.message}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  {...register('admissionDate')}
                  type="date"
                  error={errors.admissionDate?.message}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  {...register('dischargeDate')}
                  type="date"
                  error={errors.dischargeDate?.message}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Textarea
                {...register('hospitalAddress')}
                placeholder="Hospital Address"
                error={errors.hospitalAddress?.message}
                className="pl-10"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  {...register('claimAmount', { valueAsNumber: true })}
                  type="number"
                  placeholder="Claim Amount (₹)"
                  step="0.01"
                  min="1"
                  error={errors.claimAmount?.message}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Select
                  {...register('claimType')}
                  options={CLAIM_TYPES}
                  error={errors.claimType?.message}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Textarea
              {...register('description')}
              placeholder="Describe the treatment, diagnosis, and reason for claim..."
              error={errors.description?.message}
              rows={4}
            />
            <FileUpload
              value={files}
              onChange={setFiles}
              maxFiles={10}
              required
            />
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Required Documents:</strong> Hospital Bill, Discharge Summary, Medical Reports, Payment Receipts.
                Please select the correct document type for each file uploaded.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Submit New Claim</CardTitle>
              <CardDescription>3-step process to file your insurance claim</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index + 1 < currentStep ? 'bg-green-500 text-white' :
                  index + 1 === currentStep ? 'bg-primary-500 text-white' :
                  'bg-slate-200 text-slate-500'
                )}>
                  {index + 1 < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn('w-16 h-0.5 mx-2', index + 1 < currentStep ? 'bg-green-500' : 'bg-slate-200')} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-fade-in">{renderStep()}</div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex gap-3">
          {currentStep < 3 ? (
            <Button type="button" variant="primary" onClick={nextStep}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" className="w-auto" loading={isSubmitting || submitClaim.isPending} onClick={handleSubmit(onSubmit)}>
              Submit Claim
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}