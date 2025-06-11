import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  DesignState,
  Floor,
  RoomConfiguration,
  PublicArea,
  GeometryConfig,
  CalculationStatus,
} from '../types/design';
import { ROOM_TYPES } from '../constants/design';

interface DesignActions {
  setFloors: (floors: Floor[]) => void;
  addFloor: (floor: Floor) => void;
  updateFloor: (floorId: string, updates: Partial<Floor>) => void;
  removeFloor: (floorId: string) => void;

  updateRoomConfiguration: (
    floorId: string,
    roomTypeId: string,
    config: Partial<RoomConfiguration>
  ) => void;

  setPublicAreas: (areas: PublicArea[]) => void;
  updatePublicArea: (areaId: string, updates: Partial<PublicArea>) => void;

  setGeometryConfig: (config: GeometryConfig) => void;
  setCalculationStatus: (status: CalculationStatus) => void;

  updateRoomQty: (floorId: string, roomTypeId: string, quantity: number) => void;
}

export const useDesignStore = create<DesignState & DesignActions>()(
  devtools((set, get) => ({
    floors: [],
    roomTypes: ROOM_TYPES,
    publicAreas: [],
    geometryConfig: null,
    calculationStatus: 'idle',
    lastModified: null,

    // Actions
    setFloors: (floors) => set({ floors, lastModified: new Date() }),
    addFloor: (floor) =>
      set((state) => ({
        floors: [...state.floors, floor],
        lastModified: new Date(),
      })),
    updateFloor: (floorId, updates) =>
      set((state) => ({
        floors: state.floors.map((f) =>
          f.id === floorId ? { ...f, ...updates } : f
        ),
        lastModified: new Date(),
      })),
    removeFloor: (floorId) =>
      set((state) => ({
        floors: state.floors.filter((f) => f.id !== floorId),
        lastModified: new Date(),
      })),

    updateRoomConfiguration: (floorId, roomTypeId, config) =>
      set((state) => ({
        floors: state.floors.map((f) =>
          f.id === floorId
            ? {
                ...f,
                rooms: f.rooms.map((r) =>
                  r.roomTypeId === roomTypeId ? { ...r, ...config } : r
                ),
              }
            : f
        ),
        lastModified: new Date(),
      })),

    setPublicAreas: (areas) => set({ publicAreas: areas, lastModified: new Date() }),
    updatePublicArea: (areaId, updates) =>
      set((state) => ({
        publicAreas: state.publicAreas.map((a) =>
          a.id === areaId ? { ...a, ...updates } : a
        ),
        lastModified: new Date(),
      })),

    setGeometryConfig: (config) => set({ geometryConfig: config }),
    setCalculationStatus: (status) => set({ calculationStatus: status }),

    updateRoomQty: (floorId, roomTypeId, quantity) =>
      set((state) => ({
        floors: state.floors.map((f) => {
          if (f.id !== floorId) return f;
          const existing = f.rooms.find((r) => r.roomTypeId === roomTypeId);
          let newRooms;
          if (existing) {
            newRooms = f.rooms.map((r) =>
              r.roomTypeId === roomTypeId ? { ...r, quantity } : r
            );
          } else {
            newRooms = [
              ...f.rooms,
              { roomTypeId, quantity, averageSize: 0 },
            ];
          }
          return { ...f, rooms: newRooms };
        }),
      })),
  }))
); 