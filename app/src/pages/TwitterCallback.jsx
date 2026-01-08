import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { exchangeTwitterTokens } from '../utils/twitter'

export default function TwitterCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get OAuth 1.0a parameters from URL
        const oauthToken = searchParams.get('oauth_token')
        const oauthVerifier = searchParams.get('oauth_verifier')
        const denied = searchParams.get('denied')

        // Check if user denied access
        if (denied) {
          throw new Error('Twitter authorization was denied')
        }

        if (!oauthToken || !oauthVerifier) {
          throw new Error('Missing OAuth parameters')
        }

        setStatus('Completing Twitter authentication...')

        // Exchange tokens via Cloud Function
        // This function also saves to Firestore automatically
        const result = await exchangeTwitterTokens(oauthToken, oauthVerifier)

        setStatus('Success! Redirecting...')

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } catch (err) {
        console.error('Twitter OAuth error:', err)
        setError(err.message)
      }
    }

    if (currentUser) {
      handleCallback()
    }
  }, [searchParams, navigate, currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Please log in first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Connecting Twitter</h1>
          </div>

          {error ? (
            <>
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-red-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-400 font-medium mb-2">Connection Failed</p>
                <p className="text-slate-400 text-sm">{error}</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                <p className="text-slate-300">{status}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
