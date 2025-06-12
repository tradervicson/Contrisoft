import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

async function deleteProject(projectId: string): Promise<void> {
  // Delete hotel base model first (if exists)
  await supabase
    .from('hotel_base_models')
    .delete()
    .eq('project_id', projectId);
  
  // Delete project
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  
  if (error) throw error;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'Draft': { 
      color: '#6B7280', 
      bg: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', 
      icon: '📝',
      shadow: '0 2px 4px rgba(107, 114, 128, 0.1)'
    },
    'Needs Re-calc': { 
      color: '#F59E0B', 
      bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', 
      icon: '🔄',
      shadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
    },
    'Costs Ready': { 
      color: '#10B981', 
      bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', 
      icon: '💰',
      shadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
    },
    'Compliant': { 
      color: '#3B82F6', 
      bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', 
      icon: '✅',
      shadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
    }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft'];
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '25px',
      background: config.bg,
      color: config.color,
      fontSize: '13px',
      fontWeight: '600',
      border: `1px solid ${config.color}30`,
      boxShadow: config.shadow,
      transition: 'all 0.2s ease'
    }}>
      <span style={{ fontSize: '14px' }}>{config.icon}</span>
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
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: colors[priority],
      border: '3px solid white',
      boxShadow: `0 0 0 1px ${colors[priority]}40, 0 2px 4px rgba(0,0,0,0.1)`,
      transition: 'transform 0.2s ease'
    }} 
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    />
  );
};

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  projectName,
  isDeleting 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        transform: isOpen ? 'scale(1)' : 'scale(0.9)',
        transition: 'transform 0.2s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1F2937',
            marginBottom: '8px'
          }}>
            Delete Project
          </h3>
          <p style={{ 
            color: '#6B7280', 
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Are you sure you want to delete "<strong>{projectName}</strong>"? This action cannot be undone.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center' 
        }}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#6B7280',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              opacity: isDeleting ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#6B7280';
              }
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: '12px 24px',
              background: isDeleting 
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              boxShadow: isDeleting 
                ? '0 4px 12px rgba(156, 163, 175, 0.3)'
                : '0 4px 12px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }
            }}
          >
            {isDeleting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Deleting...
              </>
            ) : (
              <>🗑️ Delete Project</>
            )}
          </button>
        </div>
      </div>
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
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; project: Project | null }>({
    isOpen: false,
    project: null
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteModal({ isOpen: false, project: null });
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  });

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, project });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.project) {
      deleteMutation.mutate(deleteModal.project.id);
    }
  };

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #F3F4F6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '18px', fontWeight: '500' }}>Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '24px' }}>Error Loading Projects</h2>
          <p style={{ color: '#6B7280', marginBottom: '2rem', lineHeight: '1.6' }}>
            {error.message || 'Unable to load your projects. Please try logging in again.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🔄 Retry
            </button>
            <button 
              onClick={handleLogout} 
              style={{
                padding: '14px 28px',
                backgroundColor: 'white',
                color: '#374151',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#374151';
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '4rem',
          borderRadius: '24px',
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🏨</div>
          <h2 style={{ marginBottom: '1rem', color: '#1F2937', fontSize: '28px', fontWeight: '700' }}>No Projects Yet</h2>
          <p style={{ marginBottom: '2.5rem', color: '#6B7280', fontSize: '18px', lineHeight: '1.6' }}>
            Ready to start your first hotel planning project? Our AI assistant will guide you through the process.
          </p>
          <Link href="/new-project">
            <button style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            }}
            >
              🚀 Create Your First Project
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '32px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Projects Dashboard
          </h1>
          <p style={{ 
            margin: 0,
            color: '#6B7280',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Manage and track your hotel planning projects
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/new-project">
            <button style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            >
              ➕ New Project
            </button>
          </Link>
          <button 
            onClick={handleLogout} 
            style={{
              padding: '14px 24px',
              backgroundColor: 'white',
              color: '#6B7280',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            marginBottom: '8px',
            position: 'relative'
          }}>
            {projects.length}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '600', opacity: 0.9, position: 'relative' }}>
            Total Projects
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            marginBottom: '8px',
            position: 'relative'
          }}>
            {projects.filter(p => p.status === 'Compliant').length}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '600', opacity: 0.9, position: 'relative' }}>
            Compliant
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            marginBottom: '8px',
            position: 'relative'
          }}>
            {projects.reduce((sum, p) => {
              const roomCount = p.model?.data.floorMix
                ? p.model.data.floorMix.reduce((sum: number, f: any) => 
                    sum + Object.values(f.roomsByType).reduce((a: number, b: any) => a + b, 0), 0)
                : 0;
              return sum + roomCount;
            }, 0)}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '600', opacity: 0.9, position: 'relative' }}>
            Total Keys
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            marginBottom: '8px',
            position: 'relative'
          }}>
            {Math.round(projects.filter(p => p.status === 'Compliant').length / projects.length * 100) || 0}%
          </div>
          <div style={{ fontSize: '15px', fontWeight: '600', opacity: 0.9, position: 'relative' }}>
            Completion Rate
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="🔍 Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              border: '2px solid #F3F4F6',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: '#FAFBFC'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#F3F4F6';
              e.target.style.backgroundColor = '#FAFBFC';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter projects by status"
          style={{
            padding: '16px 20px',
            border: '2px solid #F3F4F6',
            borderRadius: '12px',
            fontSize: '15px',
            backgroundColor: '#FAFBFC',
            cursor: 'pointer',
            outline: 'none',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.backgroundColor = 'white';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#F3F4F6';
            e.target.style.backgroundColor = '#FAFBFC';
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
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 140px 160px 100px 120px 100px 80px 60px',
          gap: '20px',
          padding: '20px 32px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '2px solid #F1F5F9',
          fontSize: '12px',
          fontWeight: '700',
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <div>Project Name</div>
          <div>Status</div>
          <div>Location</div>
          <div>Floors</div>
          <div>Total Keys</div>
          <div>Created</div>
          <div>Priority</div>
          <div>Actions</div>
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
            <div key={project.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 160px 100px 120px 100px 80px 60px',
              gap: '20px',
              padding: '24px 32px',
              borderBottom: '1px solid #F8FAFC',
              transition: 'all 0.2s ease',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FAFBFC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            >
              <Link href={`/projects/${project.id}/design`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ cursor: 'pointer' }}>
                  <div style={{ 
                    fontWeight: '700', 
                    color: '#1F2937',
                    fontSize: '15px',
                    marginBottom: '6px'
                  }}>
                    {project.name || 'Untitled Project'}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    {project.model?.data.brandFlag || 'Brand TBD'}
                  </div>
                </div>
              </Link>
              
              <StatusBadge status={project.status} />
              
              <div style={{ 
                fontSize: '14px', 
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500'
              }}>
                <span style={{ fontSize: '16px' }}>📍</span>
                <span>{location}</span>
              </div>
              
              <div style={{ 
                fontSize: '15px', 
                color: '#1F2937',
                fontWeight: '600'
              }}>
                {floors}
              </div>
              
              <div style={{ 
                fontSize: '18px', 
                color: '#1F2937',
                fontWeight: '700'
              }}>
                {roomCount}
              </div>
              
              <div style={{ 
                fontSize: '14px', 
                color: '#6B7280',
                fontWeight: '500'
              }}>
                {date}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PriorityIndicator priority={priority} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={(e) => handleDeleteClick(project, e)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#EF4444',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Delete project"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, project: null })}
        onConfirm={handleDeleteConfirm}
        projectName={deleteModal.project?.name || 'Untitled Project'}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
} 