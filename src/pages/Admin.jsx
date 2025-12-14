import { useState, useEffect } from 'react';
import { 
  initializeDatabase, 
  checkCollections,
  seedSampleSkills,
  seedSampleUsers 
} from '../firebase/setupDatabase';
import { 
  Database, Users, Award, Calendar, MessageSquare, Star,
  CheckCircle, XCircle, RefreshCw, Loader2, Trash2
} from 'lucide-react';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function Admin() {
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({});

  const loadCollections = async () => {
    setLoading(true);
    try {
      const result = await checkCollections();
      setCollections(result);
      
      // Get counts
      const collectionNames = ['users', 'skills', 'bookings', 'messages', 'reviews'];
      const counts = {};
      
      for (const name of collectionNames) {
        const snapshot = await getDocs(collection(db, name));
        counts[name] = snapshot.size;
      }
      
      setStats(counts);
      setMessage('Collections loaded successfully');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('Initializing database...');
    try {
      const result = await initializeDatabase();
      if (result.success) {
        setMessage('✅ Database initialized successfully!');
        await loadCollections();
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSkills = async () => {
    setLoading(true);
    setMessage('Seeding sample skills...');
    try {
      const result = await seedSampleSkills();
      setMessage(result.success 
        ? `✅ ${result.count} sample skills added`
        : `❌ Error: ${result.error}`
      );
      await loadCollections();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedUsers = async () => {
    setLoading(true);
    setMessage('Seeding sample users...');
    try {
      const result = await seedSampleUsers();
      setMessage(result.success 
        ? `✅ ${result.count} sample users added`
        : `❌ Error: ${result.error}`
      );
      await loadCollections();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCollection = async (collectionName) => {
    if (!window.confirm(`Clear ALL documents from ${collectionName}?`)) return;
    
    setLoading(true);
    setMessage(`Clearing ${collectionName}...`);
    
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
      
      setMessage(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
      await loadCollections();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const collectionIcons = {
    users: <Users className="w-5 h-5" />,
    skills: <Award className="w-5 h-5" />,
    bookings: <Calendar className="w-5 h-5" />,
    messages: <MessageSquare className="w-5 h-5" />,
    reviews: <Star className="w-5 h-5" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600" />
            Firebase Database Admin
          </h1>
          <p className="text-gray-600 mt-2">Manage your Firestore collections and data</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') || message.includes('successfully')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(stats).map(([name, count]) => (
            <div key={name} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    {collectionIcons[name]}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-500 capitalize">{name}</div>
                  </div>
                </div>
                {collections[name]?.exists ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize Database'}
          </button>
          
          <button
            onClick={handleSeedSkills}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Seed Sample Skills'}
          </button>
          
          <button
            onClick={handleSeedUsers}
            disabled={loading}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Seed Sample Users'}
          </button>
          
          <button
            onClick={loadCollections}
            disabled={loading}
            className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Collections Status */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Collections Status</h2>
          </div>
          
          <div className="divide-y">
            {Object.entries(collections).map(([name, data]) => (
              <div key={name} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 rounded-lg mr-4">
                    {collectionIcons[name]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{name}</div>
                    <div className="text-sm text-gray-500">
                      {data.exists 
                        ? `${stats[name] || 0} documents`
                        : 'Collection does not exist'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {data.exists ? (
                    <>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Active
                      </span>
                      <button
                        onClick={() => handleClearCollection(name)}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                        title="Clear collection"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      Missing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">Firebase Console Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href="https://console.firebase.google.com/project/_/firestore" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg border hover:shadow-md transition flex items-center"
            >
              <Database className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="font-medium">Firestore Database</div>
                <div className="text-sm text-gray-500">View and edit collections</div>
              </div>
            </a>
            
            <a 
              href="https://console.firebase.google.com/project/_/authentication" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg border hover:shadow-md transition flex items-center"
            >
              <Users className="w-5 h-5 mr-3 text-green-600" />
              <div>
                <div className="font-medium">Authentication</div>
                <div className="text-sm text-gray-500">Manage users and sign-in methods</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}