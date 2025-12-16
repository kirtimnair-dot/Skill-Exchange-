import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Filter, Star, MapPin, Clock, Users, Calendar,
  Music, Palette, Code, Book, Heart, Utensils,
  Dumbbell, Globe, GraduationCap, Camera, CheckCircle, Plus,
  IndianRupee, Edit, Trash2
} from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

export default function Skills() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  useEffect(() => {
    console.log('🎯 Skills page loaded');
    console.log('📁 Available routes should include: /skill/:id and /booking/:id');
  }, []);
  
  const categories = [
    { id: 'all', name: 'All Skills', icon: <Globe className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
    { id: 'music', name: 'Music', icon: <Music className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { id: 'art', name: 'Art & Design', icon: <Palette className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
    { id: 'tech', name: 'Technology', icon: <Code className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500' },
    { id: 'language', name: 'Languages', icon: <Book className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { id: 'wellness', name: 'Wellness', icon: <Heart className="w-5 h-5" />, color: 'from-red-500 to-orange-500' },
    { id: 'culinary', name: 'Culinary', icon: <Utensils className="w-5 h-5" />, color: 'from-amber-500 to-yellow-500' },
    { id: 'fitness', name: 'Fitness', icon: <Dumbbell className="w-5 h-5" />, color: 'from-lime-500 to-green-500' },
    { id: 'academic', name: 'Academic', icon: <GraduationCap className="w-5 h-5" />, color: 'from-indigo-500 to-purple-500' },
    { id: 'photography', name: 'Photography', icon: <Camera className="w-5 h-5" />, color: 'from-gray-500 to-slate-500' },
  ];

  // Fix: Parse availability from string to array
  const parseAvailability = (availability) => {
    if (!availability) return [];
    
    if (Array.isArray(availability)) {
      return availability;
    }
    
    if (typeof availability === 'string') {
      try {
        const cleaned = availability.replace(/^\[|\]$/g, '').replace(/"/g, '').replace(/'/g, '');
        return cleaned.split(',').map(item => item.trim()).filter(item => item);
      } catch (error) {
        console.error('Error parsing availability:', error);
        return [];
      }
    }
    
    return [];
  };

  const detectCategory = (skill) => {
    const skillText = (skill.title + ' ' + skill.description + ' ' + (skill.category || '')).toLowerCase();
    
    if (skillText.includes('music') || skillText.includes('guitar') || skillText.includes('piano') || 
        skillText.includes('sing') || skillText.includes('drum') || skillText.includes('violin')) {
      return 'music';
    }
    if (skillText.includes('art') || skillText.includes('design') || skillText.includes('draw') || 
        skillText.includes('paint') || skillText.includes('sketch')) {
      return 'art';
    }
    if (skillText.includes('code') || skillText.includes('program') || skillText.includes('web') || 
        skillText.includes('software') || skillText.includes('tech')) {
      return 'tech';
    }
    if (skillText.includes('language') || skillText.includes('spanish') || skillText.includes('english') || 
        skillText.includes('french') || skillText.includes('german')) {
      return 'language';
    }
    if (skillText.includes('yoga') || skillText.includes('meditation') || skillText.includes('wellness')) {
      return 'wellness';
    }
    if (skillText.includes('cook') || skillText.includes('food') || skillText.includes('baking')) {
      return 'culinary';
    }
    if (skillText.includes('fitness') || skillText.includes('gym') || skillText.includes('workout')) {
      return 'fitness';
    }
    if (skillText.includes('math') || skillText.includes('science') || skillText.includes('academic')) {
      return 'academic';
    }
    if (skillText.includes('photo') || skillText.includes('camera') || skillText.includes('edit')) {
      return 'photography';
    }
    
    return skill.category || 'other';
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const skillsRef = collection(db, 'skills');
      const q = query(skillsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const skillsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const detectedCategory = detectCategory(data);
        const availabilityArray = parseAvailability(data.availability);
        
        const skillId = doc.id;
        
        return {
          id: skillId,
          ...data,
          category: data.category || detectedCategory,
          availability: availabilityArray,
          rating: data.rating || 0,
          totalBookings: data.totalBookings || 0,
          userImage: data.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.userName || 'User')}&background=0ea5e9&color=fff`,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || new Date()),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || new Date())
        };
      });

      console.log('✅ Skills loaded:', skillsData.map(s => ({ id: s.id, title: s.title })));
      setSkills(skillsData);
      setFilteredSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${skillTitle}"?`)) {
      return;
    }
    
    try {
      const skillRef = doc(db, 'skills', skillId);
      await deleteDoc(skillRef);
      
      // Remove from local state
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      setFilteredSkills(prev => prev.filter(skill => skill.id !== skillId));
      
      alert('Skill deleted successfully!');
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill. Please try again.');
    }
  };

  useEffect(() => {
    let result = [...skills];

    if (selectedCategory !== 'all') {
      result = result.filter(skill => skill.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(skill => 
        skill.title.toLowerCase().includes(term) ||
        skill.description.toLowerCase().includes(term) ||
        skill.userName.toLowerCase().includes(term) ||
        (skill.category && skill.category.toLowerCase().includes(term))
      );
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'bookings':
        result.sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setFilteredSkills(result);
  }, [skills, selectedCategory, searchTerm, sortBy]);

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : <Globe className="w-5 h-5" />;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'from-cyan-500 to-blue-500';
  };

  const formatAvailability = (availability) => {
    if (!availability || !Array.isArray(availability) || availability.length === 0) {
      return 'Flexible schedule';
    }
    return availability.join(', ');
  };

  const handleAddSkill = () => {
    console.log('📝 Navigating to /add-skill');
    navigate('/add-skill');
  };

  const handleBookNow = (skillId, skillTitle) => {
    console.log('📅 Book Now clicked!');
    console.log('Skill ID:', skillId);
    console.log('Skill Title:', skillTitle);
    console.log('Navigating to:', `/booking/${skillId}`);
    
    if (!skillId || skillId.trim() === '') {
      console.error('❌ ERROR: skillId is empty! Cannot navigate.');
      alert('Error: Skill ID is missing. Please try again.');
      return;
    }
    
    navigate(`/booking/${skillId}`);
  };

  const handleViewDetails = (skillId, skillTitle) => {
    console.log('👁️ View Details clicked!');
    console.log('Skill ID:', skillId);
    console.log('Skill Title:', skillTitle);
    console.log('Navigating to:', `/skill/${skillId}`);
    
    if (!skillId || skillId.trim() === '') {
      console.error('❌ ERROR: skillId is empty! Cannot navigate.');
      alert('Error: Skill ID is missing. Please try again.');
      return;
    }
    
    navigate(`/skill/${skillId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-800 mb-2">Browse Skills</h1>
          <p className="text-cyan-600">Discover amazing skills to learn or share your own expertise</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{skills.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-100 text-cyan-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {[...new Set(skills.map(skill => skill.category).filter(Boolean))].length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Filter className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {skills.length > 0 
                    ? (skills.reduce((sum, skill) => sum + (skill.rating || 0), 0) / skills.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {[...new Set(skills.map(skill => skill.userId).filter(Boolean))].length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills (e.g., 'Guitar', 'Web Development', 'Yoga')"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="bookings">Most Booked</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.id 
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? `No skills matching "${searchTerm}"` 
                : selectedCategory !== 'all' 
                  ? `No skills in ${categories.find(c => c.id === selectedCategory)?.name} category`
                  : 'No skills available yet'
              }
            </p>
            <button
              onClick={handleAddSkill}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your First Skill
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-cyan-700">
                Showing <span className="font-bold">{filteredSkills.length}</span> skills
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </p>
              <button
                onClick={handleAddSkill}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-xl hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Teach a Skill
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill) => (
                <div 
                  key={skill.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100"
                >
                  {/* Category Badge */}
                  <div className={`p-4 bg-gradient-to-r ${getCategoryColor(skill.category || 'all')} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(skill.category || 'all')}
                        <span className="font-semibold">
                          {categories.find(c => c.id === skill.category)?.name || skill.category || 'Skill'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{(skill.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skill Content */}
                  <div className="p-6">
                    {/* Make the entire title area clickable */}
                    <div 
                      onClick={() => handleViewDetails(skill.id, skill.title)}
                      className="cursor-pointer"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-cyan-600 transition-colors">
                        {skill.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {skill.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{skill.location || 'Online'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{skill.duration || '1 hour'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatAvailability(skill.availability)}</span>
                      </div>
                      
                      {/* Updated Price Display with Rupee Symbol */}
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-cyan-600" />
                          <span className="text-lg font-bold text-cyan-700">₹{skill.price || 0}</span>
                          <span className="text-gray-500 text-sm">/session</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {skill.totalBookings || 0} bookings
                        </div>
                      </div>
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <img
                        src={skill.userImage}
                        alt={skill.userName}
                        className="w-10 h-10 rounded-full border-2 border-cyan-100"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{skill.userName}</p>
                        <p className="text-sm text-gray-500">Skill Expert</p>
                      </div>
                    </div>

                    {/* Edit/Delete buttons for skill owner */}
                    {currentUser && currentUser.uid === skill.userId && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                          <Link 
                            to={`/edit-skill/${skill.id}`}
                            className="flex-1 bg-cyan-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-cyan-600 text-center inline-flex items-center justify-center"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteSkill(skill.id, skill.title)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetails(skill.id, skill.title)}
                        className="flex-1 text-center bg-cyan-500 text-white py-3 rounded-lg hover:bg-cyan-600 transition font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleBookNow(skill.id, skill.title)}
                        className="flex-1 text-center bg-white text-cyan-600 border border-cyan-500 py-3 rounded-lg hover:bg-cyan-50 transition font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}