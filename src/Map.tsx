import { useEffect } from 'react'
import { type LatLng, type Map as LeafletMap } from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'

const SOFTWIRE: [number, number] = [51.55382, -0.14397];

interface ClickHandlerProps {
  onLocationClick?: (location: LatLng) => void;
}

function ClickHandler({ onLocationClick }: ClickHandlerProps) {
  useMapEvents({
    click: (e) => onLocationClick?.(e.latlng),
  });

  return null;
}

interface MapReadySetterProps {
  onMapReady?: (map: LeafletMap | null) => void;
}

function MapReadySetter({ onMapReady }: MapReadySetterProps) {
  const map = useMap();

  useEffect(() => {
    onMapReady?.(map);

    return () => onMapReady?.(null);
  }, [map, onMapReady]);

  return null;
}

interface MapProps {
  onLocationClick?: (location: LatLng) => void;
  onMarkerClick?: (location: LatLng, i: number) => void;
  onMapReady?: (map: LeafletMap | null) => void;
  markers?: LatLng[];
  className?: string;
}

function Map({ onLocationClick, onMarkerClick, onMapReady, markers, className = "" }: MapProps) {
  return (
    <MapContainer center={SOFTWIRE} zoom={13} className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapReadySetter onMapReady={onMapReady} />
      <ClickHandler onLocationClick={onLocationClick} />

      {markers?.map((marker, i) => (
        <Marker key={marker.toString()} position={marker} eventHandlers={{
          click: () => onMarkerClick?.(marker, i),
        }} />
      ))}
    </MapContainer>
  );
}

export default Map;
