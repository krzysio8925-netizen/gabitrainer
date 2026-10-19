// Firebase web config of the GabiTrainer project (public by design; access is guarded by firestore.rules).
export const firebaseConfig = {
  apiKey: 'AIzaSyDZC_XNjIWuKN5ob-1kIsc2txLFTHNfyK4',
  authDomain: 'gabitrainer.firebaseapp.com',
  projectId: 'gabitrainer',
  storageBucket: 'gabitrainer.firebasestorage.app',
  messagingSenderId: '151954042703',
  appId: '1:151954042703:web:4d3d83afb8f31fbbe45f3a',
};

// Set EXPO_PUBLIC_USE_EMULATOR=1 to run against the local Firebase emulators instead.
export const useEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === '1';
