import React, { useState } from 'react';
import { useDesignStore } from '../../store/designStore';

const ExportTools: React.FC = () => {
  const { floors, publicAreas } = useDesignStore();
  const [isExporting, setIsExporting] = useState(false);

  const generateSummaryReport = () => {
    const totalRooms = floors.reduce((total, floor) => 
      total + floor.rooms.reduce((floorTotal, room) => floorTotal + room.quantity, 0), 0
    );

    const roomBreakdown = floors.reduce((breakdown, floor) => {
      floor.rooms.forEach(room => {
        if (room.quantity > 0) {
          breakdown[room.roomTypeId] = (breakdown[room.roomTypeId] || 0) + room.quantity;
        }
      });
      return breakdown;
    }, {} as Record<string, number>);

    const totalPublicArea = publicAreas.reduce((total, area) => total + area.sizeSqft, 0);

    return {
      projectSummary: {
        totalFloors: floors.length,
        totalRooms,
        totalPublicAreaSqft: totalPublicArea,
        estimatedCost: totalRooms * 120000 + totalPublicArea * 200,
      },
      roomBreakdown,
      floorDetails: floors.map(floor => ({
        name: floor.name,
        level: floor.level,
        height: floor.height,
        roomCount: floor.rooms.reduce((sum, room) => sum + room.quantity, 0),
        rooms: floor.rooms.filter(r => r.quantity > 0),
      })),
      publicAreas: publicAreas.map(area => ({
        type: area.areaType,
        size: area.sizeSqft,
        required: area.isRequired,
      })),
    };
  };

  const exportToJson = () => {
    const data = generateSummaryReport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hotel-design-summary.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCsv = () => {
    const data = generateSummaryReport();
    let csv = 'Floor,Level,Height,Room Type,Quantity\n';
    
    data.floorDetails.forEach(floor => {
      floor.rooms.forEach(room => {
        csv += `${floor.name},${floor.level},${floor.height},${room.roomTypeId},${room.quantity}\n`;
      });
    });

    csv += '\nPublic Area,Size (sqft),Required\n';
    data.publicAreas.forEach(area => {
      csv += `${area.type},${area.size},${area.required}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hotel-design-details.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = async () => {
    setIsExporting(true);
    
    try {
      const data = generateSummaryReport();
      
      // Generate a simple HTML report
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hotel Design Report</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .kpi-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
            .kpi-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .kpi-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hotel Design Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Project Summary</h2>
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-value">${data.projectSummary.totalFloors}</div>
                <div class="kpi-label">Total Floors</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">${data.projectSummary.totalRooms}</div>
                <div class="kpi-label">Total Rooms</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">${data.projectSummary.totalPublicAreaSqft.toLocaleString()}</div>
                <div class="kpi-label">Public Area (sqft)</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">$${(data.projectSummary.estimatedCost / 1000000).toFixed(1)}M</div>
                <div class="kpi-label">Estimated Cost</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Room Mix</h2>
            <table>
              <tr><th>Room Type</th><th>Quantity</th><th>Percentage</th></tr>
              ${Object.entries(data.roomBreakdown).map(([type, qty]) => `
                <tr>
                  <td>${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td>${qty}</td>
                  <td>${((qty / data.projectSummary.totalRooms) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Floor Details</h2>
            <table>
              <tr><th>Floor</th><th>Level</th><th>Height</th><th>Rooms</th></tr>
              ${data.floorDetails.map(floor => `
                <tr>
                  <td>${floor.name}</td>
                  <td>${floor.level}</td>
                  <td>${floor.height}ft</td>
                  <td>${floor.roomCount}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Public Areas</h2>
            <table>
              <tr><th>Area Type</th><th>Size (sqft)</th><th>Required</th></tr>
              ${data.publicAreas.map(area => `
                <tr>
                  <td>${area.type}</td>
                  <td>${area.size.toLocaleString()}</td>
                  <td>${area.required ? 'Yes' : 'No'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hotel-design-report.html';
      link.click();
      URL.revokeObjectURL(url);
      
    } finally {
      setIsExporting(false);
    }
  };

  if (floors.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Export Tools</h3>
        <p className="text-gray-500 text-sm">Add floors to enable export functionality</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Export Tools</h3>
      <div className="space-y-3">
        <button
          onClick={generateReport}
          disabled={isExporting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isExporting ? 'Generating...' : '📄 Generate PDF Report'}
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={exportToJson}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            💾 Export JSON
          </button>
          <button
            onClick={exportToCsv}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            📊 Export CSV
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <p>• JSON: Full project data for backup/restore</p>
          <p>• CSV: Spreadsheet-friendly room data</p>
          <p>• HTML Report: Printable summary document</p>
        </div>
      </div>
    </div>
  );
};

export default ExportTools; 