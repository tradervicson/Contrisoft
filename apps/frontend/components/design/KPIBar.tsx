import React from 'react';
import { useDesignStore } from '../../store/designStore';

const KPIBar: React.FC = () => {
  const { floors, publicAreas } = useDesignStore();

  // Calculate key metrics
  const totalRooms = floors.reduce((total, floor) => 
    total + floor.rooms.reduce((floorTotal, room) => floorTotal + room.quantity, 0), 0
  );

  const totalFloors = floors.length;
  
  const totalPublicAreaSqft = publicAreas.reduce((total, area) => total + area.sizeSqft, 0);
  
  const averageRoomsPerFloor = totalFloors > 0 ? Math.round(totalRooms / totalFloors) : 0;
  
  const estimatedCostPerKey = 120000; // Base cost per room
  const totalEstimatedCost = totalRooms * estimatedCostPerKey + totalPublicAreaSqft * 200; // $200/sqft for public areas

  const kpis = [
    { 
      label: 'Total Rooms', 
      value: totalRooms.toString(), 
      color: 'var(--primary-blue)',
      bgColor: 'var(--primary-blue-light)',
      icon: '🏨'
    },
    { 
      label: 'Floors', 
      value: totalFloors.toString(), 
      color: 'var(--success-green)',
      bgColor: 'var(--success-green-light)',
      icon: '🏢'
    },
    { 
      label: 'Avg Rooms/Floor', 
      value: averageRoomsPerFloor.toString(), 
      color: 'var(--purple)',
      bgColor: 'var(--purple-light)',
      icon: '📊'
    },
    { 
      label: 'Public Area', 
      value: `${totalPublicAreaSqft.toLocaleString()} sqft`, 
      color: 'var(--warning-orange)',
      bgColor: 'var(--warning-orange-light)',
      icon: '🏛️'
    },
    { 
      label: 'Est. Cost', 
      value: `$${(totalEstimatedCost / 1000000).toFixed(1)}M`, 
      color: 'var(--teal)',
      bgColor: 'var(--teal-light)',
      icon: '💰'
    },
  ];

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--gray-200)',
      padding: 'var(--spacing-2xl)',
      marginBottom: 'var(--spacing-lg)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--gray-800)'
        }}>
          Project Overview
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          padding: '6px 12px',
          background: 'var(--success-green-light)',
          color: 'var(--success-green)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--success-green)'
          }} />
          LIVE DATA
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 'var(--spacing-lg)'
      }}>
        {kpis.map((kpi, index) => (
          <div
            key={kpi.label}
            style={{
              background: kpi.bgColor,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-lg)',
              border: `1px solid ${kpi.color}20`,
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '40px',
              opacity: 0.1,
              transform: 'rotate(15deg)'
            }}>
              {kpi.icon}
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              <span style={{ fontSize: '18px' }}>{kpi.icon}</span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: kpi.color,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {kpi.label}
              </span>
            </div>
            
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: kpi.color,
              lineHeight: '1',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {kpi.value}
            </div>
            
            {/* Trend indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontSize: '11px',
              color: 'var(--gray-600)'
            }}>
              <span style={{ color: 'var(--success-green)' }}>↗</span>
              Updated now
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIBar; 