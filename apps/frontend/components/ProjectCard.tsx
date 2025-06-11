import React from 'react';
import Link from 'next/link';

export interface Project {
  id: string;
  name?: string;
  status: 'Draft' | 'Needs Re-calc' | 'Costs Ready' | 'Compliant';
  created_at: string;
  model?: { data: any };
}

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<string, string> = {
  Draft: 'var(--secondary-gray)',
  'Needs Re-calc': 'var(--warning-orange)',
  'Costs Ready': 'var(--success-green)',
  Compliant: 'var(--primary-blue)'
};

const statusIcons: Record<string, string> = {
  Draft: '📝',
  'Needs Re-calc': '🔄',
  'Costs Ready': '💰',
  Compliant: '✅'
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const date = new Date(project.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const statusColor = statusColors[project.status] || statusColors.Draft;
  const statusIcon = statusIcons[project.status] || statusIcons.Draft;
  const roomCount = project.model?.data.floorMix
    ? project.model.data.floorMix.reduce((sum: number, f: any) => sum + Object.values(f.roomsByType).reduce((a: number, b: any) => a + b, 0), 0)
    : 0;

  const location = project.model?.data.siteLocation || 'Location TBD';
  const brand = project.model?.data.brandFlag || 'Brand TBD';
  const floors = project.model?.data.floorCount || 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <div
        className="card"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          height: '280px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--dark-gray)',
              lineHeight: '1.3'
            }}>
              {project.name || 'Untitled Project'}
            </h3>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: '0.9rem', 
              color: 'var(--secondary-gray)' 
            }}>
              {date}
            </p>
          </div>
          <div
            style={{
              padding: '0.5rem 0.75rem',
              background: statusColor,
              color: 'var(--white)',
              borderRadius: 'var(--border-radius)',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>{statusIcon}</span>
            <span>{project.status}</span>
          </div>
        </div>

        {/* Project Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>📍</span>
            <span style={{ color: 'var(--secondary-gray)', fontSize: '0.9rem' }}>{location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>🏢</span>
            <span style={{ color: 'var(--secondary-gray)', fontSize: '0.9rem' }}>{brand}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>🏗️</span>
            <span style={{ color: 'var(--secondary-gray)', fontSize: '0.9rem' }}>{floors} floors</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem 0 0 0',
          borderTop: '1px solid var(--medium-gray)'
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: 'var(--primary-blue)'
          }}>
            {roomCount}
          </div>
          <div style={{ 
            fontSize: '0.9rem',
            color: 'var(--secondary-gray)',
            fontWeight: '500'
          }}>
            Total Keys
          </div>
        </div>
      </div>
    </Link>
  );
} 