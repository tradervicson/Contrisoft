import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from '../../lib/user';
import { useRouter } from 'next/router';
import Link from 'next/link';

export interface Project {
  id: string;
  name?: string;
  status: 'Draft' | 'Needs Re-calc' | 'Costs Ready' | 'Compliant';
  created_at: string;
  model?: { data: any };
}

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

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'Draft': { color: '#9CA3AF', bg: '#F3F4F6', icon: '📝' },
    'Needs Re-calc': { color: '#F59E0B', bg: '#FEF3C7', icon: '🔄' },
    'Costs Ready': { color: '#10B981', bg: '#D1FAE5', icon: '💰' },
    'Compliant': { color: '#3B82F6', bg: '#DBEAFE', icon: '✅' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft'];
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: config.bg,
      color: config.color,
      fontSize: '14px',
      fontWeight: '500',
      border: `1px solid ${config.color}20`
    }}>
      <span>{config.icon}</span>
      <span>{status}</span>
    </div>
  );
};

const PriorityIndicator = ({ priority }: { priority: 'High' | 'Medium' | 'Low' }) => {
  const colors = {
    'High': '#EF4444',
    'Medium': '#F59E0B', 
    'Low': '#10B981'
  };
  
  return (
    <div style={{
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: colors[priority],
      border: '2px solid white',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
    }} />
  );
};

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: '#F3F4F6',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: '4px',
        transition: 'width 0.3s ease'
      }} />
    </div>
  );
};

export default function ProjectsPage() {
  const { data: projects, isLoading: projectsLoading, error } = useQuery({ 
    queryKey: ['projects'], 
    queryFn: fetchProjects 
  });
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Filter projects based on search and status
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.model?.data?.siteLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (userLoading || projectsLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#FAFBFC'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #E5E7EB',
            borderTop: '3px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>⚠️ Error Loading Projects</h2>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
            {error.message || 'Unable to load your projects. Please try logging in again.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              🔄 Retry
            </button>
            <button 
              onClick={handleLogout} 
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#FAFBFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
          <h2 style={{ marginBottom: '1rem', color: '#1F2937', fontSize: '24px' }}>No Projects Yet</h2>
          <p style={{ marginBottom: '2rem', color: '#6B7280', fontSize: '16px', lineHeight: '1.6' }}>
            Ready to start your first hotel planning project? Our AI assistant will guide you through the process.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/new-project">
              <button style={{
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚀 Create Your First Project
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAFBFC',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: '28px',
            fontWeight: '700',
            color: '#1F2937',
            marginBottom: '4px'
          }}>
            Projects Dashboard
          </h1>
          <p style={{ 
            margin: 0,
            color: '#6B7280',
            fontSize: '16px'
          }}>
            Manage and track your hotel planning projects
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/new-project">
            <button style={{
              padding: '12px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              ➕ New Project
            </button>
          </Link>
          <button 
            onClick={handleLogout} 
            style={{
              padding: '12px 20px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="🔍 Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter projects by status"
          style={{
            padding: '12px 16px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="All">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Needs Re-calc">Needs Re-calc</option>
          <option value="Costs Ready">Costs Ready</option>
          <option value="Compliant">Compliant</option>
        </select>
      </div>

      {/* Projects Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 150px 100px 120px 100px 80px',
          gap: '16px',
          padding: '16px 24px',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          fontSize: '12px',
          fontWeight: '600',
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Project Name</div>
          <div>Status</div>
          <div>Location</div>
          <div>Floors</div>
          <div>Total Keys</div>
          <div>Created</div>
          <div>Priority</div>
        </div>

        {/* Table Body */}
        {filteredProjects.map((project, index) => {
          const roomCount = project.model?.data.floorMix
            ? project.model.data.floorMix.reduce((sum: number, f: any) => 
                sum + Object.values(f.roomsByType).reduce((a: number, b: any) => a + b, 0), 0)
            : 0;
          
          const location = project.model?.data.siteLocation || 'TBD';
          const floors = project.model?.data.floorCount || 0;
          const date = new Date(project.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          
          // Mock priority for demo
          const priorities = ['High', 'Medium', 'Low'] as const;
          const priority = priorities[index % 3];
          
          return (
            <Link key={project.id} href={`/projects/${project.id}/design`}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 150px 100px 120px 100px 80px',
                gap: '16px',
                padding: '20px 24px',
                borderBottom: '1px solid #F3F4F6',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#1F2937',
                    fontSize: '14px',
                    marginBottom: '4px'
                  }}>
                    {project.name || 'Untitled Project'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6B7280'
                  }}>
                    {project.model?.data.brandFlag || 'Brand TBD'}
                  </div>
                </div>
                
                <StatusBadge status={project.status} />
                
                <div style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>📍</span>
                  <span>{location}</span>
                </div>
                
                <div style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  {floors}
                </div>
                
                <div style={{ 
                  fontSize: '16px', 
                  color: '#1F2937',
                  fontWeight: '600'
                }}>
                  {roomCount}
                </div>
                
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6B7280'
                }}>
                  {date}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PriorityIndicator priority={priority} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#3B82F6',
            marginBottom: '8px'
          }}>
            {projects.length}
          </div>
          <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>
            Total Projects
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#10B981',
            marginBottom: '8px'
          }}>
            {projects.filter(p => p.status === 'Compliant').length}
          </div>
          <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>
            Compliant
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#F59E0B',
            marginBottom: '8px'
          }}>
            {projects.reduce((sum, p) => {
              const roomCount = p.model?.data.floorMix
                ? p.model.data.floorMix.reduce((sum: number, f: any) => 
                    sum + Object.values(f.roomsByType).reduce((a: number, b: any) => a + b, 0), 0)
                : 0;
              return sum + roomCount;
            }, 0)}
          </div>
          <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>
            Total Keys
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#8B5CF6',
            marginBottom: '8px'
          }}>
            {Math.round(projects.filter(p => p.status === 'Compliant').length / projects.length * 100) || 0}%
          </div>
          <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>
            Completion Rate
          </div>
        </div>
      </div>
    </div>
  );
} 