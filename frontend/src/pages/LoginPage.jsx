import { LoginForm } from '../components/forms/LoginForm';
import { AuthLayout } from '../components/layout/Layout';

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}