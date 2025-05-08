import admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin SDK
    // It automatically uses GOOGLE_APPLICATION_CREDENTIALS environment variable
    // if it's set, pointing to your service account key file.
    // Alternatively, you can manually provide credentials:
    // admin.initializeApp({
    //   credential: admin.credential.cert(require('/path/to/your/serviceAccountKey.json'))
    // });
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // Decide how to handle initialization failure - maybe exit the process?
    // process.exit(1);
  }
}

const firestore = admin.firestore();

export { admin, firestore }; 