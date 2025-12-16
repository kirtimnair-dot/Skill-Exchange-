import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/* Helpers */
const makeId = (a, b) => [a, b].sort().join('_');

export const getOtherParticipant = (id, uid) => {
  const [a, b] = id.split('_');
  return a === uid ? b : a;
};

/* Start Chat */
export const startChat = async (
  uid,
  uname,
  otherId,
  otherName
) => {
  const conversationId = makeId(uid, otherId);

  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId: uid,
      senderName: uname,
      receiverId: otherId,
      receiverName: otherName,
      message: "Hi! I'd like to chat.",
      read: false,
      createdAt: serverTimestamp()
    });
  }

  return { success: true, conversationId };
};

/* Send Message */
export const sendMessage = async (
  conversationId,
  senderId,
  senderName,
  receiverId,
  receiverName,
  text
) => {
  await addDoc(collection(db, 'messages'), {
    conversationId,
    senderId,
    senderName,
    receiverId,
    receiverName,
    message: text,
    read: false,
    createdAt: serverTimestamp()
  });
};

/* Get Messages */
export const getConversationMessages = async conversationId => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/* Conversations list */
export const getUserConversations = async uid => {
  const q = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);
  const map = new Map();

  snap.docs.forEach(d => {
    const m = d.data();
    if (m.senderId === uid || m.receiverId === uid) {
      if (!map.has(m.conversationId)) {
        map.set(m.conversationId, {
          conversationId: m.conversationId,
          lastMessage: m.message,
          participantNames: {
            [m.senderId]: m.senderName,
            [m.receiverId]: m.receiverName
          }
        });
      }
    }
  });

  return [...map.values()];
};

/* Mark read */
export const markMessagesAsRead = async (conversationId, uid) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    where('receiverId', '==', uid),
    where('read', '==', false)
  );

  const snap = await getDocs(q);

  await Promise.all(
    snap.docs.map(d =>
      updateDoc(doc(db, 'messages', d.id), { read: true })
    )
  );
};
