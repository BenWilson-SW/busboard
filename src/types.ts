export interface Line {
  id: string;
  name: string;
  uri: string;
}

export interface StopPoint {
  commonName: string;
  naptanId: string;
  stationNaptan: string;
  lat: number;
  lon: number;
  lines: Line[];
}

export interface ArrivalPrediction {
  id: string;
  lineName: string;
  destinationName: string;
  timeToStation: number; // seconds
}
