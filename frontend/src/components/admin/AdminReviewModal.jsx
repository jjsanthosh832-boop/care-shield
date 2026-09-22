import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { formatINR } from '../../utils/currency';

const reviewSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Settled']),
  remarks: z.string().min(5, 'Remarks must be at least 5 characters'),
});

export function AdminReviewModal({ isOpen, onClose, claim, onSubmit }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { status: 'Approved', remarks: '' },
  });

  useEffect(() => {
    if (isOpen) reset({ status: 'Approved', remarks: '' });
  }, [isOpen, claim, reset]);

  const handleSubmitForm = (data) => {
    onSubmit?.(claim.id, data.status, data.remarks);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review Claim ${claim?.claimNumber || claim?.id}`} size="lg">
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Claim Number</p>
            <p className="font-semibold text-slate-900">{claim?.claimNumber || claim?.id}</p>
          </div>
          <div>
            <p className="text-slate-500">Policy Number</p>
            <p className="font-semibold text-slate-900">{claim?.policyNumber}</p>
          </div>
          <div>
            <p className="text-slate-500">User</p>
            <p className="font-semibold text-slate-900">{claim?.user?.fullName || claim?.user?.email}</p>
          </div>
          <div>
            <p className="text-slate-500">Provider</p>
            <p className="font-semibold text-slate-900">{claim?.provider}</p>
          </div>
          <div>
            <p className="text-slate-500">Service Date</p>
            <p className="font-semibold text-slate-900">{claim?.serviceDate || claim?.admissionDate}</p>
          </div>
          <div>
            <p className="text-slate-500">Claim Amount</p>
            <p className="font-semibold text-slate-900 text-lg">{formatINR(claim?.claimAmount)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500">Description</p>
            <p className="font-medium text-slate-900">{claim?.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Select
            {...register('status')}
            options={[
              { value: 'Approved', label: 'Approve Claim' },
              { value: 'Rejected', label: 'Reject Claim' },
              { value: 'Settled', label: 'Mark as Settled' },
            ]}
            error={errors.status?.message}
            label="Decision"
          />

          <Textarea
            {...register('remarks')}
            placeholder="Enter reason for approval, rejection, or settlement..."
            error={errors.remarks?.message}
            rows={3}
            label="Remarks / Reason"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button type="submit" variant={watch('status') === 'Rejected' ? 'danger' : 'primary'}>
            Submit Decision
          </Button>
        </div>
      </form>
    </Modal>
  );
}