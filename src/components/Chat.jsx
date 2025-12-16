import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Send, User, ArrowLeft, Clock, MoreVertical,
  Search, Phone, Video, Info, Paperclip, Image
} from 'lucide-react';
import { 
  collection, query, where, orderBy, 
  onSnapshot, addDoc, serverTimestamp,
  updateDoc, doc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { 
  getUserConversations, 
  getConversationMessages, 
  sendMessage,
  markMessagesAsRead,
  getOtherParticipant
} from '../services/chatService';
import { format } from 'date-fns';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Get conversation ID from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const conversationId = params.get('conversation');
    
    if (conversationId) {
      // Find conversation in list or create dummy one
      const foundConv = conversations.find(c => c.conversationId === conversationId);
      if (foundConv) {
        setSelectedConversation(foundConv);
      } else {
        // Create dummy conversation object
        const otherUserId = getOtherParticipant(conversationId, currentUser.uid);
        setSelectedConversation({
          conversationId: conversationId,
          participants: [currentUser.uid, otherUserId],
          participantNames: {
            [currentUser.uid]: currentUser.displayName,
            [otherUserId]: 'User'
          }
        });
      }
    }
  }, [location.search, conversations, currentUser]);

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        const convos = await getUserConversations(currentUser.uid);
        setConversations(convos);
        
        // If no conversation selected but we have conversations, select first one
        if (!selectedConversation && convos.length > 0) {
          setSelectedConversation(convos[0]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
    // Real-time listener for new messages
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', selectedConversation?.conversationId || ''),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      
      // Mark messages as read
      if (selectedConversation) {
        markMessagesAsRead(selectedConversation.conversationId, currentUser.uid);
      }
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [currentUser, selectedConversation]);

  // Get other user info
  useEffect(() => {
    if (selectedConversation && currentUser) {
      const otherId = getOtherParticipant(selectedConversation.conversationId, currentUser.uid);
      const otherName = selectedConversation.participantNames?.[otherId] || 'User';
      setOtherUser({ id: otherId, name: otherName });
    }
  }, [selectedConversation, currentUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !otherUser || !currentUser) return;

    try {
      await sendMessage(
        selectedConversation.conversationId,
        currentUser.uid,
        currentUser.displayName || 'User',
        otherUser.id,
        otherUser.name,
        newMessage.trim()
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'h:mm a');
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-800">Messages</h1>
              <p className="text-cyan-600">Chat with teachers and students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Sidebar - Conversations */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-cyan-600" />
                    </div>
                    <p className="text-gray-600">No conversations yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start a chat from a booking or skill page
                    </p>
                  </div>
                ) : (
                  conversations.map((convo) => {
                    const otherId = getOtherParticipant(convo.conversationId, currentUser.uid);
                    const otherName = convo.participantNames?.[otherId] || 'User';
                    const isSelected = selectedConversation?.conversationId === convo.conversationId;
                    
                    return (
                      <div
                        key={convo.conversationId}
                        onClick={() => setSelectedConversation(convo)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {otherName?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherName}
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {convo.lastMessageAt?.toDate ? 
                                  format(convo.lastMessageAt.toDate(), 'MMM d') : ''}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {convo.lastMessageBy === currentUser.uid ? 'You: ' : ''}
                              {convo.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="hidden md:flex flex-col flex-1">
              {selectedConversation && otherUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {otherUser.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {otherUser.name}
                        </h3>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Info className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Start the conversation!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isMe = msg.senderId === currentUser.uid;
                          
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${
                                  isMe
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                                }`}
                              >
                                <p>{msg.message}</p>
                                <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                                  isMe ? 'text-cyan-100' : 'text-gray-500'
                                }`}>
                                  <span>{formatMessageTime(msg.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:shadow-md disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                    <Send className="w-12 h-12 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Choose a conversation from the list or start a new chat from a booking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-only message */}
        <div className="md:hidden mt-4 p-4 bg-amber-50 rounded-xl">
          <p className="text-amber-800 text-sm">
            💡 For the best messaging experience, please use a tablet or desktop device.
          </p>
        </div>
      </div>
    </div>
  );
}