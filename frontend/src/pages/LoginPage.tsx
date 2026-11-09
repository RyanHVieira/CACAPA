import { LoginForm } from '../components/LoginForm';
import { PublicRoute } from '../components/PublicRoute';

export function LoginPage() {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  );
}