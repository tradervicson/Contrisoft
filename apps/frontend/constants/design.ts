export const ROOM_TYPES = [
  {
    id: 'standard-king',
    name: 'Standard King',
  },
  {
    id: 'standard-double',
    name: 'Standard Double',
  },
  {
    id: 'suite',
    name: 'Suite',
  },
  {
    id: 'accessible',
    name: 'Accessible',
  },
];

export const PUBLIC_AREA_TYPES = [
  {
    id: 'lobby',
    name: 'Lobby',
    min: 500,
    max: 3000,
    defaultSize: 800,
    required: true,
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    min: 800,
    max: 5000,
    defaultSize: 1200,
    required: false,
  },
  {
    id: 'fitness',
    name: 'Fitness Center',
    min: 400,
    max: 2000,
    defaultSize: 600,
    required: false,
  },
  {
    id: 'pool',
    name: 'Pool Area',
    min: 600,
    max: 4000,
    defaultSize: 1000,
    required: false,
  },
  {
    id: 'business-center',
    name: 'Business Center',
    min: 200,
    max: 800,
    defaultSize: 300,
    required: false,
  },
  {
    id: 'conference-room',
    name: 'Conference Room',
    min: 300,
    max: 1500,
    defaultSize: 500,
    required: false,
  },
  {
    id: 'elevator',
    name: 'Elevator Core',
    min: 100,
    max: 300,
    defaultSize: 150,
    required: false,
  },
  {
    id: 'laundry',
    name: 'Laundry Facility',
    min: 200,
    max: 800,
    defaultSize: 400,
    required: false,
  },
  {
    id: 'storage',
    name: 'Storage',
    min: 100,
    max: 500,
    defaultSize: 200,
    required: false,
  },
  {
    id: 'parking-garage',
    name: 'Parking Garage',
    min: 5000,
    max: 50000,
    defaultSize: 15000,
    required: false,
  },
]; 