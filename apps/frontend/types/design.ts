export interface Position2D {
  x: number;
  y: number;
}

export interface RoomType {
  id: string;
  name: string;
  color?: string; // Optional color code for visualization
}

export interface RoomConfiguration {
  roomTypeId: string;
  quantity: number;
  averageSize: number;
  positioning?: Position2D[];
}

export type FloorType = 'standard' | 'penthouse' | 'mechanical';

export interface Floor {
  id: string;
  name: string;
  level: number;
  height: number;
  floorType: FloorType;
  rooms: RoomConfiguration[];
  totalArea: number;
}

export interface PublicArea {
  id: string;
  areaType: string;
  sizeSqft: number;
  isRequired: boolean;
  level: number;
}

export interface GeometryConfig {
  floorPlanData: any; // TODO – define stronger typing once geometry editor stabilises
  viewSettings: any;
}

export type CalculationStatus = 'idle' | 'calculating' | 'complete' | 'error';

export interface DesignState {
  floors: Floor[];
  roomTypes: RoomType[];
  publicAreas: PublicArea[];
  geometryConfig: GeometryConfig | null;
  calculationStatus: CalculationStatus;
  lastModified: Date | null;
} 