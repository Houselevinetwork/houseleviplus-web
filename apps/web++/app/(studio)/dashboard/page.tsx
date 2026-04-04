export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '12,847' },
          { label: 'Revenue', value: '$45,230' },
          { label: 'Premium', value: '8,234' },
          { label: 'Content', value: '2,847' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
