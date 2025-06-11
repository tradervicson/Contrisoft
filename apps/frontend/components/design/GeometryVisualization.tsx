import React, { useRef, useEffect } from 'react';
import { useDesignStore } from '../../store/designStore';

const GeometryVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { floors, publicAreas } = useDesignStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (floors.length === 0) {
      // Draw placeholder
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Add floors to see visualization', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Draw floors as stacked rectangles (isometric-ish view)
    const floorHeight = 30;
    const floorWidth = 200;
    const floorDepth = 120;
    const offsetX = 50;
    const offsetY = 50;

    floors.forEach((floor, index) => {
      const y = canvas.height - offsetY - (index + 1) * floorHeight;
      const x = offsetX + index * 10; // Slight offset for 3D effect

      // Floor shadow/depth
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(x + 8, y + 8, floorWidth, floorHeight);

      // Main floor
      const totalRooms = floor.rooms.reduce((sum, room) => sum + room.quantity, 0);
      const intensity = Math.min(totalRooms / 30, 1); // Color intensity based on room count
      const greenValue = Math.floor(100 + intensity * 155);
      ctx.fillStyle = `rgb(59, ${greenValue}, 59)`;
      ctx.fillRect(x, y, floorWidth, floorHeight);

      // Floor outline
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, floorWidth, floorHeight);

      // Floor label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${floor.name} (${totalRooms} rooms)`, x + 10, y + 20);

      // Room type indicators (small colored squares)
      let roomX = x + 10;
      floor.rooms.forEach((room, roomIndex) => {
        if (room.quantity > 0) {
          const roomColor = getRoomTypeColor(room.roomTypeId);
          ctx.fillStyle = roomColor;
          const roomWidth = Math.max(room.quantity * 2, 4);
          ctx.fillRect(roomX, y + 25, roomWidth, 3);
          roomX += roomWidth + 2;
        }
      });
    });

    // Draw public areas at ground level
    if (publicAreas.length > 0) {
      const groundY = canvas.height - offsetY - 60;
      let areaX = offsetX + floorWidth + 30;
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.fillText('Public Areas:', areaX, groundY - 10);

      publicAreas.forEach((area, index) => {
        const areaY = groundY + index * 25;
        const areaWidth = Math.max(area.sizeSqft / 50, 20); // Scale based on size
        
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(areaX, areaY, areaWidth, 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.fillText(`${area.areaType} (${area.sizeSqft}sf)`, areaX + 5, areaY + 13);
      });
    }

  }, [floors, publicAreas]);

  const getRoomTypeColor = (roomTypeId: string): string => {
    const colors: Record<string, string> = {
      'standard-king': '#3b82f6',
      'standard-double': '#10b981',
      'suite': '#f59e0b',
      'accessible': '#ef4444',
    };
    return colors[roomTypeId] || '#6b7280';
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Hotel Stack View</h3>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>King</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Double</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Suite</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Accessible</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        className="border rounded w-full"
        style={{ maxHeight: '400px' }}
      />
      <div className="mt-2 text-xs text-gray-600">
        Each floor shows room count and mix. Darker green = more rooms.
      </div>
    </div>
  );
};

export default GeometryVisualization; 