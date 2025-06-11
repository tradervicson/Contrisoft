import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    let authResponse;
    if (isRegister) {
      authResponse = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } else {
      authResponse = await supabase.auth.signInWithPassword({ email, password });
    }
    const { error, data } = authResponse as any;

    if (error) {
      setError(error.message);
      setSuccess('');
      setLoading(false);
      return;
    }

    if (isRegister) {
      // Sign-up success - user needs to verify email
      setLoading(false);
      setError('');
      setSuccess('Success! Check your inbox for a confirmation email, then return here to sign in.');
      setIsRegister(false);
      return;
    }

    // Login success - ensure session is set before redirecting
    if (data?.session) {
      setLoading(false);
      router.push('/projects');
    } else {
      setLoading(false);
      setError('Login succeeded but session not found. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="container">
        <div className="card" style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2rem',
              margin: '0 0 0.5rem 0',
              background: 'linear-gradient(135deg, #007bff, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Contrisoft
            </h1>
            <h2 style={{ 
              fontSize: '1.5rem',
              margin: 0,
              color: 'var(--dark-gray)',
              fontWeight: '600'
            }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ 
              margin: '0.5rem 0 0 0',
              color: 'var(--secondary-gray)',
              fontSize: '1rem'
            }}>
              {isRegister ? 'Start planning your hotel projects today' : 'Sign in to continue to your projects'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--dark-gray)',
                fontWeight: '500'
              }}>
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid var(--medium-gray)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease'
                }} 
              />
            </div>

            <div>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--dark-gray)',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid var(--medium-gray)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease'
                }} 
              />
            </div>

            {error && (
              <div style={{ 
                padding: '0.75rem 1rem',
                background: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid var(--danger-red)',
                borderRadius: 'var(--border-radius)',
                color: 'var(--danger-red)',
                fontSize: '0.9rem'
              }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div style={{ 
                padding: '0.75rem 1rem',
                background: 'rgba(40, 167, 69, 0.1)',
                border: '1px solid var(--success-green)',
                borderRadius: 'var(--border-radius)',
                color: 'var(--success-green)',
                fontSize: '0.9rem'
              }}>
                ✅ {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
              style={{ 
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Processing...
                </>
              ) : (
                <>
                  {isRegister ? '🚀 Create Account' : '👋 Sign In'}
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--medium-gray)' }}>
              <button 
                type="button" 
                onClick={() => setIsRegister(r => !r)} 
                className="btn-outline"
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-blue)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }}
              >
                {isRegister ? 'Already have an account? Sign in here' : "Don't have an account? Create one here"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 