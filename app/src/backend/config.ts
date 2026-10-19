// Firebase web config of the GabiTrainer project (public by design; access is guarded by firestore.rules).
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

// Set EXPO_PUBLIC_USE_EMULATOR=1 to run against the local Firebase emulators instead.
export const useEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === '1';
