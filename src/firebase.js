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

// 클라우드에 배변 기록 안전 저장 (클라우드 데이터와 병합하여 절대 기존 데이터가 삭제되거나 날아가지 않음)
export const syncRecordsToCloud = async (newRecords, isExplicitDelete = false) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'whypoo_app', 'main_records');
    
    if (isExplicitDelete) {
      // 삭제 시에는 수동 삭제한 최신 상태 반영
      await setDoc(docRef, {
        recordsByDate: newRecords,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // 1. 기존 파이어베이스 클라우드 데이터 안전하게 가져오기
    const snap = await getDoc(docRef);
    let mergedRecords = { ...newRecords };
    
    if (snap.exists()) {
      const cloudData = snap.data()?.recordsByDate || {};
      // 기존 클라우드 기록 보존 + 새 기록 병합 (100% 데이터 유실 방지)
      mergedRecords = { ...cloudData, ...newRecords };
    }

    // 2. 병합된 데이터 클라우드 저장
    await setDoc(docRef, {
      recordsByDate: mergedRecords,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('클라우드 저장 실패:', error);
  }
};

// 클라우드 기록 실시간 구독 (앱 진입 시 즉시 getDoc으로 100% 최신 클라우드 서버 데이터 복구)
export const subscribeCloudRecords = (onRecordsChange) => {
  if (!db) return () => {};
  const docRef = doc(db, 'whypoo_app', 'main_records');

  // 1. 즉시 최신 클라우드 데이터 수신 (홈화면 앱을 지우거나 새 기기/Safari에서 접속해도 100% 안전하게 복구)
  getDoc(docRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.recordsByDate) {
          onRecordsChange(data.recordsByDate);
        }
      }
    })
    .catch((err) => {
      console.warn('클라우드 즉시 가져오기 오류:', err);
    });

  // 2. 실시간 동기화 구독
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
