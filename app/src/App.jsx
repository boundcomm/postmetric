import { useState, useEffect } from 'react'
import { auth, db } from './firebase'

function App() {
  const [firebaseConnected, setFirebaseConnected] = useState(false)

  useEffect(() => {
    // Test Firebase connection
    if (auth && db) {
      setFirebaseConnected(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-indigo-400 mb-4">
          PostMetric
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Building the future of tweet attribution 🚀
        </p>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-4">
          <h2 className="text-2xl font-semibold mb-2">Day 2 Progress</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-slate-300">React app set up</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-slate-300">Tailwind CSS configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={firebaseConnected ? "text-green-400" : "text-yellow-400"}>
                {firebaseConnected ? "✓" : "⏳"}
              </span>
              <span className="text-slate-300">
                Firebase {firebaseConnected ? "connected" : "connecting..."}
              </span>
            </div>
          </div>
        </div>

        {firebaseConnected && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 font-semibold">
              🎉 Firebase is connected and ready!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
