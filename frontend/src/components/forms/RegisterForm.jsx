import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Shield, MapPin, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { showToast } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', mobile: '', password: '', confirmPassword: '', address: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        address: data.address,
        role: 'USER',
      });
      showToast('Account created successfully! Please sign in.', 'success');
      navigate('/login', { replace: true });
    } catch {
      // Error handled by mutation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">Care<span className="text-primary-500">Shield</span></span>
        </div>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input {...register('fullName')} placeholder="Full Name" error={errors.fullName?.message} className="pl-10" />
            </div>

            <div className="relative col-span-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input {...register('email')} type="email" placeholder="Email Address" error={errors.email?.message} className="pl-10" autoComplete="email" />
            </div>

            <div className="relative col-span-2">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input {...register('mobile')} type="tel" placeholder="Mobile Number" error={errors.mobile?.message} className="pl-10" autoComplete="tel" />
            </div>

            <div className="relative col-span-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input {...register('address')} placeholder="Address" error={errors.address?.message} className="pl-10" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input {...register('password')} type="password" placeholder="Password" error={errors.password?.message} className="pl-10" autoComplete="new-password" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input {...register('confirmPassword')} type="password" placeholder="Confirm Password" error={errors.confirmPassword?.message} className="pl-10" autoComplete="new-password" />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-3 pt-6">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}