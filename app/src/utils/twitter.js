// Twitter OAuth 2.0 Configuration and Utilities
// Documentation: https://developer.x.com/en/docs/authentication/oauth-2-0

const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize'
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'

// OAuth 2.0 configuration
export const twitterConfig = {
  clientId: import.meta.env.VITE_TWITTER_CLIENT_ID,
  clientSecret: import.meta.env.VITE_TWITTER_CLIENT_SECRET,
  callbackUrl: import.meta.env.VITE_TWITTER_CALLBACK_URL,
}

// Generate a random code verifier for PKCE (Proof Key for Code Exchange)
export function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

// Generate code challenge from verifier
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(new Uint8Array(hash))
}

// Base64 URL encoding helper
function base64URLEncode(buffer) {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Generate Twitter OAuth URL
export async function getTwitterAuthUrl() {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store code verifier in sessionStorage for later use
  sessionStorage.setItem('twitter_code_verifier', codeVerifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: twitterConfig.clientId,
    redirect_uri: twitterConfig.callbackUrl,
    scope: 'tweet.read users.read offline.access',
    state: generateState(),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `${TWITTER_AUTH_URL}?${params.toString()}`
}

// Generate random state for CSRF protection
function generateState() {
  const state = Math.random().toString(36).substring(2, 15)
  sessionStorage.setItem('twitter_oauth_state', state)
  return state
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code) {
  const codeVerifier = sessionStorage.getItem('twitter_code_verifier')

  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please restart the OAuth flow.')
  }

  const params = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: twitterConfig.clientId,
    redirect_uri: twitterConfig.callbackUrl,
    code_verifier: codeVerifier,
  })

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`)
  }

  const data = await response.json()

  // Clean up stored values
  sessionStorage.removeItem('twitter_code_verifier')
  sessionStorage.removeItem('twitter_oauth_state')

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

// Verify OAuth state to prevent CSRF
export function verifyState(returnedState) {
  const storedState = sessionStorage.getItem('twitter_oauth_state')
  return storedState === returnedState
}

// Get Twitter user info
export async function getTwitterUser(accessToken) {
  const response = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Twitter user info')
  }

  return await response.json()
}
