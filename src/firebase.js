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

// 사용자의 파이어베이스(whypoo-67a9e) 커스텀 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyCGNllZW0brNUW80SVQt1QzKGFJIM2YpgA",
  authDomain: "whypoo-67a9e.firebaseapp.com",
  projectId: "whypoo-67a9e",
  storageBucket: "whypoo-67a9e.firebasestorage.app",
  messagingSenderId: "745360462018",
  appId: "1:745360462018:web:0f1a238084f9ccaa51ab5b"
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

// 클라우드에 배변 기록 저장 (Safari 브라우저 & 홈화면 웹앱 간 100% 실시간 공유)
export const syncRecordsToCloud = async (recordsByDate) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'whypoo_app', 'main_records');
    await setDoc(docRef, {
      recordsByDate,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('클라우드 저장 실패:', error);
  }
};

// 클라우드 기록 실시간 구독
export const subscribeCloudRecords = (onRecordsChange) => {
  if (!db) return () => {};
  const docRef = doc(db, 'whypoo_app', 'main_records');

  return onSnapshot(
    docRef,
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
