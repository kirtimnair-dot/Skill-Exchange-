import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

// ========== TEST CONNECTION ==========
export const testFirebaseConnection = async () => {
  try {
    // Test write operation
    const testRef = await addDoc(collection(db, "testConnection"), {
      message: "Testing Firebase connection",
      timestamp: serverTimestamp(),
      randomId: Math.random().toString(36).substring(7)
    });
    
    // Test read operation
    const querySnapshot = await getDocs(collection(db, "testConnection"));
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      success: true,
      writeId: testRef.id,
      readCount: documents.length,
      message: "✅ Firebase connection successful!"
    };
  } catch (error) {
    console.error("Firebase error:", error);
    return {
      success: false,
      error: error.message,
      message: "❌ Firebase connection failed!"
    };
  }
};

// ========== USER OPERATIONS ==========
export const userService = {
  // Create or update user
  async createOrUpdateUser(userId, userData) {
    try {
      await setDoc(doc(db, "users", userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, userId };
    } catch (error) {
      console.error("Error saving user:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user by ID
  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return { success: true, user: { id: userDoc.id, ...userDoc.data() } };
      }
      return { success: false, error: "User not found" };
    } catch (error) {
      console.error("Error getting user:", error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  async updateUser(userId, updates) {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  }
};

// ========== SKILL OPERATIONS ==========
export const skillService = {
  // Create new skill
  async createSkill(skillData) {
    try {
      const docRef = await addDoc(collection(db, "skills"), {
        ...skillData,
        rating: 0,
        totalBookings: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, skillId: docRef.id };
    } catch (error) {
      console.error("Error creating skill:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all skills
  async getAllSkills() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "skills"), orderBy("createdAt", "desc"))
      );
      const skills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, skills };
    } catch (error) {
      console.error("Error getting skills:", error);
      return { success: false, error: error.message, skills: [] };
    }
  },

  // Get skill by ID
  async getSkill(skillId) {
    try {
      const skillDoc = await getDoc(doc(db, "skills", skillId));
      if (skillDoc.exists()) {
        return { success: true, skill: { id: skillDoc.id, ...skillDoc.data() } };
      }
      return { success: false, error: "Skill not found" };
    } catch (error) {
      console.error("Error getting skill:", error);
      return { success: false, error: error.message };
    }
  },

  // Get skills by user ID
  async getSkillsByUser(userId) {
    try {
      const q = query(collection(db, "skills"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const skills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, skills };
    } catch (error) {
      console.error("Error getting user skills:", error);
      return { success: false, error: error.message, skills: [] };
    }
  }
};

// ========== BOOKING OPERATIONS ==========
export const bookingService = {
  // Create new booking
  async createBooking(bookingData) {
    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        ...bookingData,
        status: "pending",
        paymentStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, bookingId: docRef.id };
    } catch (error) {
      console.error("Error creating booking:", error);
      return { success: false, error: error.message };
    }
  },

  // Get bookings by user (as student or teacher)
  async getBookingsByUser(userId, role = "student") {
    try {
      const field = role === "student" ? "studentId" : "teacherId";
      const q = query(
        collection(db, "bookings"), 
        where(field, "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, bookings };
    } catch (error) {
      console.error("Error getting bookings:", error);
      return { success: false, error: error.message, bookings: [] };
    }
  }
};

// ========== MESSAGE OPERATIONS ==========
export const messageService = {
  // Send message
  async sendMessage(messageData) {
    try {
      const docRef = await addDoc(collection(db, "messages"), {
        ...messageData,
        read: false,
        createdAt: serverTimestamp()
      });
      return { success: true, messageId: docRef.id };
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }
  },

  // Get messages between two users
  async getMessages(user1Id, user2Id) {
    try {
      const conversationId = [user1Id, user2Id].sort().join("_");
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, messages };
    } catch (error) {
      console.error("Error getting messages:", error);
      return { success: false, error: error.message, messages: [] };
    }
  }
};

// ========== REVIEW OPERATIONS ==========
export const reviewService = {
  // Create review
  async createReview(reviewData) {
    try {
      const docRef = await addDoc(collection(db, "reviews"), {
        ...reviewData,
        createdAt: serverTimestamp()
      });
      return { success: true, reviewId: docRef.id };
    } catch (error) {
      console.error("Error creating review:", error);
      return { success: false, error: error.message };
    }
  },

  // Get reviews for a user
  async getReviewsByUser(userId) {
    try {
      const q = query(
        collection(db, "reviews"),
        where("revieweeId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, reviews };
    } catch (error) {
      console.error("Error getting reviews:", error);
      return { success: false, error: error.message, reviews: [] };
    }
  }
};