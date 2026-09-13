import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { 
  QrCode, 
  Download, 
  RotateCcw, 
  Users, 
  Home
} from "lucide-react";
import StudentCard from "./StudentCard";
import DetailModal from "./DetailModal";
import QRCodeModal from "./QRCodeModal";
import { subscribeToSubmissions, resetRoom } from "../../services/firebase";

export default function TeacherDashboard({ roomId = "default-room", onSwitchToHome, onSwitchToStudent }) {
  const [submissions, setSubmissions] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isQROpen, setIsQROpen] = useState(false);
  const [cardSize, setCardSize] = useState("large"); // 'huge' (2열) | 'large' (3열) | 'medium' (4열)
  const [isDownloading, setIsDownloading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSubmissions(roomId, (newSubs) => {
      setSubmissions(newSubs || {});
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [roomId]);

  const submittedList = Object.values(submissions)
    .filter((sub) => sub && sub.imageBase64)
    .map((sub) => ({
      id: sub.id,
      tabletNumber: Number(sub.tabletNumber) || 1,
      studentName: sub.studentName || "학생",
      submission: sub,
    }))
    .sort((a, b) => {
      if (a.tabletNumber !== b.tabletNumber) {
        return a.tabletNumber - b.tabletNumber;
      }
      return (a.submission.updatedAt || "").localeCompare(b.submission.updatedAt || "");
    });

  const submittedCount = submittedList.length;

  const handleDownloadAllZip = async () => {
    if (submittedCount === 0) {
      alert("다운로드할 제출 작품이 없습니다.");
      return;
    }

    try {
      setIsDownloading(true);
      const zip = new JSZip();
      const folder = zip.folder(`공개수업_작품모음_${new Date().toISOString().slice(0, 10)}`);

      submittedList.forEach((s) => {
        const base64Data = s.submission.imageBase64.split(",")[1];
        const filename = `태블릿${String(s.tabletNumber).padStart(2, "0")}번_${s.studentName || "학생"}.png`;
        folder.file(filename, base64Data, { base64: true });
      });

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `공개수업_학급작품_${new Date().toLocaleDateString("ko-KR").replace(/\. /g, "-").replace(".", "")}.zip`);
    } catch (err) {
      console.error("ZIP 생성 오류:", err);
      alert("ZIP 압축 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResetAll = async () => {
    if (window.confirm("현재 제출된 모든 작품을 비우고 새 활동을 시작하시겠습니까?\n(필요한 경우 먼저 [전체 저장]을 해주세요)")) {
      try {
        setIsResetting(true);
        await resetRoom(roomId);
      } catch (err) {
        alert("초기화 실패: " + err.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const getGridColsClass = () => {
    if (cardSize === "huge") {
      return "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 sm:gap-8";
    }
    if (cardSize === "large") {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6";
    }
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4";
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {/* 1. 슬림 상단 바 */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 sm:px-8 py-3">
        <div className="w-full flex items-center justify-between flex-wrap gap-3">
          {/* 좌측: 홈 버튼 & 타이틀 & 실시간 제출 개수 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onSwitchToHome}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              title="처음 역할 선택 화면으로"
            >
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>우리 반 실시간 스케치북</span>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-xl text-xs sm:text-sm font-bold border border-emerald-200">
                {submittedCount}명 제출됨
              </span>
            </h1>
          </div>

          {/* 우측: 도구 모음 */}
          <div className="flex items-center flex-wrap gap-2">
            {/* 크기 토글 */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setCardSize("huge")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  cardSize === "huge" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                2열 (초대형)
              </button>
              <button
                onClick={() => setCardSize("large")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  cardSize === "large" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                3~4열 (크게)
              </button>
              <button
                onClick={() => setCardSize("medium")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  cardSize === "medium" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                모아보기
              </button>
            </div>

            {/* QR코드 */}
            <button
              onClick={() => setIsQROpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center space-x-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>QR코드</span>
            </button>

            {/* 전체 저장 */}
            <button
              onClick={handleDownloadAllZip}
              disabled={isDownloading || submittedCount === 0}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center space-x-1.5 ${
                submittedCount > 0
                  ? "bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-xs"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
              title="제출 작품 전체 ZIP 저장"
            >
              <Download className="w-4 h-4" />
              <span>전체 저장</span>
            </button>

            {/* 새 활동 */}
            <button
              onClick={handleResetAll}
              disabled={isResetting}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5"
              title="화면 초기화"
            >
              <RotateCcw className="w-4 h-4" />
              <span>새 활동</span>
            </button>

            {/* 학생 화면 전환 */}
            <button
              onClick={onSwitchToStudent}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 border border-slate-200"
              title="학생 화면으로 전환"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">학생 화면</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. 풀 와이드 갤러리 영역 */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-6">
        {submittedCount > 0 ? (
          <div className={`grid ${getGridColsClass()}`}>
            {submittedList.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onClick={setSelectedStudent}
              />
            ))}
          </div>
        ) : (
          /* 대기 화면 */
          <div className="bg-white rounded-3xl p-12 sm:p-24 border-2 border-dashed border-slate-300 text-center flex flex-col items-center justify-center space-y-4 shadow-xs mt-4 max-w-4xl mx-auto">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-3xl font-black text-slate-800">
                학생들의 작품을 기다리고 있습니다
              </h3>
              <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
                태블릿에서 <b>[제출하기]</b>를 누르면 이 화면에 큼직하게 바로 나타납니다.
              </p>
            </div>
            <button
              onClick={() => setIsQROpen(true)}
              className="mt-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-200 transition flex items-center space-x-2"
            >
              <QrCode className="w-5 h-5" />
              <span>학생 접속용 QR코드 칠판에 띄우기</span>
            </button>
          </div>
        )}
      </main>

      {/* 발표용 전체화면 모달 */}
      <DetailModal
        selectedStudent={selectedStudent}
        studentList={submittedList}
        onClose={() => setSelectedStudent(null)}
        onSelectStudent={setSelectedStudent}
      />

      {/* 대형 QR코드 모달 */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </div>
  );
}
