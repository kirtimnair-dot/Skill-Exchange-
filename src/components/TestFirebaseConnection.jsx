import { useEffect, useState } from 'react';
import { testFirebaseConnection } from '../firebase/firestoreService';

export default function TestFirebaseConnection() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runTest() {
      const testResult = await testFirebaseConnection();
      setResult(testResult);
      setLoading(false);
    }
    runTest();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Connection Test</h1>
        
        {result.success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Connection Successful!</h3>
                <p className="text-green-700">{result.message}</p>
              </div>
            </div>
            
            <div className="bg-white rounded p-4 border">
              <p className="text-sm"><strong>Document ID:</strong> {result.writeId}</p>
              <p className="text-sm"><strong>Total test documents:</strong> {result.readCount}</p>
            </div>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Connection Failed</h3>
                <p className="text-red-700">{result.message}</p>
              </div>
            </div>
            
            <div className="bg-white rounded p-4 border mb-4">
              <p className="text-sm font-medium">Error Details:</p>
              <p className="text-sm text-red-600">{result.error}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Troubleshooting Steps:</h4>
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Check if <code>.env</code> file has correct Firebase credentials</li>
                <li>Verify Firestore rules allow read/write</li>
                <li>Make sure you're using real Firebase project values</li>
                <li>Check browser console for detailed errors (F12)</li>
                <li>Restart the development server</li>
              </ol>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition mr-2"
            >
              Retry Test
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}