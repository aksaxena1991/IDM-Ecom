export function NestMark() {
  return (
    <div className="nn-gate-mark" aria-hidden="true">
      <span className="nn-gate-particle nn-gate-particle--a" />
      <span className="nn-gate-particle nn-gate-particle--b" />
      <span className="nn-gate-particle nn-gate-particle--c" />
      <span className="nn-gate-particle nn-gate-particle--d" />
      <svg viewBox="0 0 64 48" className="nn-gate-mark-svg">
        <rect x="22" y="6" width="8" height="8" fill="currentColor" />
        <rect x="30" y="6" width="8" height="8" fill="currentColor" />
        <rect x="14" y="14" width="8" height="8" fill="currentColor" />
        <rect x="22" y="14" width="8" height="8" fill="var(--ts-color-success)" />
        <rect x="30" y="14" width="8" height="8" fill="currentColor" />
        <rect x="38" y="14" width="8" height="8" fill="currentColor" />
        <rect x="14" y="22" width="8" height="8" fill="currentColor" />
        <rect x="22" y="22" width="8" height="8" />
        <rect x="30" y="22" width="8" height="8" />
        <rect x="38" y="22" width="8" height="8" fill="currentColor" />
        <rect x="22" y="30" width="8" height="8" fill="currentColor" />
        <rect x="30" y="30" width="8" height="8" fill="currentColor" />
      </svg>
    </div>
  )
}
