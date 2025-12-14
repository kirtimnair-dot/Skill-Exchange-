// src/pages/TestFirebase.jsx
import { useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  useEffect(() => {
    console.log('🔥 Testing Firebase Connection...');
    console.log('Auth object:', auth ? '✅ Loaded' : '❌ Missing');
    console.log('Firestore object:', db ? '✅ Loaded' : '❌ Missing');
    
    // Test Firestore connection
    const testConnection = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        console.log('Firestore test: ✅ Connected,', snapshot.size, 'users found');
      } catch (error) {
        console.log('Firestore test: ❌ Error:', error.message);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test</h1>
      <p>Open browser console (F12) to see test results</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>If you see "✅ Loaded" for Auth and Firestore, Firebase is working!</p>
        <p>If you see "❌ Missing" or errors, check your firebase.js config.</p>
      </div>
    </div>
  );
}