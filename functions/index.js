const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto-js');
const fetch = require('node-fetch');

admin.initializeApp();

// Twitter OAuth 1.0a configuration
const oauth = OAuth({
  consumer: {
    key: functions.config().twitter.consumer_key,
    secret: functions.config().twitter.consumer_secret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.HmacSHA1(base_string, key).toString(crypto.enc.Base64);
  },
});

const REQUEST_TOKEN_URL = 'https://api.twitter.com/oauth/request_token';
const ACCESS_TOKEN_URL = 'https://api.twitter.com/oauth/access_token';
const AUTHORIZE_URL = 'https://api.twitter.com/oauth/authorize';

// Step 1: Get request token
exports.twitterRequestToken = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callbackUrl = data.callbackUrl || 'http://localhost:3000/auth/twitter/callback';

  const requestData = {
    url: REQUEST_TOKEN_URL,
    method: 'POST',
    data: { oauth_callback: callbackUrl },
  };

  try {
    const response = await fetch(REQUEST_TOKEN_URL, {
      method: 'POST',
      headers: oauth.toHeader(oauth.authorize(requestData)),
    });

    const text = await response.text();

    // Log the response for debugging
    console.log('Twitter response status:', response.status);
    console.log('Twitter response body:', text);

    if (!response.ok) {
      throw new Error(`Twitter API error (${response.status}): ${text}`);
    }

    const params = new URLSearchParams(text);

    const oauthToken = params.get('oauth_token');
    const oauthTokenSecret = params.get('oauth_token_secret');

    if (!oauthToken || !oauthTokenSecret) {
      throw new Error(`Failed to get request token. Response: ${text}`);
    }

    // Store token secret temporarily in Firestore
    await admin.firestore()
      .collection('oauth_tokens')
      .doc(context.auth.uid)
      .set({
        tokenSecret: oauthTokenSecret,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      authUrl: `${AUTHORIZE_URL}?oauth_token=${oauthToken}`,
      oauthToken,
    };
  } catch (error) {
    console.error('Error getting request token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initiate Twitter OAuth');
  }
});

// Step 2: Exchange request token for access token
exports.twitterAccessToken = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { oauthToken, oauthVerifier } = data;

  if (!oauthToken || !oauthVerifier) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing oauth_token or oauth_verifier');
  }

  try {
    // Retrieve stored token secret
    const tokenDoc = await admin.firestore()
      .collection('oauth_tokens')
      .doc(context.auth.uid)
      .get();

    if (!tokenDoc.exists) {
      throw new Error('Token secret not found');
    }

    const { tokenSecret } = tokenDoc.data();

    const token = {
      key: oauthToken,
      secret: tokenSecret,
    };

    const requestData = {
      url: ACCESS_TOKEN_URL,
      method: 'POST',
      data: { oauth_verifier: oauthVerifier },
    };

    const response = await fetch(ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: oauth.toHeader(oauth.authorize(requestData, token)),
    });

    const text = await response.text();
    const params = new URLSearchParams(text);

    const accessToken = params.get('oauth_token');
    const accessTokenSecret = params.get('oauth_token_secret');
    const userId = params.get('user_id');
    const screenName = params.get('screen_name');

    if (!accessToken || !accessTokenSecret) {
      throw new Error('Failed to get access token');
    }

    // Store Twitter credentials in user document
    await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .set({
        twitter: {
          connected: true,
          userId,
          username: screenName,
          accessToken,
          accessTokenSecret,
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
      username: screenName,
    };
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to complete Twitter OAuth');
  }
});

// Get user's tweets
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

    const { accessToken, accessTokenSecret, userId } = userDoc.data().twitter;

    const token = {
      key: accessToken,
      secret: accessTokenSecret,
    };

    const requestData = {
      url: `https://api.twitter.com/2/users/${userId}/tweets`,
      method: 'GET',
    };

    const response = await fetch(
      `${requestData.url}?max_results=10&tweet.fields=created_at,public_metrics`,
      {
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
      }
    );

    const tweets = await response.json();

    if (!response.ok) {
      throw new Error(tweets.error || 'Failed to fetch tweets');
    }

    return tweets;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch tweets');
  }
});
