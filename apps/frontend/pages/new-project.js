import ChatWizard from '../components/ChatWizard';
import Link from 'next/link';
import { useUser } from '../lib/user';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function NewProject() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Show loading while determining auth status
  if (userLoading) {
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
          <p style={{ color: 'var(--secondary-gray)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, the useEffect will handle redirect
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link href="/projects">
            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ← Back to Projects
            </button>
          </Link>
          <h1 style={{ 
            fontSize: '2rem', 
            color: 'white', 
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            margin: 0
          }}>
            Create New Hotel Project
          </h1>
          <div style={{ width: '140px' }}></div> {/* Spacer for centering */}
        </div>

        {/* Chat Container */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          minHeight: 'calc(100vh - 150px)'
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem', 
            width: '100%', 
            maxWidth: '700px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h2 style={{ 
                color: 'var(--primary-blue)', 
                marginBottom: '0.5rem',
                fontSize: '1.5rem'
              }}>
                🏨 Hotel Planning Assistant
              </h2>
              <p style={{ 
                color: 'var(--secondary-gray)', 
                margin: 0,
                fontSize: '1rem'
              }}>
                I'll guide you through 6 simple questions to create your hotel base model
              </p>
            </div>
            
            <ChatWizard />
          </div>
        </div>
      </div>
    </div>
  );
} 