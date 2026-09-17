interface LoadingOverlayProps {
  loading: boolean;
}

export function LoadingOverlay({ loading }: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!loading}
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-white/70 transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <span className="text-6xl animate-bounce">🚌</span>
    </div>
  );
}
