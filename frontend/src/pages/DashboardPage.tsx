import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserMenu } from '../components/UserMenu';
import { useAuth } from '../context/AuthContext';

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div>
      <UserMenu />
      <main className="page-content">
        <h1 className="page-title">Dashboard</h1>
        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Welcome, {user?.nick}!</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>User ID</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{user?.id}</p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Member Since</p>
              <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'long' }) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}