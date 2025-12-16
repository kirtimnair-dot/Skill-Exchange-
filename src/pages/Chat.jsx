import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getOtherParticipant
} from '../services/chatService';
import { Send } from 'lucide-react';

export default function Chat() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  /* Guard: user not logged in */
  if (!currentUser) {
    return (
      <div className="p-10 text-center text-red-600">
        Please log in to access chat.
      </div>
    );
  }

  /* Load conversations */
  useEffect(() => {
    getUserConversations(currentUser.uid).then(setConversations);
  }, [currentUser.uid]);

  /* Load messages when conversation changes */
  useEffect(() => {
    if (!activeConversation) return;

    getConversationMessages(activeConversation.conversationId).then(msgs => {
      setMessages(msgs);
      markMessagesAsRead(
        activeConversation.conversationId,
        currentUser.uid
      );
    });
  }, [activeConversation, currentUser.uid]);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeConversation) return;

    const otherId = getOtherParticipant(
      activeConversation.conversationId,
      currentUser.uid
    );

    await sendMessage(
      activeConversation.conversationId,
      currentUser.uid,
      currentUser.displayName || 'User',
      otherId,
      'User',
      text
    );

    setText('');
    const updated = await getConversationMessages(
      activeConversation.conversationId
    );
    setMessages(updated);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 border-r overflow-y-auto">
        {conversations.map(c => (
          <div
            key={c.conversationId}
            onClick={() => setActiveConversation(c)}
            className="p-4 cursor-pointer hover:bg-cyan-50 border-b"
          >
            <p className="font-semibold">
              {
                c.participantNames[
                  getOtherParticipant(
                    c.conversationId,
                    currentUser.uid
                  )
                ]
              }
            </p>
            <p className="text-sm text-gray-500 truncate">
              {c.lastMessage}
            </p>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map(m => (
            <div
              key={m.id}
              className={`mb-2 ${
                m.senderId === currentUser.uid
                  ? 'text-right'
                  : 'text-left'
              }`}
            >
              <span className="inline-block px-4 py-2 rounded-xl bg-white shadow">
                {m.message}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 border rounded-full px-4 py-2"
            placeholder="Type a message"
          />
          <button
            onClick={handleSend}
            className="bg-cyan-500 text-white p-3 rounded-full"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
