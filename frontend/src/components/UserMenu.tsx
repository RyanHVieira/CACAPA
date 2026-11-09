import { useAuth } from '../context/AuthContext';

export function UserMenu() {
  const { user, logout } = useAuth();

  const getInitials = (nick: string) => {
    return nick.charAt(0).toUpperCase();
  };

  return (
    <div className="user-menu">
      <div className="user-info">
        <div className="user-avatar" aria-hidden="true">
          {getInitials(user?.nick || 'U')}
        </div>
        <div className="user-details">
          <h3>{user?.nick}</h3>
          <p>Signed in</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="btn btn-secondary"
        style={{ width: 'auto', padding: '0.5rem 1rem' }}
      >
        Sign Out
      </button>
    </div>
  );
}