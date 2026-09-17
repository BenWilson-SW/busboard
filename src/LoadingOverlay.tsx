interface LoadingOverlayProps {
  loading: boolean;
}

export function LoadingOverlay({ loading }: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/70"
    >
      <span className="text-6xl animate-bounce">🚌</span>
    </div>
  );
}
