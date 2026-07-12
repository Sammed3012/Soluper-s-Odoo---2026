import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "pure-zepplin-27c1c",
  appId: "1:202099186427:web:3b174da6d57500cc0c2e5e",
  apiKey: "AIzaSyBQvI30uVb4DYTzeHKwtjogXTDyrEYnG2s",
  authDomain: "pure-zepplin-27c1c.firebaseapp.com",
  storageBucket: "pure-zepplin-27c1c.firebasestorage.app",
  messagingSenderId: "202099186427"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-91b48ff4-370f-4dcf-af2c-2b28aaec2949");

export { db };
