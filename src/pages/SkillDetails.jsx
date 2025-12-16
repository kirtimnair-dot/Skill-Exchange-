import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Clock, MapPin, Calendar, DollarSign, 
  User, MessageSquare, Users, CheckCircle, Heart, Share2,
  BookOpen, Award, Globe, Shield, Trash2, AlertTriangle, Edit
} from 'lucide-react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { startChat } from '../services/chatService';

export default function SkillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSkill();
  }, [id]);

  const fetchSkill = async () => {
    try {
      const docRef = doc(db, 'skills', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSkill({ 
          id: docSnap.id, 
          ...data,
          availability: Array.isArray(data.availability) 
            ? data.availability 
            : typeof data.availability === 'string' 
              ? data.availability.replace(/[\[\]"]/g, '').split(',').map(item => item.trim())
              : []
        });
      } else {
        navigate('/skills');
      }
    } catch (error) {
      console.error('Error fetching skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (!currentUser || currentUser.uid !== skill.userId) {
      alert('You can only delete your own skills');
      return;
    }

    setDeleting(true);
    try {
      const skillRef = doc(db, 'skills', id);
      await deleteDoc(skillRef);
      
      alert('Skill deleted successfully!');
      navigate('/skills');
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      alert('Please login to message this teacher');
      navigate('/login');
      return;
    }

    if (currentUser.uid === skill.userId) {
      alert('You cannot message yourself');
      return;
    }

    setChatLoading(true);
    try {
      const result = await startChat(
        currentUser.uid,
        currentUser.displayName || 'User',
        skill.userId,
        skill.userName
      );
      
      if (result.success) {
        navigate(`/chat?conversation=${result.conversationId}`);
      } else {
        alert('Failed to start chat: ' + result.error);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    } finally {
      setChatLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!currentUser) {
      alert('Please login to book this skill');
      navigate('/login');
      return;
    }
    
    if (currentUser.uid === skill.userId) {
      alert('You cannot book your own skill');
      return;
    }
    
    navigate(`/booking/${id}`);
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      alert('Please login to add to favorites');
      navigate('/login');
      return;
    }
    
    try {
      // TODO: Implement favorite functionality with Firebase
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const shareSkill = () => {
    if (navigator.share) {
      navigator.share({
        title: skill.title,
        text: `Check out "${skill.title}" on SkillExchange`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-600">Loading skill details...</p>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4">Skill not found</h2>
          <button
            onClick={() => navigate('/skills')}
            className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Skills
          </button>
        </div>
      </div>
    );
  }

  const descriptionPreview = skill.description.length > 200 && !showAllDescription 
    ? skill.description.substring(0, 200) + '...' 
    : skill.description;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Skill</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete "{skill.title}"? This action cannot be undone.
                </p>
                <div className="mt-4 bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ <span className="font-medium">Warning:</span> This will permanently delete your skill listing and all associated data.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteSkill}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Skill
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Skills
          </button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {skill.category || 'General'}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-white font-medium">{skill.rating || 0}</span>
                  <span className="text-white/80">({skill.totalBookings || 0} bookings)</span>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {skill.title}
              </h1>
              
              <p className="text-white/90 text-lg max-w-3xl">
                {skill.description.substring(0, 100)}...
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full ${isFavorite ? 'bg-pink-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={shareSkill}
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {currentUser && currentUser.uid === skill.userId && (
                <>
                  <Link to={`/edit-skill/${id}`}>
                    <button className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30">
                      <Edit className="w-5 h-5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-3 rounded-full bg-red-500/20 text-white hover:bg-red-500/30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">About This Skill</h2>
                <BookOpen className="w-6 h-6 text-cyan-600" />
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 mb-4">{descriptionPreview}</p>
                {skill.description.length > 200 && (
                  <button
                    onClick={() => setShowAllDescription(!showAllDescription)}
                    className="text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    {showAllDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t">
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-bold text-gray-900">{skill.duration || '1 hour'}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Availability</p>
                  <p className="font-bold text-gray-900">
                    {skill.availability && skill.availability.length > 0 
                      ? skill.availability.join(', ')
                      : 'Flexible'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Bookings</p>
                  <p className="font-bold text-gray-900">{skill.totalBookings || 0}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="font-bold text-gray-900">{skill.rating || 0}/5</p>
                </div>
              </div>
            </div>

            {/* What You'll Learn Card */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Personalized one-on-one instruction',
                  'Hands-on practice sessions',
                  'Customized learning path',
                  'Direct feedback and guidance',
                  'Practical skill application',
                  'Lifetime access to materials'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Booking Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Skill</h3>
              
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-6 h-6 text-cyan-700" />
                    <span className="text-4xl font-bold text-cyan-700">{skill.price || 0}</span>
                  </div>
                  <span className="text-gray-500 ml-2">/ session</span>
                </div>
                <p className="text-gray-600">Pay per session, no subscription required</p>
              </div>
              
              <button
                onClick={handleBookNow}
                disabled={!currentUser || currentUser.uid === skill.userId}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentUser?.uid === skill.userId ? 'Your Own Skill' : `Book Now - $${skill.price || 0}`}
              </button>
              
              <button
                onClick={handleStartChat}
                disabled={!currentUser || currentUser.uid === skill.userId || chatLoading}
                className="w-full bg-white border-2 border-cyan-500 text-cyan-600 font-semibold py-3 rounded-xl hover:bg-cyan-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chatLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                    <span>Starting Chat...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>{currentUser?.uid === skill.userId ? 'Cannot Message Yourself' : 'Message Teacher'}</span>
                  </>
                )}
              </button>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Included in every session:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Personalized attention</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Flexible scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>24-hour cancellation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Teacher Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Meet Your Teacher</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={skill.userImage || '/default-avatar.png'}
                  alt={skill.userName}
                  className="w-16 h-16 rounded-full border-4 border-cyan-100 object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{skill.userName}</h4>
                  <p className="text-gray-600">Skill Expert</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-medium">{skill.rating || 0}</span>
                    <span className="text-gray-500">({skill.totalBookings || 0} sessions)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Location: {skill.location || 'Online'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Verified Teacher</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate(`/profile/${skill.userId}`)}
                className="w-full mt-4 text-cyan-600 hover:text-cyan-700 font-medium py-2"
              >
                View Full Profile →
              </button>
            </div>

            {/* Safety Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Your Safety First</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>24-hour cancellation policy</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Session recording available</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Community guidelines enforced</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Skills */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Advanced Guitar Techniques', category: 'Music', price: 35, rating: 4.9 },
              { title: 'Music Theory Fundamentals', category: 'Music', price: 25, rating: 4.7 },
              { title: 'Song Writing Workshop', category: 'Music', price: 30, rating: 4.8 }
            ].map((related, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded">
                    {related.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-sm font-medium">{related.rating}</span>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{related.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700 font-bold">${related.price}</span>
                  <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}