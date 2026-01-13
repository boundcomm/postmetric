const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const fetch = require('node-fetch');

admin.initializeApp();

// Twitter OAuth 2.0 with PKCE configuration
const TWITTER_CLIENT_ID = functions.config().twitter.client_id;
const TWITTER_CLIENT_SECRET = functions.config().twitter.client_secret;

const AUTHORIZE_URL = 'https://twitter.com/i/oauth2/authorize';
const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

// Helper function to generate code verifier and challenge for PKCE
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

// Step 1: Get authorization URL
exports.twitterRequestToken = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callbackUrl = data.callbackUrl || 'http://localhost:3000/auth/twitter/callback';

  try {
    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Generate random state
    const state = crypto.randomBytes(16).toString('hex');

    // Store code verifier and state temporarily in Firestore
    await admin.firestore()
      .collection('oauth_tokens')
      .doc(context.auth.uid)
      .set({
        codeVerifier,
        state,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: callbackUrl,
      scope: 'tweet.read users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${AUTHORIZE_URL}?${params.toString()}`;

    console.log('Generated auth URL for user:', context.auth.uid);

    return {
      authUrl,
    };
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initiate Twitter OAuth');
  }
});

// Step 2: Exchange authorization code for access token
exports.twitterAccessToken = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { code, state, callbackUrl } = data;

  if (!code || !state) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing code or state');
  }

  try {
    // Retrieve stored code verifier and state
    const tokenDoc = await admin.firestore()
      .collection('oauth_tokens')
      .doc(context.auth.uid)
      .get();

    if (!tokenDoc.exists) {
      throw new Error('OAuth state not found');
    }

    const { codeVerifier, state: storedState } = tokenDoc.data();

    console.log('Received state:', state);
    console.log('Stored state:', storedState);

    // Verify state matches
    if (state !== storedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    // Exchange code for access token
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: callbackUrl || 'http://localhost:3000/auth/twitter/callback',
      code_verifier: codeVerifier,
    });

    // Create Basic Auth header
    const basicAuth = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: params.toString(),
    });

    const tokenData = await response.json();

    console.log('Token exchange response status:', response.status);

    if (!response.ok) {
      console.error('Token exchange error:', tokenData);
      throw new Error(`Failed to exchange token: ${JSON.stringify(tokenData)}`);
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    if (!access_token) {
      throw new Error('No access token received');
    }

    // Get user info from Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info error:', userData);
      throw new Error('Failed to get user info');
    }

    const { id: userId, username } = userData.data;

    // Store Twitter credentials in user document
    await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .set({
        twitter: {
          connected: true,
          userId,
          username,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + (expires_in * 1000)),
          connectedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      }, { merge: true });

    // Clean up temporary token
    await admin.firestore()
      .collection('oauth_tokens')
      .doc(context.auth.uid)
      .delete();

    return {
      success: true,
      username,
    };
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to complete Twitter OAuth');
  }
});

// Get user's tweets and store in Firestore
exports.getUserTweets = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || !userDoc.data().twitter?.connected) {
      throw new Error('Twitter not connected');
    }

    let { accessToken, refreshToken, expiresAt, userId } = userDoc.data().twitter;

    // Check if token is expired and refresh if needed
    if (expiresAt && expiresAt.toMillis() < Date.now()) {
      console.log('Access token expired, refreshing...');

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: TWITTER_CLIENT_ID,
      });

      const basicAuth = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');

      const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: params.toString(),
      });

      const tokenData = await response.json();

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;

      // Update stored tokens
      await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .update({
          'twitter.accessToken': accessToken,
          'twitter.refreshToken': refreshToken,
          'twitter.expiresAt': admin.firestore.Timestamp.fromMillis(Date.now() + (tokenData.expires_in * 1000)),
        });
    }

    // Fetch tweets
    const response = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const tweetsData = await response.json();

    if (!response.ok) {
      console.error('Twitter API error:', tweetsData);

      // Handle specific Twitter API errors
      if (tweetsData.title === 'CreditsDepleted') {
        throw new Error('Twitter API credits depleted. Please check your Twitter Developer account billing.');
      }

      throw new Error(tweetsData.detail || tweetsData.error || 'Failed to fetch tweets');
    }

    // Store tweets in Firestore
    if (tweetsData.data && tweetsData.data.length > 0) {
      const batch = admin.firestore().batch();
      const tweetsRef = admin.firestore().collection('tweets');

      for (const tweet of tweetsData.data) {
        const tweetRef = tweetsRef.doc(tweet.id);
        batch.set(tweetRef, {
          userId: context.auth.uid,
          twitterUserId: userId,
          tweetId: tweet.id,
          text: tweet.text,
          createdAt: admin.firestore.Timestamp.fromDate(new Date(tweet.created_at)),
          metrics: {
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0,
            impressions: tweet.public_metrics?.impression_count || 0,
          },
          lastSynced: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      await batch.commit();
      console.log(`Stored ${tweetsData.data.length} tweets for user ${context.auth.uid}`);
    }

    // Update last sync time in user document
    await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .update({
        'twitter.lastTweetSync': admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      count: tweetsData.data?.length || 0,
      tweets: tweetsData.data || [],
    };
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to fetch tweets');
  }
});
