import { firestore } from './firebaseAdmin'; // Import the initialized firestore instance

const videosCollection = firestore.collection('processed_videos');

/**
 * Creates or overwrites a video entry in Firestore.
 * @param {string} videoId The YouTube video ID.
 * @param {object} data The data to store (e.g., { youtubeUrl, status, processedAt }).
 * @returns {Promise<void>}
 */
export const setVideoEntry = async (videoId, data) => {
  try {
    await videosCollection.doc(videoId).set(data, { merge: true }); // Use merge:true to avoid overwriting fields unintentionally
    console.log(`Firestore: Entry set for video ${videoId}`);
  } catch (error) {
    console.error(`Firestore: Error setting entry for video ${videoId}:`, error);
    throw error; // Re-throw the error for upstream handling
  }
};

/**
 * Retrieves a video entry from Firestore.
 * @param {string} videoId The YouTube video ID.
 * @returns {Promise<object|null>} The document data or null if not found.
 */
export const getVideoEntry = async (videoId) => {
  try {
    const docSnap = await videosCollection.doc(videoId).get();
    if (docSnap.exists) {
      console.log(`Firestore: Entry retrieved for video ${videoId}`);
      return docSnap.data();
    } else {
      console.log(`Firestore: No entry found for video ${videoId}`);
      return null;
    }
  } catch (error) {
    console.error(`Firestore: Error getting entry for video ${videoId}:`, error);
    throw error;
  }
};

/**
 * Updates specific fields of a video entry in Firestore.
 * @param {string} videoId The YouTube video ID.
 * @param {object} data The fields to update (e.g., { status, summaryAI, errorMessage, processedAt }).
 * @returns {Promise<void>}
 */
export const updateVideoEntry = async (videoId, data) => {
  try {
    await videosCollection.doc(videoId).update(data);
    console.log(`Firestore: Entry updated for video ${videoId}`);
  } catch (error) {
    console.error(`Firestore: Error updating entry for video ${videoId}:`, error);
    throw error;
  }
};

// Add more specific functions as needed, e.g.:
// export const updateVideoStatus = async (videoId, status, errorMessage = null) => { ... } 