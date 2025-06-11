import React from 'react';
import { useDesignStore } from '../../store/designStore';

interface ComplianceIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  recommendation?: string;
}

const ComplianceChecker: React.FC = () => {
  const { floors, publicAreas } = useDesignStore();

  const checkCompliance = (): ComplianceIssue[] => {
    const issues: ComplianceIssue[] = [];
    
    const totalRooms = floors.reduce((total, floor) => 
      total + floor.rooms.reduce((floorTotal, room) => floorTotal + room.quantity, 0), 0
    );

    // ADA Compliance - 5% accessible rooms minimum
    const accessibleRooms = floors.reduce((total, floor) => {
      const accessible = floor.rooms.find(r => r.roomTypeId === 'accessible');
      return total + (accessible?.quantity || 0);
    }, 0);
    
    const accessiblePercentage = totalRooms > 0 ? (accessibleRooms / totalRooms) * 100 : 0;
    
    if (accessiblePercentage < 5) {
      issues.push({
        type: 'error',
        message: `Only ${accessiblePercentage.toFixed(1)}% accessible rooms (${accessibleRooms}/${totalRooms})`,
        recommendation: 'ADA requires minimum 5% accessible rooms'
      });
    }

    // Fire safety - Maximum rooms per floor
    floors.forEach((floor, idx) => {
      const floorRooms = floor.rooms.reduce((sum, room) => sum + room.quantity, 0);
      if (floorRooms > 100) {
        issues.push({
          type: 'warning',
          message: `Floor ${floor.name} has ${floorRooms} rooms`,
          recommendation: 'Consider fire safety requirements for high room counts'
        });
      }
    });

    // Building height considerations
    if (floors.length > 4) {
      const hasElevator = publicAreas.some(area => area.areaType.toLowerCase().includes('elevator'));
      if (!hasElevator) {
        issues.push({
          type: 'warning',
          message: `${floors.length} floors without elevator access`,
          recommendation: 'Buildings over 4 floors typically require elevator access'
        });
      }
    }

    // Lobby requirement
    const hasLobby = publicAreas.some(area => area.id === 'lobby');
    if (!hasLobby) {
      issues.push({
        type: 'error',
        message: 'No lobby configured',
        recommendation: 'Hotels require a main lobby area'
      });
    }

    // Parking estimate
    if (totalRooms > 0) {
      const estimatedParkingSpaces = Math.ceil(totalRooms * 1.2); // 1.2 spaces per room
      issues.push({
        type: 'info',
        message: `Estimated parking needed: ${estimatedParkingSpaces} spaces`,
        recommendation: 'Plan for adequate parking based on local requirements'
      });
    }

    return issues;
  };

  const issues = checkCompliance();
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'error': return { icon: '❌', color: 'text-red-600 bg-red-50 border-red-200' };
      case 'warning': return { icon: '⚠️', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      default: return { icon: 'ℹ️', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Compliance Check</h3>
        <div className="flex space-x-3 text-sm">
          {errorCount > 0 && <span className="text-red-600">❌ {errorCount}</span>}
          {warningCount > 0 && <span className="text-yellow-600">⚠️ {warningCount}</span>}
          {errorCount === 0 && warningCount === 0 && <span className="text-green-600">✅ All good</span>}
        </div>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {issues.length === 0 ? (
          <p className="text-gray-500 text-sm">No compliance issues detected</p>
        ) : (
          issues.map((issue, idx) => {
            const { icon, color } = getIconAndColor(issue.type);
            return (
              <div key={idx} className={`border rounded p-2 ${color}`}>
                <div className="flex items-start space-x-2">
                  <span>{icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue.message}</p>
                    {issue.recommendation && (
                      <p className="text-xs mt-1 opacity-80">{issue.recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ComplianceChecker; 