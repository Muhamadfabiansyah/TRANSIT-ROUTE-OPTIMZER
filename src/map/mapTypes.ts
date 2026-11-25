export interface MapLayerVisibility {
  baseMap: boolean;
  roadNetwork: boolean;
  graphNodes: boolean;
  exploredNodes: boolean;
  ucsRoute: boolean;
  greedyRoute: boolean;
  transitRoutes: boolean;
  passengerInfo: boolean;
}

export const defaultMapLayerVisibility: MapLayerVisibility = {
  baseMap: true,
  roadNetwork: true,
  graphNodes: true,
  exploredNodes: true,
  ucsRoute: true,
  greedyRoute: true,
  transitRoutes: false,
  passengerInfo: false,
};
