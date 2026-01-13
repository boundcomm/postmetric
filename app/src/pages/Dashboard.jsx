import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { getTwitterAuthUrl, getUserTweets } from '../utils/twitter'

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [twitterConnected, setTwitterConnected] = useState(false)
  const [twitterUsername, setTwitterUsername] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectingTwitter, setConnectingTwitter] = useState(false)
  const [fetchingTweets, setFetchingTweets] = useState(false)
  const [tweets, setTweets] = useState([])
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    const checkTwitterConnection = async () => {
      if (!currentUser) return

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists() && userDoc.data().twitter?.connected) {
          setTwitterConnected(true)
          setTwitterUsername(userDoc.data().twitter.username)
          setLastSync(userDoc.data().twitter.lastTweetSync)

          // Load tweets from Firestore
          await loadTweets()
        }
      } catch (error) {
        console.error('Error checking Twitter connection:', error)
      } finally {
        setLoading(false)
      }
    }

    checkTwitterConnection()
  }, [currentUser])

  const loadTweets = async () => {
    try {
      const tweetsQuery = query(
        collection(db, 'tweets'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(tweetsQuery)
      const tweetsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTweets(tweetsData)
    } catch (error) {
      console.error('Error loading tweets:', error)
    }
  }

  const handleFetchTweets = async () => {
    setFetchingTweets(true)
    try {
      const result = await getUserTweets()
      console.log('Fetched tweets:', result)

      // Reload tweets from Firestore
      await loadTweets()

      // Update last sync time
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      setLastSync(userDoc.data().twitter.lastTweetSync)

      alert(`Successfully fetched ${result.count} tweets!`)
    } catch (error) {
      console.error('Error fetching tweets:', error)
      alert('Failed to fetch tweets. Please try again.')
    } finally {
      setFetchingTweets(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  const handleConnectTwitter = async () => {
    if (connectingTwitter) return // Prevent multiple clicks

    setConnectingTwitter(true)
    try {
      const authUrl = await getTwitterAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error initiating Twitter OAuth:', error)
      alert('Failed to connect Twitter. Please try again.')
      setConnectingTwitter(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-indigo-400 text-xl font-bold">PostMetric</h1>
              <nav className="hidden md:flex gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'overview' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('tweets')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'tweets' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tweets
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'analytics' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'settings' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <span className="text-sm text-slate-400">{currentUser?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Overview</h2>
              <p className="text-slate-400">Track your tweet performance and conversions</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Total Signups</p>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <p className="text-3xl font-bold mb-1">--</p>
                <p className="text-sm text-slate-500">Connect Twitter to see data</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Revenue</p>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-3xl font-bold mb-1">$--</p>
                <p className="text-sm text-slate-500">Waiting for data</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Top Tweet</p>
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </div>
                <p className="text-3xl font-bold mb-1">--</p>
                <p className="text-sm text-slate-500">No tweets tracked yet</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Conversion Rate</p>
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <p className="text-3xl font-bold mb-1">--%</p>
                <p className="text-sm text-slate-500">Waiting for data</p>
              </div>
            </div>

            {/* Connect Twitter CTA */}
            {!twitterConnected ? (
              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-xl p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Connect Your Twitter Account</h3>
                    <p className="text-slate-300">Start tracking which tweets drive real growth</p>
                  </div>
                  <button
                    onClick={handleConnectTwitter}
                    disabled={connectingTwitter}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {connectingTwitter ? 'Connecting...' : 'Connect Twitter'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Twitter Connected
                    </h3>
                    <p className="text-slate-300 mb-1">@{twitterUsername}</p>
                    {lastSync && (
                      <p className="text-sm text-slate-400">
                        Last synced: {new Date(lastSync.toDate()).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleFetchTweets}
                    disabled={fetchingTweets}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {fetchingTweets ? 'Fetching...' : 'Fetch Tweets'}
                  </button>
                </div>
              </div>
            )}

            {/* Tweet list */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold">Recent Tweets</h3>
              </div>
              {tweets.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <p className="text-slate-400 mb-2">No tweets yet</p>
                  <p className="text-sm text-slate-500">
                    {twitterConnected ? 'Click "Fetch Tweets" to load your recent tweets' : 'Connect your Twitter account to start tracking'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {tweets.map((tweet) => (
                    <div key={tweet.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                      <p className="text-slate-200 mb-4">{tweet.text}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                          </svg>
                          <span>{tweet.metrics?.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
                          </svg>
                          <span>{tweet.metrics?.retweets || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path>
                          </svg>
                          <span>{tweet.metrics?.replies || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                          </svg>
                          <span>{tweet.metrics?.impressions || 0}</span>
                        </div>
                        <span className="ml-auto text-xs">
                          {tweet.createdAt && new Date(tweet.createdAt.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'tweets' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Tweets</h2>
              <p className="text-slate-400">View and analyze your tweet performance</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
              <p className="text-slate-400">Tweet management coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Analytics</h2>
              <p className="text-slate-400">Deep insights into your tweet attribution</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
              <p className="text-slate-400">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-slate-400">Manage your account and preferences</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
              <p className="text-slate-400">Settings panel coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
