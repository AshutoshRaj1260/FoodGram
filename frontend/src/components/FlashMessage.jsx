
import "../styles/flash-container.css";

export function FlashContainer({ flashes, onDismiss }) {
  if (!flashes.length) return null;

  return (
    <div className="flash-container">
      {flashes.map((f) => (
        <div
          key={f.id}
          className={`flash flash-enter ${
            f.type === "success" ? "flash-success" : "flash-error"
          }`}
        >
          {/* Toast body */}
          <div className="flash-body">
            <i
              className={`flash-icon fa-solid ${
                f.type === "success"
                  ? "fa-circle-check"
                  : "fa-circle-exclamation"
              }`}
            />

            <span className="flash-message">{f.message}</span>

            {/* Dismiss button */}
            <button
              onClick={() => onDismiss && onDismiss(f.id)}
              aria-label="Dismiss"
              className="flash-dismiss"
            >
              ✕
            </button>
          </div>

          {/* Timer bar */}
          {f.type === "error" && (
            <span className="flash-timer" />
          )}
        </div>
      ))}
    </div>
  );
}

