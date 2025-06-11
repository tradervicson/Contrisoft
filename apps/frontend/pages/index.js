import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '800px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #007bff, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Contrisoft
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--secondary-gray)', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Transform weeks of spreadsheets into minutes of conversation. Our AI-powered hotel planning engine creates comprehensive base models through simple, guided questions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', margin: '3rem 0' }}>
          <div style={{ padding: '1.5rem', borderRadius: 'var(--border-radius)', background: 'rgba(0, 123, 255, 0.1)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Smart Chat Wizard</h3>
            <p style={{ color: 'var(--secondary-gray)', fontSize: '0.9rem' }}>
              Answer 6 simple questions about location, brand, floors, and amenities
            </p>
          </div>
          <div style={{ padding: '1.5rem', borderRadius: 'var(--border-radius)', background: 'rgba(40, 167, 69, 0.1)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Instant Models</h3>
            <p style={{ color: 'var(--secondary-gray)', fontSize: '0.9rem' }}>
              AI transforms your inputs into structured hotel base models in seconds
            </p>
          </div>
          <div style={{ padding: '1.5rem', borderRadius: 'var(--border-radius)', background: 'rgba(253, 126, 20, 0.1)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Professional Analytics</h3>
            <p style={{ color: 'var(--secondary-gray)', fontSize: '0.9rem' }}>
              Get cost estimates, compliance checks, and 3D visualizations
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/new-project">
            <button style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: 'var(--border-radius)',
              background: 'linear-gradient(135deg, #007bff, #0056b3)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '200px'
            }}>
              🚀 Start New Project
            </button>
          </Link>
          <Link href="/projects">
            <button className="btn-outline" style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              minWidth: '200px'
            }}>
              📋 View Projects
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(0, 123, 255, 0.05)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(0, 123, 255, 0.1)' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>✨ Why Choose Contrisoft?</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--secondary-gray)', margin: 0 }}>
            Replace weeks of manual take-offs and spreadsheet work with our intelligent conversation engine. 
            Perfect for hotel developers, architects, and construction teams who need accurate base models fast.
          </p>
        </div>
      </div>
    </div>
  );
} 