import {type ChangeEvent, useRef, useState} from 'react'
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

interface Prediction {
  id: string;
  lineName: string;
  destinationName: string;
  timeToStation: number; // seconds
}

const INITIAL_API_KEY = sessionStorage.getItem('tflApiKey') ?? '';

function App() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const debouncePostCode = useRef<number | null>(null);
  const [stops, setStops] = useState<StopPoint[]>([]);
  const [selectedStop, setSelectedStop] = useState<StopPoint | null>(null);
  const [arrivals, setArrivals] = useState<Prediction[]>([]);

  const [postCode, setPostCode] = useState<string>('');
  const [postCodeLocation, setPostCodeLocation] = useState<LatLng | null>(null);
  const [validPostCode, setValidPostCode] = useState<boolean>(false);
  const [postCodeMessage, setPostCodeMessage] = useState<string>('');

  const [apiKey, _setApiKey] = useState<string>(INITIAL_API_KEY);

  function setApiKey(newApiKey: string) {
    sessionStorage.setItem('tflApiKey', newApiKey);
    _setApiKey(newApiKey);
  }

  function changePostCode(e: ChangeEvent<HTMLInputElement>) {
    if (debouncePostCode.current) {
      clearTimeout(debouncePostCode.current);
    }

    debouncePostCode.current = setTimeout(() => {
      fetch(`http://api.postcodes.io/postcodes/${e.target.value}`)
        .then(resp => resp.json())
        .then(resp => {
          if (resp.status === 200) {
            const data = Array.isArray(resp.result) ? resp.result[0] : resp.result;
            const location = new LatLng(data.latitude, data.longitude);

            setValidPostCode(true);
            setPostCodeLocation(location);
          } else {
            setValidPostCode(false);
            setPostCodeMessage(resp.error);
          }
        })
        .catch(console.error);
    }, 500);

    setPostCode(e.target.value);
  }

  function goToPostCode() {
    // TODO somehow call map.panTo / map.flyTo

    if (postCodeLocation) {
      getStops(postCodeLocation);
    }
  }

  function getStops(location: LatLng) {
    if (!location) return;
    fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${location.lat}&lon=${location.lng}&stopTypes=NaptanPublicBusCoachTram&radius=200&modes=bus&categories=none&app_key=${apiKey}`)
      .then(resp => resp.json())
      .then(resp => resp.stopPoints)
      .then(setStops)
      .catch(console.error);
  }

  function selectStop(stop: StopPoint) {
    setSelectedStop(stop);
    fetch(`https://api.tfl.gov.uk/StopPoint/${stop.naptanId}/Arrivals?app_key=${apiKey}`)
      .then(resp => resp.json())
      .then((predictions: Prediction[]) => predictions.sort((a, b) => a.timeToStation - b.timeToStation))
      .then(setArrivals)
      .catch(console.error);
  }

  function clearSelection() {
    setSelectedStop(null);
    setArrivals([]);
  }

  function markers() {
    const locations = stops.map(({ lat, lon }) => new LatLng(lat, lon));
    if (location) {
      locations.push(location);
    }

    return locations;
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
        onMarkerClick={(_, i) => selectStop(stops[i])}
        markers={markers()}
        className="grow"
      />

      <div className="flex flex-col items-center justify-between gap-2 p-5 min-h-1/5">
        {!location && (
          <h1 className="text-2xl font-bold">Click the map to select a location!</h1>
        )}

        {!apiKey && (
          <h1 className="text-2xl font-bold">Enter an API key to fetch stop information!</h1>
        )}

        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-sm bg-black text-white font-bold disabled:bg-gray-600"
            onClick={goToPostCode}
            disabled={!validPostCode}
          >
            Go To
          </button>

          <input
            className="border p-1"
            type="text"
            placeholder="Post Code"
            value={postCode}
            onChange={changePostCode}
          />

          {location && apiKey && (
            <button
              className="px-4 py-2 rounded-sm bg-black text-white font-bold"
              onClick={() => getStops(location)}
            >
              Get Stops
            </button>
          )}

          {
            selectedStop && (
              <button
                className="px-4 py-2 rounded-sm bg-black text-white font-bold"
                onClick={clearSelection}
              >
                Clear Selection
              </button>
            )
          }
        </div>

        {!validPostCode && postCodeMessage && (<div>
          <span>{postCodeMessage}</span>
        </div>)}

        <div>
          {
            selectedStop ? (
              <span>Selected Stop: {selectedStop.commonName} ({selectedStop.naptanId} / {selectedStop.stationNaptan}) @ {selectedStop.lat},{selectedStop.lon} : {selectedStop.lines.map(line => line.id).join(', ')}</span>
            ) : (
              <span>No Stop Selected</span>
            )
          }
        </div>

        {selectedStop && (
          <ul>
            {arrivals.slice(0, 5).map(a => (
              <li key={a.id}>
                {a.lineName} to {a.destinationName} - {Math.round(a.timeToStation / 60)} min
              </li>
            ))}
          </ul>
        )}

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
