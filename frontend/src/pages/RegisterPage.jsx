import { RegisterForm } from '../components/forms/RegisterForm';
import { AuthLayout } from '../components/layout/Layout';

export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}