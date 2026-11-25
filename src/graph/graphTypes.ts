export type NodeType =
  | 'terminal'
  | 'station'
  | 'commercial'
  | 'public_square'
  | 'junction'
  | 'religious';

export interface PassengerData {
  nodeId: string;
  dailyBoarding: number;
  dailyAlighting: number;
  peakHours: string;
  densityLevel: 'High' | 'Medium' | 'Low';
  congestionIndex: number; // 0.0 to 1.0
  notes: string;
}

export interface TransitRouteStop {
  stopId: string;
  stopName: string;
  order: number;
}

export interface TransitRoute {
  id: string;
  routeCode: string;
  routeName: string;
  color: string;
  vehicleType: string; // e.g. "Angkot Serang"
  frequencyMin: number;
  operationalHours: string;
  stops: TransitRouteStop[];
  pathNodeIds: string[];
  description: string;
  isSimulated: boolean;
}

export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: NodeType;
  description?: string;
  passengerInfo?: PassengerData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number; // Distance in kilometers along real road geometry
  streetName: string;
  oneWay: boolean;
  geometry: [number, number][]; // [lat, lng][]
  geojsonId: string;
  description?: string;
}

export interface AdjacencyItem {
  targetNodeId: string;
  edge: GraphEdge;
  cost: number; // road distance in km
}

export interface SharedGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  adjacency: Map<string, AdjacencyItem[]>;
  nodeList: GraphNode[];
}
