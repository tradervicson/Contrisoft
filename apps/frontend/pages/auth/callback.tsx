import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Check if this is a callback from email verification
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session from the URL hash parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Auth callback error:', error);
            router.replace('/login');
            return;
          }

          if (data.session) {
            console.log('Session established:', data.session.user.email);
            router.replace('/projects');
          } else {
            router.replace('/login');
          }
        } else {
          // No auth tokens found, check if user is already logged in
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            router.replace('/projects');
          } else {
            router.replace('/login');
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        router.replace('/login');
      }
    })();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid var(--medium-gray)',
          borderTop: '4px solid var(--primary-blue)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ fontSize: '1.1rem', color: 'var(--secondary-gray)' }}>Verifying your account...</p>
      </div>
    </div>
  );
} 