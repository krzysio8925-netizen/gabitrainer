import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

import { firebaseConfig, useEmulator } from './config';

const app = initializeApp(useEmulator ? { apiKey: 'demo-key', projectId: 'demo-gabi', authDomain: 'localhost' } : firebaseConfig);

export const auth = getAuth(app);
// Verification and password-reset e-mails go out in Polish.
auth.languageCode = 'pl';
export const db = getFirestore(app);

if (useEmulator) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}
