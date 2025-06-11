import React from 'react';
import { useDesignStore } from '../../store/designStore';
import { ROOM_TYPES } from '../../constants/design';

const RoomGrid: React.FC = () => {
  const { floors, updateRoomQty } = useDesignStore();

  if (floors.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">Rooms</h3>
      {/* Very simple stub grid */}
      <table className="min-w-full text-sm border">
        <thead>
          <tr>
            <th className="px-2 py-1 border">Floor</th>
            {ROOM_TYPES.map((rt) => (
              <th key={rt.id} className="px-2 py-1 border">
                {rt.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {floors.map((floor) => (
            <tr key={floor.id} className="text-center">
              <td className="border px-2 py-1">{floor.name}</td>
              {ROOM_TYPES.map((rt) => {
                const roomConfig = floor.rooms.find(
                  (r) => r.roomTypeId === rt.id
                );
                const qty = roomConfig?.quantity ?? 0;
                return (
                  <td key={rt.id} className="border px-1 py-1">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        className="px-2 bg-gray-200 rounded"
                        onClick={() =>
                          updateRoomQty(floor.id, rt.id, Math.max(qty - 1, 0))
                        }
                      >
                        -
                      </button>
                      <span className="w-6 text-center inline-block">{qty}</span>
                      <button
                        className="px-2 bg-gray-200 rounded"
                        onClick={() =>
                          updateRoomQty(
                            floor.id,
                            rt.id,
                            qty + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomGrid; 