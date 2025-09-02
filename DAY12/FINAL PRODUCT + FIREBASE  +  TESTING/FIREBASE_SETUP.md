# Firebase Integration Setup

This project is now connected to Firebase with a comprehensive setup that includes authentication, Firestore database, storage, and cloud functions.

## What's Been Set Up

### 1. Firebase Configuration (`src/config.js`)
- Firebase app initialization
- Service initialization (Auth, Firestore, Storage, Functions)
- Export of all Firebase services

### 2. Firebase Service Layer (`src/services/firebaseService.js`)
- **Authentication Services**: Sign in, sign up, sign out, user state management
- **Database Services**: CRUD operations for Firestore
- **Storage Services**: File upload, download, and deletion
- **Cloud Functions**: Call cloud functions
- **Example Usage**: Common operations like user profiles and alerts

### 3. Example Component (`src/components/FirebaseExample.js`)
- Complete working example of Firebase integration
- User authentication (sign in/up/out)
- File upload to Firebase Storage
- Data saving to Firestore
- Real-time authentication state management

## Firebase Services Available

### Authentication (`firebaseAuth`)
```javascript
import { firebaseAuth } from '../services/firebaseService';

// Sign in
const result = await firebaseAuth.signIn(email, password);

// Sign up
const result = await firebaseAuth.signUp(email, password);

// Sign out
const result = await firebaseAuth.signOut();

// Get current user
const user = firebaseAuth.getCurrentUser();

// Listen to auth changes
firebaseAuth.onAuthStateChanged((user) => {
  // Handle user state changes
});
```

### Firestore Database (`firebaseDB`)
```javascript
import { firebaseDB } from '../services/firebaseService';

// Get a document
const result = await firebaseDB.getDocument('users', userId);

// Get collection with filters
const result = await firebaseDB.getCollection('alerts', {
  where: { userId: '==', value: userId },
  orderBy: { field: 'createdAt', direction: 'desc' },
  limit: 10
});

// Add document
const result = await firebaseDB.addDocument('users', userData);

// Update document
const result = await firebaseDB.updateDocument('users', userId, updates);

// Delete document
const result = await firebaseDB.deleteDocument('users', userId);
```

### Storage (`firebaseStorage`)
```javascript
import { firebaseStorage } from '../services/firebaseService';

// Upload file
const result = await firebaseStorage.uploadFile(file, 'path/to/file.jpg');

// Get download URL
const result = await firebaseStorage.getDownloadURL('path/to/file.jpg');

// Delete file
const result = await firebaseStorage.deleteFile('path/to/file.jpg');
```

### Cloud Functions (`firebaseFunctions`)
```javascript
import { firebaseFunctions } from '../services/firebaseService';

// Call cloud function
const result = await firebaseFunctions.callFunction('functionName', data);
```

## Usage in Components

### Basic Import
```javascript
import { firebaseAuth, firebaseDB, firebaseStorage } from '../services/firebaseService';
```

### Authentication State Management
```javascript
import React, { useState, useEffect } from 'react';
import { firebaseAuth } from '../services/firebaseService';

const MyComponent = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Rest of component...
};
```

### Database Operations
```javascript
const handleSaveData = async () => {
  const data = {
    userId: user.uid,
    timestamp: new Date().toISOString(),
    // ... other data
  };
  
  const result = await firebaseDB.addDocument('collectionName', data);
  if (result.success) {
    console.log('Data saved with ID:', result.id);
  } else {
    console.error('Error:', result.error);
  }
};
```

## Firebase Console Setup

Make sure you have the following enabled in your Firebase Console:

1. **Authentication**: Enable Email/Password sign-in method
2. **Firestore Database**: Create database in test mode or production mode
3. **Storage**: Enable storage with appropriate rules
4. **Cloud Functions**: Deploy any cloud functions you need

## Security Rules

### Firestore Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Alerts can be read by authenticated users, written by the system
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Storage Rules Example
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folder
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing the Integration

1. Import the `FirebaseExample` component in your app
2. Test user registration and login
3. Test file uploads
4. Test data saving to Firestore
5. Check the Firebase Console to see your data

## Common Use Cases

- **User Management**: Authentication, user profiles, preferences
- **Data Storage**: Device failure predictions, user alerts, reports
- **File Management**: Upload medical reports, device images, documents
- **Real-time Updates**: Live notifications, data synchronization
- **Analytics**: User behavior tracking, app usage statistics

## Troubleshooting

- **Authentication Errors**: Check if Email/Password sign-in is enabled in Firebase Console
- **Database Errors**: Verify Firestore rules and database creation
- **Storage Errors**: Check storage rules and bucket configuration
- **Import Errors**: Ensure all Firebase dependencies are installed

## Next Steps

1. Customize the Firebase service functions for your specific needs
2. Implement proper error handling and loading states
3. Add data validation and sanitization
4. Set up proper security rules
5. Implement offline persistence if needed
6. Add analytics and monitoring
