import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, DollarSign, Clock, MapPin, Calendar, 
  Users, BookOpen, Tag, Info
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

export default function AddSkill() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    duration: '60',
    location: '',
    availability: [],
    maxStudents: '1',
    prerequisites: '',
    materials: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'Music', 'Technology', 'Language', 'Cooking', 'Fitness',
    'Arts & Crafts', 'Business', 'Academics', 'Sports', 'Other'
  ];

  const availabilityOptions = [
    'Weekdays Morning', 'Weekdays Afternoon', 'Weekdays Evening',
    'Weekends Morning', 'Weekends Afternoon', 'Weekends Evening',
    'Flexible Schedule'
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setError('');
    
    if (type === 'checkbox') {
      // Handle availability checkboxes
      if (name === 'availability') {
        const isChecked = e.target.checked;
        const optionValue = e.target.value;
        
        setFormData(prev => ({
          ...prev,
          availability: isChecked 
            ? [...prev.availability, optionValue]
            : prev.availability.filter(item => item !== optionValue)
        }));
      }
    } else if (name === 'priceSlider') {
      // Handle price slider
      setFormData(prev => ({
        ...prev,
        price: parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Please login to add a skill');
      navigate('/login');
      return;
    }

    if (!formData.title || !formData.category || !formData.description) {
      setError('Please fill all required fields');
      return;
    }

    if (!formData.price || formData.price < 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll skip image upload to storage
      // You can implement Firebase Storage upload later
      let imageUrl = imagePreview || '';
      
      const skillData = {
        ...formData,
        price: parseInt(formData.price) || 0,
        duration: parseInt(formData.duration) || 60,
        maxStudents: parseInt(formData.maxStudents) || 1,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        userImage: currentUser.photoURL || '',
        userEmail: currentUser.email || '',
        imageUrl,
        rating: 0,
        totalBookings: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      console.log('Adding skill with data:', skillData);
      
      // Add skill to Firestore
      const docRef = await addDoc(collection(db, 'skills'), skillData);
      console.log('Skill added successfully with ID:', docRef.id);
      
      // Redirect to homepage instead of skill details
      navigate('/');
    } catch (error) {
      console.error('Error adding skill:', error);
      setError(`Failed to add skill: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Share Your Skill</h1>
              <p className="text-gray-600">Teach what you love and earn money</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title & Category */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Skill Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Guitar Lessons for Beginners"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe what you'll teach, your teaching style, and what students will learn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p className="text-sm text-gray-500 mt-2">Be descriptive to attract more students</p>
            </div>

            {/* Pricing Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Pricing</h3>
              </div>
              
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Price per Session (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="50"
                    placeholder="500"
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-2xl font-bold"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Average price for similar skills: ₹300-1000</p>
                
                {/* Price Range Slider */}
                <div className="mt-4">
                  <input
                    type="range"
                    name="priceSlider"
                    min="0"
                    max="2000"
                    step="50"
                    value={formData.price || 0}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${(formData.price || 0) / 2000 * 100}%, #e5e7eb ${(formData.price || 0) / 2000 * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹500</span>
                    <span>₹1000</span>
                    <span>₹1500</span>
                    <span>₹2000+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration & Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Session Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Online or Physical location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Availability
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availabilityOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-green-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="availability"
                      value={option}
                      checked={formData.availability.includes(option)}
                      onChange={handleInputChange}
                      className="text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  <Users className="inline w-4 h-4 mr-2" />
                  Maximum Students
                </label>
                <select
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="1">1 (One-on-One)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="10">10+ (Group Class)</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  <Tag className="inline w-4 h-4 mr-2" />
                  Prerequisites
                </label>
                <input
                  type="text"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  placeholder="e.g., Basic computer knowledge"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Skill Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag & drop or click to upload</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="inline-block mt-4 px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 cursor-pointer"
                    >
                      Choose Image
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Publishing Skill...
                  </div>
                ) : (
                  `Publish Skill - ₹${formData.price || 0} per session`
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                By publishing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}