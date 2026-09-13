import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";

// 고정 Firebase 클라우드 설정
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCb47pSt7Q7bHX5qJnrTo_x8TdicPogB8o",
  authDomain: "my-open-class.firebaseapp.com",
  projectId: "my-open-class",
  storageBucket: "my-open-class.firebasestorage.app",
  messagingSenderId: "61060291649",
  appId: "1:61060291649:web:d97ccd417d425dd64ebac0"
};

// Firebase 앱 및 Firestore 인스턴스 싱글톤
let app = null;
let db = null;

function getDbInstance() {
  try {
    if (!getApps().length) {
      app = initializeApp(FIREBASE_CONFIG);
    } else {
      app = getApp();
    }
    if (!db) {
      db = getFirestore(app);
    }
    return db;
  } catch (err) {
    console.error("Firebase init error:", err);
    return null;
  }
}

function generateDocId(tabletNumber, studentName) {
  const num = Number(tabletNumber) || 1;
  const name = (studentName || "익명").trim().replace(/[\/\s]/g, "_");
  return `tab${String(num).padStart(2, '0')}_${name}`;
}

// 1. 작품 제출 (학생용 -> Firebase Firestore 실시간 저장)
export async function submitDrawing({ roomId = "default-room", tabletNumber, studentName, imageBase64 }) {
  const db = getDbInstance();
  const num = Number(tabletNumber) || 1;
  const name = studentName.trim();
  const docId = generateDocId(num, name);
  
  const payload = {
    id: docId,
    tabletNumber: num,
    studentName: name,
    imageBase64,
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const docRef = doc(db, "rooms", roomId, "submissions", docId);
      await setDoc(docRef, {
        ...payload,
        serverTime: serverTimestamp(),
      });
      return { success: true, mode: "firebase" };
    } catch (error) {
      console.error("Firebase submit error:", error);
      throw error;
    }
  }

  throw new Error("데이터베이스 연결에 실패했습니다.");
}

// 2. 실시간 작품 목록 구독 (선생님용 -> Firebase Firestore 실시간 리스너)
export function subscribeToSubmissions(roomId = "default-room", onUpdate) {
  const db = getDbInstance();

  if (db) {
    const subsCol = collection(db, "rooms", roomId, "submissions");
    const q = query(subsCol, orderBy("tabletNumber", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissions = {};
      snapshot.forEach((docSnap) => {
        submissions[docSnap.id] = docSnap.data();
      });
      onUpdate(submissions, "firebase");
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    return unsubscribe;
  }

  return () => {};
}

// 3. 전체 리셋 (새 활동 시작)
export async function resetRoom(roomId = "default-room") {
  const db = getDbInstance();

  if (db) {
    try {
      const subsCol = collection(db, "rooms", roomId, "submissions");
      const snap = await getDocs(subsCol);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      return { success: true, mode: "firebase" };
    } catch (err) {
      console.error("Firebase reset error:", err);
      throw err;
    }
  }

  throw new Error("데이터베이스 연결에 실패했습니다.");
}
