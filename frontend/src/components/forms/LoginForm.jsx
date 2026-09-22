import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const loginSchema = z.object({
  emailOrMobile: z.string().min(1, 'Email or mobile is required'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrMobile: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error handled by mutation
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setValue('emailOrMobile', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    showToast('Demo credentials filled', 'info');
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
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
            <Input
              {...register('emailOrMobile')}
              type="text"
              placeholder="Email or Mobile Number"
              error={errors.emailOrMobile?.message}
              className="pl-10"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              error={errors.password?.message}
              className="pl-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl">
            <p className="text-xs font-semibold text-primary-700 mb-2">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-center"
                onClick={() => fillCredentials('santhosh@email.com', 'password')}
              >
                <User className="w-3.5 h-3.5 mr-1" />
                User
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-center"
                onClick={() => fillCredentials('admin@example.com', 'password')}
              >
                <Shield className="w-3.5 h-3.5 mr-1" />
                Admin
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-3 pt-6">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-500 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
        <p className="text-xs text-slate-400">By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </CardFooter>
    </Card>
  );
}