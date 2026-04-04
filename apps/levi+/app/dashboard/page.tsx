// Location: apps/levi+/app/dashboard/page.tsx

export default function DashboardPage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#111',
          letterSpacing: '0.02em',
          marginBottom: '4px',
        }}>
          Overview
        </h1>
        <p style={{ fontSize: '12px', color: '#999', letterSpacing: '0.04em' }}>
          House Levi+ Administration Console
        </p>
      </div>

      {/* Metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total Users',       value: '—', sub: 'Free + Premium' },
          { label: 'Premium Members',   value: '—', sub: 'Active subscriptions' },
          { label: 'Monthly Revenue',   value: '—', sub: 'This month' },
          { label: 'Content Items',     value: '—', sub: 'Published' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#ffffff',
            border: '1px solid #eeebe6',
            borderRadius: '2px',
            padding: '20px 22px',
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#999',
              marginBottom: '10px',
            }}>
              {card.label}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#111',
              fontFamily: 'Arial Black, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: '11px', color: '#bbb' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Placeholder content area */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eeebe6',
        borderRadius: '2px',
        padding: '40px',
        textAlign: 'center',
        color: '#ccc',
        fontSize: '12px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Charts & activity feed coming soon
      </div>

    </div>
  );
}