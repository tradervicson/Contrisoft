import React from 'react';
import { useDesignStore } from '../../store/designStore';
import { PUBLIC_AREA_TYPES } from '../../constants/design';

const PublicAreasManager: React.FC = () => {
  const { publicAreas, updatePublicArea, setPublicAreas } = useDesignStore();

  const handleToggle = (areaId: string, checked: boolean) => {
    if (checked) {
      // add area with default size
      const type = PUBLIC_AREA_TYPES.find((a) => a.id === areaId);
      if (!type) return;
      setPublicAreas([
        ...publicAreas,
        {
          id: areaId,
          areaType: type.name,
          sizeSqft: type.defaultSize,
          isRequired: type.required,
          level: 0,
        } as any,
      ]);
    } else {
      // remove
      setPublicAreas(publicAreas.filter((a) => a.id !== areaId));
    }
  };

  const handleSizeChange = (areaId: string, size: number) => {
    updatePublicArea(areaId, { sizeSqft: size });
  };

  const isSelected = (areaId: string) => publicAreas.some((a) => a.id === areaId);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Public Areas</h3>
      {PUBLIC_AREA_TYPES.map((areaType) => (
        <div key={areaType.id} className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            aria-label={`Enable ${areaType.name}`}
            checked={isSelected(areaType.id)}
            onChange={(e) => handleToggle(areaType.id, e.target.checked)}
          />
          <label className="text-sm flex-1">{areaType.name}</label>
          {isSelected(areaType.id) && (
            <input
              type="range"
              aria-label={`${areaType.name} size in sqft`}
              min={areaType.min}
              max={areaType.max}
              value={
                publicAreas.find((a) => a.id === areaType.id)?.sizeSqft ??
                areaType.defaultSize
              }
              onChange={(e) =>
                handleSizeChange(areaType.id, Number(e.target.value))
              }
            />
          )}
          {isSelected(areaType.id) && (
            <span className="text-xs w-16 text-right">
              {publicAreas.find((a) => a.id === areaType.id)?.sizeSqft ||
                areaType.defaultSize}{' '}
              sqft
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PublicAreasManager; 