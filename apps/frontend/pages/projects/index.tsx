import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import ProjectCard, { Project } from '../../components/ProjectCard';
import { useUser } from '../../lib/user';
import { useRouter } from 'next/router';

async function fetchProjects(): Promise<Project[]> {
  // First get all projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (projectsError) throw projectsError;
  
  if (!projectsData || projectsData.length === 0) {
    return [];
  }

  // Then get all hotel base models for these projects
  const projectIds = projectsData.map(p => p.id);
  const { data: modelsData, error: modelsError } = await supabase
    .from('hotel_base_models')
    .select('project_id, data')
    .in('project_id', projectIds);
  
  if (modelsError) {
    console.warn('Could not load hotel models:', modelsError);
  }

  // Combine the data
  return projectsData.map((project: any) => {
    const model = modelsData?.find(m => m.project_id === project.id);
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      created_at: project.created_at,
      model: model ? { data: model.data } : undefined
    };
  });
}

export default function ProjectsPage() {
  const { data: projects, isLoading: projectsLoading, error } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Show loading while checking auth or loading projects
  if (userLoading || projectsLoading) {
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
          <p style={{ color: 'var(--secondary-gray)' }}>Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Projects loading error:', error);
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--danger-red)', marginBottom: '1rem' }}>⚠️ Error Loading Projects</h2>
          <p style={{ color: 'var(--secondary-gray)', marginBottom: '2rem' }}>
            {error.message || 'Unable to load your projects. Please try logging in again.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              🔄 Retry
            </button>
            <button 
              onClick={handleLogout} 
              className="btn-outline"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              🚪 Logout & Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // If no user after loading, the useEffect will handle redirect
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container">
          <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>No Projects Yet</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--secondary-gray)', fontSize: '1.1rem' }}>
              Ready to start your first hotel planning project? Our AI assistant will guide you through the process in just a few minutes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/new-project">
                <button className="btn-primary" style={{ 
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  🚀 Create Your First Project
                </button>
              </a>
              <a href="/">
                <button className="btn-outline" style={{ 
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  ← Back to Home
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '3rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '1.5rem 2rem',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <h1 style={{ 
              margin: 0,
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #007bff, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Your Projects
            </h1>
            <p style={{ 
              margin: '0.5rem 0 0 0',
              color: 'var(--secondary-gray)',
              fontSize: '1.1rem'
            }}>
              Manage and track your hotel planning projects
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/new-project">
              <button className="btn-primary" style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: '600'
              }}>
                ➕ New Project
              </button>
            </a>
            <button 
              onClick={handleLogout} 
              className="btn-outline"
              style={{ 
                padding: '0.75rem 1.5rem',
                fontWeight: '600'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2rem'
        }}>
          {projects.map(proj => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>

        {/* Stats Footer */}
        <div style={{ 
          marginTop: '3rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                {projects.length}
              </div>
              <div style={{ color: 'var(--secondary-gray)' }}>Total Projects</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-green)' }}>
                {projects.filter(p => p.status === 'Compliant').length}
              </div>
              <div style={{ color: 'var(--secondary-gray)' }}>Compliant</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-orange)' }}>
                {projects.reduce((sum, p) => {
                  const roomCount = p.model?.data.floorMix
                    ? p.model.data.floorMix.reduce((sum: number, f: any) => sum + Object.values(f.roomsByType).reduce((a: number, b: any) => a + b, 0), 0)
                    : 0;
                  return sum + roomCount;
                }, 0)}
              </div>
              <div style={{ color: 'var(--secondary-gray)' }}>Total Keys</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 