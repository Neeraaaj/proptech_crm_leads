import { ApiError } from "../api/client";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const isNotImplemented = error instanceof ApiError && error.status === 501;
  const message = error instanceof Error ? error.message : "Something went wrong";

  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        isNotImplemented ? "border-amber-300 bg-amber-50 text-amber-900" : "border-red-300 bg-red-50 text-red-900"
      }`}
    >
      <p className="font-medium">{isNotImplemented ? "🚧 Not implemented yet" : "Error"}</p>
      <p className="mt-1">{message}</p>
      {onRetry && !isNotImplemented && (
        <button onClick={onRetry} className="btn-secondary mt-3">
          Retry
        </button>
      )}
    </div>
  );
}
