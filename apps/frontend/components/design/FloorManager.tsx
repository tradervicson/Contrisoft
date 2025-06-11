import React, { useState } from 'react';
import { useDesignStore } from '../../store/designStore';
import { v4 as uuidv4 } from 'uuid';

const FloorManager: React.FC = () => {
  const { floors, addFloor, updateFloor, removeFloor } = useDesignStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');

  const handleAdd = () => {
    if (!newFloorName.trim()) return;
    const level = floors.length; // append to end
    addFloor({
      id: uuidv4(),
      name: newFloorName,
      level,
      height: 9,
      floorType: 'standard',
      rooms: [],
      totalArea: 0,
    } as any);
    setNewFloorName('');
    setShowAdd(false);
  };

  const moveFloor = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= floors.length) return;
    const updated = [...floors];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    // Re-level indices
    updated.forEach((f, idx) => (f.level = idx));
    useDesignStore.setState({ floors: updated });
  };

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--gray-100)',
        background: 'var(--gray-50)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <span style={{ fontSize: '18px' }}>🏢</span>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--gray-800)'
            }}>
              Floors
            </h3>
            <div style={{
              background: 'var(--primary-blue-light)',
              color: 'var(--primary-blue)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {floors.length}
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontSize: '12px'
            }}
          >
            + Add Floor
          </button>
        </div>
      </div>

      {/* Floor List */}
      <div style={{ padding: 'var(--spacing-md)' }}>
        {floors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            color: 'var(--gray-500)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>🏗️</div>
            <p style={{ margin: 0, fontSize: '14px' }}>No floors added yet</p>
            <p style={{ margin: 0, fontSize: '12px', marginTop: 'var(--spacing-xs)' }}>
              Click "Add Floor" to get started
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {floors.map((floor, idx) => {
              const roomCount = floor.rooms.reduce((sum, room) => sum + room.quantity, 0);
              return (
                <div
                  key={floor.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-md)',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-blue-light)';
                    e.currentTarget.style.borderColor = 'var(--primary-blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--gray-50)';
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary-blue)',
                      color: 'var(--white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--gray-800)',
                        marginBottom: '2px'
                      }}>
                        {floor.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--gray-500)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                      }}>
                        <span>{floor.floorType}</span>
                        <span>•</span>
                        <span>{floor.height}ft</span>
                        <span>•</span>
                        <span>{roomCount} rooms</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <button
                      onClick={() => moveFloor(idx, -1)}
                      disabled={idx === 0}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: idx === 0 ? 'var(--gray-200)' : 'var(--white)',
                        color: idx === 0 ? 'var(--gray-400)' : 'var(--gray-600)',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        if (idx !== 0) {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (idx !== 0) {
                          e.currentTarget.style.background = 'var(--white)';
                        }
                      }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveFloor(idx, 1)}
                      disabled={idx === floors.length - 1}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: idx === floors.length - 1 ? 'var(--gray-200)' : 'var(--white)',
                        color: idx === floors.length - 1 ? 'var(--gray-400)' : 'var(--gray-600)',
                        cursor: idx === floors.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        if (idx !== floors.length - 1) {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (idx !== floors.length - 1) {
                          e.currentTarget.style.background = 'var(--white)';
                        }
                      }}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeFloor(floor.id)}
                      className="btn btn-danger btn-sm"
                      style={{
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Floor Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-2xl)',
            width: '400px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--gray-200)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <span style={{ fontSize: '24px' }}>🏢</span>
              <h4 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--gray-800)'
              }}>
                Add New Floor
              </h4>
            </div>
            
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                Floor Name
              </label>
              <input
                type="text"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                className="input"
                placeholder="e.g. Ground Floor, Mezzanine, 2nd Floor"
                style={{ fontSize: '14px' }}
                autoFocus
              />
            </div>
            
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowAdd(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="btn btn-primary"
                disabled={!newFloorName.trim()}
              >
                Add Floor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorManager; 