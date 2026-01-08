// Twitter OAuth 1.0a via Firebase Cloud Functions
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()

// Get Twitter auth URL from Cloud Function
export async function getTwitterAuthUrl() {
  const twitterRequestToken = httpsCallable(functions, 'twitterRequestToken')

  try {
    const result = await twitterRequestToken({
      callbackUrl: window.location.origin + '/auth/twitter/callback'
    })

    return result.data.authUrl
  } catch (error) {
    console.error('Error getting Twitter auth URL:', error)
    throw new Error('Failed to initiate Twitter authentication')
  }
}

// Exchange tokens via Cloud Function
export async function exchangeTwitterTokens(oauthToken, oauthVerifier) {
  const twitterAccessToken = httpsCallable(functions, 'twitterAccessToken')

  try {
    const result = await twitterAccessToken({
      oauthToken,
      oauthVerifier
    })

    return result.data
  } catch (error) {
    console.error('Error exchanging Twitter tokens:', error)
    throw new Error('Failed to complete Twitter authentication')
  }
}

// Get user tweets via Cloud Function
export async function getUserTweets() {
  const getUserTweetsFunc = httpsCallable(functions, 'getUserTweets')

  try {
    const result = await getUserTweetsFunc()
    return result.data
  } catch (error) {
    console.error('Error fetching tweets:', error)
    throw new Error('Failed to fetch tweets')
  }
}
