export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6">This is a restricted area. You need a valid access token.</p>
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-500 font-mono">studio.houselevi.com?token=YOUR_TOKEN</p>
        </div>
        <p className="text-sm text-gray-600">Contact your administrator for access.</p>
      </div>
    </div>
  )
}
