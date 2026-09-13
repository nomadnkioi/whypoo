import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

// 파이어베이스 프로젝트 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey_whypoo_firebase",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "whypoo-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "whypoo-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "whypoo-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:whypoo",
};

let app;
let auth;
let db;
let isFirebaseConfigured = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseConfigured = true;
} catch (e) {
  console.warn('Firebase 초기화 경고:', e);
}

// UI 로그인 없이 백그라운드 100% 무자각 익명 클라우드 연동
export const initSilentCloudAuth = async () => {
  if (!auth) return null;
  try {
    if (!auth.currentUser) {
      const userCred = await signInAnonymously(auth);
      return userCred.user;
    }
    return auth.currentUser;
  } catch (e) {
    console.warn('익명 클라우드 로그인 세션:', e);
    return null;
  }
};

export const subscribeAuth = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// 클라우드에 배변 기록 저장
export const syncRecordsToCloud = async (userId, recordsByDate) => {
  if (!db || !userId) return;
  try {
    const userDocRef = doc(db, 'users', userId, 'poop_data', 'records');
    await setDoc(userDocRef, {
      recordsByDate,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('클라우드 저장 실패:', error);
  }
};

// 클라우드 기록 실시간 구독
export const subscribeCloudRecords = (userId, onRecordsChange) => {
  if (!db || !userId) return () => {};
  const userDocRef = doc(db, 'users', userId, 'poop_data', 'records');

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.recordsByDate) {
          onRecordsChange(data.recordsByDate);
        }
      }
    },
    (error) => {
      console.error('클라우드 동기화 수신 오류:', error);
    }
  );
};

export { auth, db, isFirebaseConfigured };
