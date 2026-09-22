import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, MapPin, Phone, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { useUpdateProfile } from '../../hooks/useApi';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function ProfileForm({ user }) {
  const updateProfileMutation = useUpdateProfile();
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      mobile: user?.mobile || '',
      address: user?.address || '',
      twoFactorEnabled: user?.twoFactorEnabled || false,
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      fullName: data.fullName,
      mobile: data.mobile,
      address: data.address,
      twoFactorEnabled: data.twoFactorEnabled,
    };
    if (data.password) payload.password = data.password;

    try {
      await updateProfileMutation.mutateAsync(payload);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Profile Settings</CardTitle>
            <CardDescription>Manage your account information and security</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email (Cannot be changed)</p>
                <p className="font-medium text-slate-900">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              {...register('fullName')}
              placeholder="Full Name"
              error={errors.fullName?.message}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              {...register('mobile')}
              type="tel"
              placeholder="Mobile Number"
              error={errors.mobile?.message}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Textarea
              {...register('address')}
              placeholder="Address"
              error={errors.address?.message}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('twoFactorEnabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Change Password</h3>
            <p className="text-sm text-slate-500">Leave blank to keep your current password</p>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                {...register('password')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password (min 6 characters)"
                error={errors.password?.message}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                {...register('confirmPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                error={errors.confirmPassword?.message}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button type="submit" form="profile-form" loading={updateProfileMutation.isPending}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}