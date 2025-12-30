import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-indigo-400 mb-4">
          PostMetric
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Your React app is ready! 🚀
        </p>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold mb-2">Day 1 Complete!</h2>
          <p className="text-slate-400">
            Next steps: Install dependencies and set up Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
