import type {ArrivalPrediction, StopPoint} from "./types.ts";

interface ArrivalsTableProps {
  stop: StopPoint;
  arrivals: ArrivalPrediction[];
}

const MAX_ARRIVALS = 5;

export function ArrivalsTable({ stop, arrivals }: ArrivalsTableProps) {
  return (
    <section className="flex flex-col gap-5 items-center w-full max-w-3xl">
      <h1 className="text-3xl text-cyan-600 font-bold capitalize">{stop.commonName}</h1>

      <table className="border-separate w-full border-spacing-y-1 px-5">
        <thead className="text-lg font-bold">
        <tr>
          <td>Line</td>
          <td>Destination</td>
          <td>Arrives In</td>
        </tr>
        </thead>
        <tbody>
        {arrivals.slice(0, MAX_ARRIVALS).map(arrival => (
          <tr key={arrival.id}>
            <td>{arrival.lineName}</td>
            <td>{arrival.destinationName}</td>
            <td>{Math.round(arrival.timeToStation / 60)} min</td>
          </tr>
        ))}
        </tbody>
      </table>
    </section>
  );
}
