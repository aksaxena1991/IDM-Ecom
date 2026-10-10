import { Skeleton } from '@thoughtstream/ui'

export function SessionSkeleton() {
  return (
    <div className="page-center" role="status" aria-label="Checking session">
      <div style={{ width: 'min(100%, 520px)', display: 'grid', gap: '1rem' }}>
        <Skeleton variant="text" width="46%" height={22} />
        <Skeleton variant="text" width="72%" height={12} />
        <Skeleton variant="card" />
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" style={{ display: 'grid', gap: '0.75rem' }}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} variant="rectangular" height={72} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" style={{ display: 'grid', gap: '0.7rem', padding: '1rem' }}>
      <Skeleton variant="rectangular" height={28} />
      <Skeleton variant="text" count={rows} height={16} />
    </div>
  )
}

export function CardGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <section className="detail-grid" role="status" aria-label="Loading">
      {Array.from({ length: cards }, (_, index) => (
        <Skeleton key={index} variant="card" />
      ))}
    </section>
  )
}
