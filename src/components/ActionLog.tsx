import type { PresentResult } from "../services/hardware";

interface ActionLogProps {
  entries: PresentResult[];
}

export function ActionLog({ entries }: ActionLogProps) {
  return (
    <section className="panel action-log">
      <h2>Hardware log</h2>
      <p className="panel-hint">Mock for now — real serial later.</p>
      {entries.length === 0 ? (
        <p className="muted">No presents yet. Select a book and press Present.</p>
      ) : (
        <ul className="log-list">
          {entries.map((e, i) => (
            <li key={`${e.at}-${i}`}>
              <span className="log-time">{formatTime(e.at)}</span>
              <span className="log-msg">{e.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}
