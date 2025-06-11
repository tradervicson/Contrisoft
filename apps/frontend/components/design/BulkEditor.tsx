import React, { useState } from 'react';
import { useDesignStore } from '../../store/designStore';
import { ROOM_TYPES } from '../../constants/design';

const BulkEditor: React.FC = () => {
  const { floors, updateRoomQty } = useDesignStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [roomConfig, setRoomConfig] = useState<Record<string, number>>({});

  const handleFloorToggle = (floorId: string) => {
    setSelectedFloors(prev => 
      prev.includes(floorId) 
        ? prev.filter(id => id !== floorId)
        : [...prev, floorId]
    );
  };

  const handleRoomQtyChange = (roomTypeId: string, quantity: number) => {
    setRoomConfig(prev => ({ ...prev, [roomTypeId]: quantity }));
  };

  const applyBulkChanges = () => {
    selectedFloors.forEach(floorId => {
      Object.entries(roomConfig).forEach(([roomTypeId, quantity]) => {
        if (quantity > 0) {
          updateRoomQty(floorId, roomTypeId, quantity);
        }
      });
    });
    
    // Reset
    setSelectedFloors([]);
    setRoomConfig({});
    setIsOpen(false);
  };

  const selectAllTypicalFloors = () => {
    const typicalFloors = floors.filter(f => f.floorType === 'standard').map(f => f.id);
    setSelectedFloors(typicalFloors);
  };

  if (floors.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Bulk Editor</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          {isOpen ? 'Close' : 'Open Bulk Editor'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Floor Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Select Floors</h4>
              <button
                onClick={selectAllTypicalFloors}
                className="text-sm text-blue-600 hover:underline"
              >
                Select All Standard
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {floors.map(floor => (
                <label key={floor.id} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFloors.includes(floor.id)}
                    onChange={() => handleFloorToggle(floor.id)}
                  />
                  <span>{floor.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Room Configuration */}
          {selectedFloors.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Room Mix (apply to {selectedFloors.length} floors)</h4>
              <div className="grid grid-cols-2 gap-3">
                {ROOM_TYPES.map(roomType => (
                  <div key={roomType.id} className="flex items-center space-x-2">
                    <label className="text-sm flex-1">{roomType.name}</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={roomConfig[roomType.id] || 0}
                      onChange={(e) => handleRoomQtyChange(roomType.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      aria-label={`${roomType.name} quantity`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presets */}
          <div>
            <h4 className="font-medium mb-2">Quick Presets</h4>
            <div className="flex space-x-2 flex-wrap gap-2">
              <button
                onClick={() => setRoomConfig({
                  'standard-king': 8,
                  'standard-double': 4,
                  'suite': 1,
                  'accessible': 1
                })}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Small Floor (14 rooms)
              </button>
              <button
                onClick={() => setRoomConfig({
                  'standard-king': 12,
                  'standard-double': 8,
                  'suite': 2,
                  'accessible': 2
                })}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Medium Floor (24 rooms)
              </button>
              <button
                onClick={() => setRoomConfig({
                  'standard-king': 16,
                  'standard-double': 12,
                  'suite': 3,
                  'accessible': 3
                })}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Large Floor (34 rooms)
              </button>
            </div>
          </div>

          {/* Apply Button */}
          {selectedFloors.length > 0 && Object.keys(roomConfig).length > 0 && (
            <div className="pt-3 border-t">
              <button
                onClick={applyBulkChanges}
                className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium"
              >
                Apply to {selectedFloors.length} Floor{selectedFloors.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkEditor; 