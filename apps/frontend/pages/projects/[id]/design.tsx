import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useDesignStore } from '../../../store/designStore';
import FloorManager from '../../../components/design/FloorManager';
import RoomGrid from '../../../components/design/RoomGrid';
import PublicAreasManager from '../../../components/design/PublicAreasManager';
import KPIBar from '../../../components/design/KPIBar';
import ComplianceChecker from '../../../components/design/ComplianceChecker';
import BulkEditor from '../../../components/design/BulkEditor';
import GeometryVisualization from '../../../components/design/GeometryVisualization';
import ExportTools from '../../../components/design/ExportTools';
import { v4 as uuidv4 } from 'uuid';

const DesignTab: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    setFloors,
    setPublicAreas,
    setGeometryConfig,
    floors,
    publicAreas,
  } = useDesignStore();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'compliance' | 'visualization' | 'export'>('design');

  const handleSave = async () => {
    if (!id || Array.isArray(id)) return;
    setSaving(true);

    try {
      // Upsert floors
      for (const floor of floors) {
        if (!floor.id) floor.id = uuidv4();
        const { error } = await supabase.from('floors').upsert({
          id: floor.id,
          project_id: id,
          name: floor.name,
          level: floor.level,
          height: floor.height,
          floor_type: floor.floorType,
        });
        if (error) console.error('floor save error', error);

        // room configs
        for (const room of floor.rooms) {
          const { error: rcErr } = await supabase.from('room_configurations').upsert({
            id: uuidv4(),
            floor_id: floor.id,
            room_type: room.roomTypeId,
            quantity: room.quantity,
            average_size: room.averageSize,
          });
          if (rcErr) console.error('room config save error', rcErr);
        }
      }

      // Public areas
      for (const area of publicAreas) {
        const { error } = await supabase.from('public_areas').upsert({
          id: area.id || uuidv4(),
          project_id: id,
          area_type: area.areaType,
          size_sqft: area.sizeSqft,
          is_required: area.isRequired,
          level: area.level,
        });
        if (error) console.error('public area save error', error);
      }

      alert('Design saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving design. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Fetch design data on mount
  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const fetchDesign = async () => {
      const { data: floorsData, error } = await supabase
        .from('floors')
        .select('*')
        .eq('project_id', id)
        .order('level');

      if (error) {
        console.error('Error fetching design', error);
        return;
      }

      // For now, load floors and empty arrays if none
      setFloors((floorsData as any) || []);
    };

    fetchDesign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tabs = [
    { key: 'design', label: 'Design', icon: '🏗️', color: 'var(--primary-blue)' },
    { key: 'compliance', label: 'Compliance', icon: '✅', color: 'var(--success-green)' },
    { key: 'visualization', label: '3D View', icon: '🏢', color: 'var(--purple)' },
    { key: 'export', label: 'Export', icon: '📤', color: 'var(--teal)' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--gray-50)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--gray-200)',
        padding: '0 var(--spacing-2xl)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <button
              onClick={() => router.push('/projects')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                background: 'transparent',
                border: 'none',
                color: 'var(--gray-600)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gray-100)';
                e.currentTarget.style.color = 'var(--gray-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--gray-600)';
              }}
            >
              ← Back to Projects
            </button>
            <div style={{ height: '24px', width: '1px', background: 'var(--gray-200)' }} />
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--gray-800)',
                lineHeight: '1.2'
              }}>
                Hotel Design Studio
              </h1>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--gray-500)',
                fontWeight: '400'
              }}>
                Project {id}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-success"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </>
            ) : (
              <>
                💾 Save Design
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--spacing-2xl)' }}>
        {/* KPI Bar */}
        <div style={{ margin: 'var(--spacing-lg) 0' }}>
          <KPIBar />
        </div>

        {/* Main Content */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)',
          overflow: 'hidden'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--gray-200)',
            background: 'var(--gray-50)'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-lg)',
                  border: 'none',
                  background: activeTab === tab.key ? 'var(--white)' : 'transparent',
                  color: activeTab === tab.key ? tab.color : 'var(--gray-600)',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.key ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : '3px solid transparent',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'var(--white)';
                    e.currentTarget.style.color = tab.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--gray-600)';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: 'var(--spacing-2xl)' }}>
            {activeTab === 'design' && (
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--spacing-2xl)' }}>
                {/* Left Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                  <FloorManager />
                  <PublicAreasManager />
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                  <RoomGrid />
                  <BulkEditor />
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div style={{ maxWidth: '800px' }}>
                <ComplianceChecker />
              </div>
            )}

            {activeTab === 'visualization' && (
              <div style={{ maxWidth: '1000px' }}>
                <GeometryVisualization />
              </div>
            )}

            {activeTab === 'export' && (
              <div style={{ maxWidth: '600px' }}>
                <ExportTools />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-lg) 0',
          fontSize: '12px',
          color: 'var(--gray-500)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: floors.length > 0 ? 'var(--success-green)' : 'var(--gray-300)'
            }} />
            Last modified: {floors.length > 0 ? 'Just now' : 'Never'}
          </div>
          <div style={{ color: 'var(--gray-300)' }}>•</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: saving ? 'var(--warning-orange)' : 'var(--success-green)'
            }} />
            Auto-save: {saving ? 'Saving...' : 'Ready'}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DesignTab; 