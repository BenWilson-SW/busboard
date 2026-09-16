import { useState } from 'react'
import { LatLng } from 'leaflet'
import Map from './Map.tsx'

interface Line {
  id: string;
  name: string;
  uri: string;
}

interface StopPoint {
  commonName: string;
  naptanId: string;
  stationNaptan: string;
  lat: number;
  lon: number;
  lines: Line[];
}

const INITIAL_API_KEY = sessionStorage.getItem('tflApiKey') ?? '';

function App() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [stops, setStops] = useState<StopPoint[]>([]);

  const [apiKey, _setApiKey] = useState<string>(INITIAL_API_KEY);

  function setApiKey(newApiKey: string) {
    sessionStorage.setItem('tflApiKey', newApiKey);
    _setApiKey(newApiKey);
  }

  function getStops() {
    if (!location) return;
    fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${location.lat}&lon=${location.lng}&stopTypes=NaptanPublicBusCoachTram&radius=200&modes=bus&categories=none&app_key=${apiKey}`)
      .then(resp => resp.json())
      .then(resp => resp.stopPoints)
      .then(setStops);
  }

  function markers() {
    if (stops.length > 0) {
      return stops.map(({ lat, lon }) => new LatLng(lat, lon));
    }

    return location ? [location] : [];
  }

  return (
    <div className="flex flex-col h-dvh">
      <header>
        <h1 className="text-3xl font-bold underline text-center text-cyan-600 m-4">
          BusBoard
        </h1>
      </header>

      <Map
        onLocationClick={setLocation}
        markers={markers()}
        className="grow"
      />

      <div className="flex flex-col items-center justify-between h-1/4 gap-1 p-5 overflow-hidden">
        {!location && (
          <h1 className="text-2xl font-bold">Click the map to select a location!</h1>
        )}

        {location && (
          <button
            className="px-4 py-2 rounded-xl bg-amber-900 text-white"
            onClick={getStops}
          >
            Get Stops
          </button>
        )}

        <div>
          {stops.map(stop => (
            <p key={stop.naptanId}>{stop.commonName} ({stop.naptanId} / {stop.stationNaptan}) @ {stop.lat},{stop.lon} : {stop.lines.map(line => line.id).join(', ')}</p>
          ))}
        </div>

        <div>
          <label className="mr-1" htmlFor="api-key">TFL API Key</label>
          <input
            className="border"
            id="api-key"
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </div>

        {location && (
          <p>({location.lat}, {location.lng})</p>
        )}
      </div>
    </div>
  )
}

export default App
