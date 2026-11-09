import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    nick: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nick.trim()) {
      newErrors.nick = 'Nick is required';
    } else if (formData.nick.length < 3) {
      newErrors.nick = 'Nick must be at least 3 characters';
    } else if (formData.nick.length > 50) {
      newErrors.nick = 'Nick must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.nick)) {
      newErrors.nick = 'Nick can only contain letters, numbers, underscores and hyphens';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Password must be less than 100 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await register(formData.nick, formData.password);
      navigate('/dashboard');
    } catch {
      // Error handled in auth context
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Sign up to get started</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="nick" className="form-label">
              Nick
            </label>
            <input
              type="text"
              id="nick"
              name="nick"
              className={`form-input ${errors.nick ? 'error' : ''}`}
              value={formData.nick}
              onChange={handleChange}
              placeholder="Choose a nick"
              autoComplete="username"
              disabled={isLoading}
              maxLength={50}
              aria-invalid={errors.nick ? 'true' : 'false'}
              aria-describedby={errors.nick ? 'nick-error' : 'nick-hint'}
            />
            {errors.nick ? (
              <p id="nick-error" className="error-message visible" role="alert">
                {errors.nick}
              </p>
            ) : (
              <p id="nick-hint" className="error-message" style={{ color: 'var(--text-secondary)', display: 'block' }}>
                3-50 characters, letters, numbers, underscores and hyphens only
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={isLoading}
                maxLength={100}
                style={{ paddingRight: '44px' }}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  padding: '4px',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password ? (
              <p id="password-error" className="error-message visible" role="alert">
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="error-message" style={{ color: 'var(--text-secondary)', display: 'block' }}>
                At least 6 characters
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={isLoading}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" className="error-message visible" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner loading-spinner-small" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}