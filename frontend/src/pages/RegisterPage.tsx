import { RegisterForm } from '../components/RegisterForm';
import { PublicRoute } from '../components/PublicRoute';

export function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterForm />
    </PublicRoute>
  );
}