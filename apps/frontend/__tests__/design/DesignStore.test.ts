import { useDesignStore } from '../../store/designStore';
import { act, renderHook } from '@testing-library/react';

describe('DesignStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useDesignStore());
    act(() => {
      result.current.setFloors([]);
      result.current.setPublicAreas([]);
    });
  });

  it('should add a floor', () => {
    const { result } = renderHook(() => useDesignStore());
    
    const newFloor = {
      id: 'floor-1',
      name: 'Ground Floor',
      level: 0,
      height: 9,
      floorType: 'standard' as const,
      rooms: [],
      totalArea: 0,
    };

    act(() => {
      result.current.addFloor(newFloor);
    });

    expect(result.current.floors).toHaveLength(1);
    expect(result.current.floors[0]).toEqual(newFloor);
  });

  it('should update room quantity', () => {
    const { result } = renderHook(() => useDesignStore());
    
    const floor = {
      id: 'floor-1',
      name: 'Ground Floor',
      level: 0,
      height: 9,
      floorType: 'standard' as const,
      rooms: [],
      totalArea: 0,
    };

    act(() => {
      result.current.addFloor(floor);
      result.current.updateRoomQty('floor-1', 'standard-king', 5);
    });

    expect(result.current.floors[0].rooms).toHaveLength(1);
    expect(result.current.floors[0].rooms[0].quantity).toBe(5);
    expect(result.current.floors[0].rooms[0].roomTypeId).toBe('standard-king');
  });

  it('should remove a floor', () => {
    const { result } = renderHook(() => useDesignStore());
    
    const floor = {
      id: 'floor-1',
      name: 'Ground Floor',
      level: 0,
      height: 9,
      floorType: 'standard' as const,
      rooms: [],
      totalArea: 0,
    };

    act(() => {
      result.current.addFloor(floor);
      result.current.removeFloor('floor-1');
    });

    expect(result.current.floors).toHaveLength(0);
  });

  it('should manage public areas', () => {
    const { result } = renderHook(() => useDesignStore());
    
    const publicArea = {
      id: 'lobby-1',
      areaType: 'Lobby',
      sizeSqft: 800,
      isRequired: true,
      level: 0,
    };

    act(() => {
      result.current.setPublicAreas([publicArea]);
    });

    expect(result.current.publicAreas).toHaveLength(1);
    expect(result.current.publicAreas[0]).toEqual(publicArea);

    act(() => {
      result.current.updatePublicArea('lobby-1', { sizeSqft: 1000 });
    });

    expect(result.current.publicAreas[0].sizeSqft).toBe(1000);
  });
}); 