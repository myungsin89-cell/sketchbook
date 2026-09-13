import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Tablet, Sparkles } from "lucide-react";
import { saveAs } from "file-saver";

export default function DetailModal({
  selectedStudent,
  studentList = [],
  onClose,
  onSelectStudent,
}) {
  if (!selectedStudent) return null;

  const currentIndex = studentList.findIndex(
    (s) => s.id === selectedStudent.id
  );

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      onSelectStudent(studentList[currentIndex - 1]);
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (currentIndex < studentList.length - 1) {
      onSelectStudent(studentList[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, studentList]);

  const imageBase64 = selectedStudent.submission?.imageBase64 || selectedStudent.imageBase64;
  const tabletNumber = selectedStudent.tabletNumber || 1;
  const studentName = selectedStudent.studentName || "학생";

  const handleDownload = (e) => {
    if (e) e.stopPropagation();
    if (!imageBase64) return;
    const filename = `태블릿${tabletNumber}번_${studentName}_그림.png`;
    saveAs(imageBase64, filename);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 animate-fadeIn select-none"
      onClick={onClose}
    >
      {/* 전체를 꽉 채우는 밝고 거대한 화이트 캔버스 전시 프레임 */}
      <div 
        className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 상단 화사하고 큼직한 타이틀 바 */}
        <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-6 sm:px-10 py-3 sm:py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white text-emerald-800 font-black text-sm sm:text-lg flex items-center space-x-1.5 shadow-sm">
              <Tablet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span>태블릿 {tabletNumber}번</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{studentName} 학생</span>
              <span className="text-emerald-200 text-base sm:text-xl font-bold hidden sm:inline">작품 발표</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 sm:px-4 sm:py-2 bg-white/15 hover:bg-white/30 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 border border-white/20"
              title="이미지 저장"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/20 hover:bg-white/40 text-white transition border border-white/30"
              title="닫기 (ESC)"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>

        {/* 2. 중앙 화면 꽉 찬 초대형 그림 영역 (흰색 배경 + 최대 확장) */}
        <div className="flex-1 w-full relative flex items-center justify-center p-2 sm:p-6 bg-slate-50/50 overflow-hidden">
          {imageBase64 ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={imageBase64}
                alt={`태블릿 ${tabletNumber}번 ${studentName}`}
                className="w-full h-full object-contain rounded-2xl shadow-xl bg-white border border-slate-200"
              />
            </div>
          ) : (
            <div className="text-slate-400 text-xl font-bold bg-white px-8 py-6 rounded-3xl border border-slate-200 shadow-sm">
              제출된 그림이 없습니다.
            </div>
          )}

          {/* 이전 작품 넘기기 (초대형 화이트/에메랄드 플로팅 버튼) */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-800 flex items-center justify-center border-2 border-slate-200 hover:border-emerald-500 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 z-20"
              title="이전 작품 (←)"
            >
              <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          )}

          {/* 다음 작품 넘기기 (초대형 화이트/에메랄드 플로팅 버튼) */}
          {currentIndex < studentList.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-800 flex items-center justify-center border-2 border-slate-200 hover:border-emerald-500 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 z-20"
              title="다음 작품 (→)"
            >
              <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          )}
        </div>

        {/* 3. 하단 상태 바 */}
        <div className="w-full bg-white px-6 sm:px-10 py-2.5 sm:py-3 flex items-center justify-between text-xs sm:text-sm text-slate-500 border-t border-slate-100 shrink-0">
          <span className="font-semibold text-slate-600">
            💡 키보드 방향키(←, →) 또는 화면 좌우 화살표를 눌러 다음 학생 작품으로 발표를 넘기세요.
          </span>
          <span className="font-black text-emerald-700 text-sm sm:text-base bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {currentIndex + 1} / {studentList.length} 번째 작품
          </span>
        </div>
      </div>
    </div>
  );
}
