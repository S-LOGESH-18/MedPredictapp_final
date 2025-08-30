import { 
  auth, 
  db, 
  storage, 
  functions 
} from '../config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Authentication Services
export const firebaseAuth = {
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create new user account
  signUp: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore Database Services
export const firebaseDB = {
  // Get a single document
  getDocument: async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get all documents from a collection
  getCollection: async (collectionName, options = {}) => {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters if provided
      if (options.where) {
        q = query(q, where(options.where.field, options.where.operator, options.where.value));
      }
      
      // Apply ordering if provided
      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
      }
      
      // Apply limit if provided
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Add a new document
  addDocument: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update an existing document
  updateDocument: async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete a document
  deleteDocument: async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Storage Services
export const firebaseStorage = {
  // Upload a file
  uploadFile: async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { success: true, url: downloadURL, path: snapshot.ref.fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get download URL
  getDownloadURL: async (path) => {
    try {
      const url = await getDownloadURL(ref(storage, path));
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete a file
  deleteFile: async (path) => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Cloud Functions Services
export const firebaseFunctions = {
  // Call a cloud function
  callFunction: async (functionName, data) => {
    try {
      const functionRef = functions.httpsCallable(functionName);
      const result = await functionRef(data);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Example usage functions for common operations
export const exampleUsage = {
  // Example: Get user profile
  getUserProfile: async (userId) => {
    return await firebaseDB.getDocument('users', userId);
  },

  // Example: Save user profile
  saveUserProfile: async (userId, profileData) => {
    return await firebaseDB.updateDocument('users', userId, profileData);
  },

  // Example: Upload user avatar
  uploadUserAvatar: async (userId, file) => {
    const path = `avatars/${userId}/${file.name}`;
    return await firebaseStorage.uploadFile(file, path);
  },

  // Example: Get all alerts for a user
  getUserAlerts: async (userId) => {
    return await firebaseDB.getCollection('alerts', {
      where: { userId: '==', value: userId },
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: 10
    });
  }
};
