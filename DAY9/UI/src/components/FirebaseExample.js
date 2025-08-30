import React, { useState, useEffect } from 'react';
import { firebaseAuth, firebaseDB, firebaseStorage } from '../services/firebaseService';

const FirebaseExample = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage('Signing in...');
    
    const result = await firebaseAuth.signIn(email, password);
    if (result.success) {
      setMessage('Signed in successfully!');
      setEmail('');
      setPassword('');
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage('Creating account...');
    
    const result = await firebaseAuth.signUp(email, password);
    if (result.success) {
      setMessage('Account created successfully!');
      setEmail('');
      setPassword('');
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const handleSignOut = async () => {
    const result = await firebaseAuth.signOut();
    if (result.success) {
      setMessage('Signed out successfully!');
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && user) {
      setMessage('Uploading file...');
      
      const result = await firebaseStorage.uploadFile(file, `uploads/${user.uid}/${file.name}`);
      if (result.success) {
        setMessage(`File uploaded successfully! URL: ${result.url}`);
      } else {
        setMessage(`Upload error: ${result.error}`);
      }
    }
  };

  const handleSaveData = async () => {
    if (user) {
      setMessage('Saving data...');
      
      const data = {
        userId: user.uid,
        email: user.email,
        timestamp: new Date().toISOString(),
        message: 'Hello from Firebase!'
      };
      
      const result = await firebaseDB.addDocument('userData', data);
      if (result.success) {
        setMessage(`Data saved with ID: ${result.id}`);
      } else {
        setMessage(`Save error: ${result.error}`);
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Firebase Integration Example</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          {message}
        </div>
      )}

      {!user ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Authentication</h3>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <p><strong>Signed in as:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.uid}</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File:</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <button
              onClick={handleSaveData}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Save Sample Data to Firestore
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseExample;
