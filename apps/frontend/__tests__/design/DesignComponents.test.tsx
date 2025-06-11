import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import KPIBar from '../../components/design/KPIBar';
import ComplianceChecker from '../../components/design/ComplianceChecker';
import { useDesignStore } from '../../store/designStore';

// Mock the design store
jest.mock('../../store/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

describe('Design Components', () => {
  beforeEach(() => {
    mockUseDesignStore.mockReturnValue({
      floors: [],
      publicAreas: [],
      roomTypes: [],
      geometryConfig: null,
      calculationStatus: 'idle',
      lastModified: null,
      setFloors: jest.fn(),
      addFloor: jest.fn(),
      updateFloor: jest.fn(),
      removeFloor: jest.fn(),
      updateRoomConfiguration: jest.fn(),
      setPublicAreas: jest.fn(),
      updatePublicArea: jest.fn(),
      setGeometryConfig: jest.fn(),
      setCalculationStatus: jest.fn(),
      updateRoomQty: jest.fn(),
    } as any);
  });

  describe('KPIBar', () => {
    it('renders empty state correctly', () => {
      render(<KPIBar />);
      expect(screen.getByText('Project KPIs')).toBeInTheDocument();
      expect(screen.getByText('Total Rooms')).toBeInTheDocument();
      expect(screen.getByText('$0.0M')).toBeInTheDocument();
    });

    it('displays correct KPIs with data', () => {
      mockUseDesignStore.mockReturnValue({
        floors: [
          {
            id: '1',
            name: 'Ground',
            level: 0,
            height: 9,
            floorType: 'standard',
            rooms: [
              { roomTypeId: 'standard-king', quantity: 10, averageSize: 300 },
              { roomTypeId: 'standard-double', quantity: 5, averageSize: 280 },
            ],
            totalArea: 0,
          },
        ],
        publicAreas: [
          { id: 'lobby', areaType: 'Lobby', sizeSqft: 800, isRequired: true, level: 0 },
        ],
        roomTypes: [],
        geometryConfig: null,
        calculationStatus: 'idle',
        lastModified: null,
        setFloors: jest.fn(),
        addFloor: jest.fn(),
        updateFloor: jest.fn(),
        removeFloor: jest.fn(),
        updateRoomConfiguration: jest.fn(),
        setPublicAreas: jest.fn(),
        updatePublicArea: jest.fn(),
        setGeometryConfig: jest.fn(),
        setCalculationStatus: jest.fn(),
        updateRoomQty: jest.fn(),
      } as any);

      render(<KPIBar />);
      
      expect(screen.getByText('Total Rooms')).toBeInTheDocument();
      expect(screen.getByText('Floors')).toBeInTheDocument();
      expect(screen.getByText('800 sqft')).toBeInTheDocument();
      expect(screen.getByText('$2.0M')).toBeInTheDocument();
    });
  });

  describe('ComplianceChecker', () => {
    it('shows no issues for empty hotel', () => {
      render(<ComplianceChecker />);
      expect(screen.getByText('Compliance Check')).toBeInTheDocument();
    });

    it('shows ADA compliance error', () => {
      mockUseDesignStore.mockReturnValue({
        floors: [
          {
            id: '1',
            name: 'Ground',
            level: 0,
            height: 9,
            floorType: 'standard',
            rooms: [
              { roomTypeId: 'standard-king', quantity: 20, averageSize: 300 },
              // No accessible rooms
            ],
            totalArea: 0,
          },
        ],
        publicAreas: [],
        roomTypes: [],
        geometryConfig: null,
        calculationStatus: 'idle',
        lastModified: null,
        setFloors: jest.fn(),
        addFloor: jest.fn(),
        updateFloor: jest.fn(),
        removeFloor: jest.fn(),
        updateRoomConfiguration: jest.fn(),
        setPublicAreas: jest.fn(),
        updatePublicArea: jest.fn(),
        setGeometryConfig: jest.fn(),
        setCalculationStatus: jest.fn(),
        updateRoomQty: jest.fn(),
      } as any);

      render(<ComplianceChecker />);
      
      expect(screen.getByText(/Only.*accessible rooms/)).toBeInTheDocument();
      expect(screen.getByText('❌ 2')).toBeInTheDocument(); // 2 errors: ADA + lobby
    });

    it('shows lobby requirement error', () => {
      mockUseDesignStore.mockReturnValue({
        floors: [
          {
            id: '1',
            name: 'Ground',
            level: 0,
            height: 9,
            floorType: 'standard',
            rooms: [
              { roomTypeId: 'accessible', quantity: 2, averageSize: 320 },
              { roomTypeId: 'standard-king', quantity: 18, averageSize: 300 },
            ],
            totalArea: 0,
          },
        ],
        publicAreas: [], // No lobby
        roomTypes: [],
        geometryConfig: null,
        calculationStatus: 'idle',
        lastModified: null,
        setFloors: jest.fn(),
        addFloor: jest.fn(),
        updateFloor: jest.fn(),
        removeFloor: jest.fn(),
        updateRoomConfiguration: jest.fn(),
        setPublicAreas: jest.fn(),
        updatePublicArea: jest.fn(),
        setGeometryConfig: jest.fn(),
        setCalculationStatus: jest.fn(),
        updateRoomQty: jest.fn(),
      } as any);

      render(<ComplianceChecker />);
      
      expect(screen.getByText(/No lobby configured/)).toBeInTheDocument();
    });
  });
}); 