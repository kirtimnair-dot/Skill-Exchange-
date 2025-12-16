// src/pages/EditSkill.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Upload, DollarSign, Clock, MapPin, 
  Calendar, Users, BookOpen, Tag, Info, Save, Trash2
} from 'lucide-react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function EditSkill() {
  const { id } = useParams();
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const categories = [
    'Music', 'Technology', 'Language', 'Cooking', 'Fitness',
    'Arts & Crafts', 'Business', 'Academics', 'Sports', 'Other'
  ];
  
  const availabilityOptions = [
    'Weekdays Morning', 'Weekdays Afternoon', 'Weekdays Evening',
    'Weekends Morning', 'Weekends Afternoon', 'Weekends Evening',
    'Flexible Schedule'
  ];
  
  useEffect(() => {
    if (id) {
      fetchSkill();
    }
  }, [id]);
  
  const fetchSkill = async () => {
    try {
      const docRef = doc(db, 'skills', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const skillData = docSnap.data();
        
        // Check if current user owns this skill
        if (currentUser.uid !== skillData.userId) {
          alert('You can only edit your own skills');
          navigate('/skills');
          return;
        }
        
        setFormData({
          title: skillData.title || '',
          category: skillData.category || '',
          description: skillData.description || '',
          price: skillData.price || '',
          duration: skillData.duration || '60',
          location: skillData.location || '',
          availability: Array.isArray(skillData.availability) 
            ? skillData.availability 
            : typeof skillData.availability === 'string' 
              ? skillData.availability.replace(/[\[\]"]/g, '').split(',').map(item => item.trim())
              : [],
          maxStudents: skillData.maxStudents || '1',
          prerequisites: skillData.prerequisites || '',
          materials: skillData.materials || ''
        });
        
        if (skillData.imageUrl) {
          setImagePreview(skillData.imageUrl);
        }
      } else {
        alert('Skill not found');
        navigate('/skills');
      }
    } catch (error) {
      console.error('Error fetching skill:', error);
      alert('Failed to load skill');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
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
      alert('Please login to edit a skill');
      navigate('/login');
      return;
    }
    
    if (!formData.price || formData.price < 0) {
      setError('Please enter a valid price');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Upload image to storage if exists
      let imageUrl = formData.imageUrl || '';
      if (imageFile) {
        // Implement image upload logic here
        // const storageRef = ref(storage, `skills/${Date.now()}_${imageFile.name}`);
        // const snapshot = await uploadBytes(storageRef, imageFile);
        // imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const skillRef = doc(db, 'skills', id);
      await updateDoc(skillRef, {
        ...formData,
        price: parseInt(formData.price),
        duration: parseInt(formData.duration),
        maxStudents: parseInt(formData.maxStudents),
        imageUrl,
        updatedAt: new Date()
      });
      
      alert('Skill updated successfully!');
      navigate(`/skill/${id}`);
      
    } catch (error) {
      console.error('Error updating skill:', error);
      setError('Failed to update skill. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
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
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-600">Loading skill details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Skill</h1>
                <p className="text-gray-600">Update your skill details</p>
              </div>
            </div>
            
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Skill'}
            </button>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Same form fields as AddSkill.jsx but with current values */}
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
                    <div className="flex gap-2 justify-center">
                      <label className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 cursor-pointer">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setImagePreview('')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Remove Image
                      </button>
                    </div>
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
            
            {/* Pricing */}
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
                    step="10"
                    placeholder="500"
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-2xl font-bold"
                    required
                  />
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
            
            {/* Materials */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Required Materials
              </label>
              <input
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                placeholder="e.g., Guitar, notebook, laptop"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating Skill...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Skill - ₹{formData.price || 0} per session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}