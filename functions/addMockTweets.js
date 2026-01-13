// Temporary script to add mock tweets for testing
// Run with: node addMockTweets.js <userId>

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const mockTweets = [
  {
    text: "Just launched PostMetric! 🚀 Track which tweets actually drive revenue for your SaaS.",
    metrics: { likes: 45, retweets: 12, replies: 8, impressions: 2340 },
    createdAt: new Date('2025-01-10'),
  },
  {
    text: "Building in public is hard but rewarding. Day 8 of creating a tweet attribution tool.",
    metrics: { likes: 23, retweets: 5, replies: 3, impressions: 1200 },
    createdAt: new Date('2025-01-09'),
  },
  {
    text: "Hot take: Most SaaS founders don't know which marketing channels actually work. That's why I'm building PostMetric.",
    metrics: { likes: 67, retweets: 18, replies: 15, impressions: 4500 },
    createdAt: new Date('2025-01-08'),
  },
  {
    text: "OAuth 2.0 PKCE flow finally working! Twitter integration complete ✅",
    metrics: { likes: 12, retweets: 2, replies: 1, impressions: 890 },
    createdAt: new Date('2025-01-07'),
  },
  {
    text: "Firebase + React + Tailwind is such a good stack for MVPs. Shipping fast!",
    metrics: { likes: 34, retweets: 7, replies: 6, impressions: 1800 },
    createdAt: new Date('2025-01-06'),
  },
];

async function addMockTweets(userId) {
  if (!userId) {
    console.error('Please provide a userId as an argument');
    process.exit(1);
  }

  console.log(`Adding mock tweets for user: ${userId}`);

  const batch = db.batch();
  const tweetsRef = db.collection('tweets');

  mockTweets.forEach((tweet, index) => {
    const tweetId = `mock_tweet_${Date.now()}_${index}`;
    const tweetRef = tweetsRef.doc(tweetId);

    batch.set(tweetRef, {
      userId,
      twitterUserId: 'mock_user_id',
      tweetId,
      text: tweet.text,
      createdAt: admin.firestore.Timestamp.fromDate(tweet.createdAt),
      metrics: tweet.metrics,
      lastSynced: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();

  // Update last sync time
  await db.collection('users').doc(userId).update({
    'twitter.lastTweetSync': admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Successfully added ${mockTweets.length} mock tweets!`);
  process.exit(0);
}

const userId = process.argv[2];
addMockTweets(userId);
