const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // Get from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixAvailability() {
  try {
    const skillsSnapshot = await db.collection('skills').get();
    
    console.log(`Found ${skillsSnapshot.size} skills to fix...`);
    
    const batch = db.batch();
    let count = 0;
    
    skillsSnapshot.forEach(doc => {
      const data = doc.data();
      const availability = data.availability;
      
      // If availability is a string that looks like an array, fix it
      if (typeof availability === 'string' && availability.includes('[')) {
        try {
          // Parse the string array
          const fixedArray = JSON.parse(availability.replace(/'/g, '"'));
          
          if (Array.isArray(fixedArray)) {
            batch.update(doc.ref, { availability: fixedArray });
            console.log(`Fixed skill: ${doc.id}, availability: ${fixedArray}`);
            count++;
          }
        } catch (error) {
          console.log(`Could not parse availability for skill ${doc.id}:`, availability);
        }
      }
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`Successfully fixed ${count} skills!`);
    } else {
      console.log('No skills needed fixing.');
    }
    
  } catch (error) {
    console.error('Error fixing skills:', error);
  }
}

fixAvailability();
