import React from 'react';

interface BuildSheetProps {
  summary: { label: string; value: string }[];
}

const BuildSheet: React.FC<BuildSheetProps> = ({ summary }) => {
  return (
    <div className="w-72 border-l px-4 py-2 bg-gray-50 overflow-y-auto">
      <h4 className="font-semibold mb-2">Build Sheet</h4>
      <ul className="space-y-1 text-sm">
        {summary.map((item) => (
          <li key={item.label} className="flex justify-between">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuildSheet; 