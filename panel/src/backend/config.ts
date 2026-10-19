// Firebase web config of the GabiTrainer project (public by design; access is guarded by firestore.rules).
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

// The only account allowed into the panel. Must match TRAINER_EMAIL in firebase/firestore.rules.
export const TRAINER_EMAIL = 'trener@example.com';
export const TRAINER = { fullName: 'Gabriela Mazur', initials: 'GM' };

// Set VITE_USE_EMULATOR=1 to run against the local Firebase emulators instead.
export const useEmulator = import.meta.env.VITE_USE_EMULATOR === '1';
