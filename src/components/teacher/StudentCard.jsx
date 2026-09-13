import React from "react";
import { ZoomIn, Tablet } from "lucide-react";

export default function StudentCard({ student, onClick }) {
  const { tabletNumber, studentName, submission } = student;
  const isSubmitted = Boolean(submission && submission.imageBase64);

  if (!isSubmitted) return null;

  return (
    <div
      onClick={() => onClick(student)}
      className="group relative bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between animate-fadeIn"
    >
      {/* 상단: 태블릿 번호 뱃지 & 학생 이름 */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="px-2.5 py-1.5 rounded-2xl bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center space-x-1 shrink-0">
            <Tablet className="w-3.5 h-3.5" />
            <span>{tabletNumber}번</span>
          </span>
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate tracking-tight">
              {studentName}
            </h3>
          </div>
        </div>

        {/* 제출 시간 */}
        {submission?.updatedAt && (
          <span className="text-xs sm:text-sm font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
            {new Date(submission.updatedAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* 중앙: 큼직한 그림 영역 */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shadow-inner">
        <img
          src={submission.imageBase64}
          alt={`태블릿 ${tabletNumber}번 ${studentName} 작품`}
          className="w-full h-full object-contain bg-white transition duration-300 group-hover:scale-105"
        />
        
        {/* 호버/터치 시 확대 보기 오버레이 */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
          <div className="flex items-center space-x-2 bg-emerald-600 px-4 py-2 rounded-2xl text-sm sm:text-base font-bold shadow-xl transform scale-95 group-hover:scale-100 transition-transform">
            <ZoomIn className="w-5 h-5" />
            <span>화면 가득 크게 보기</span>
          </div>
        </div>
      </div>

      {/* 하단 안내 문구 */}
      <div className="mt-3 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500">
        <span className="text-slate-600 font-bold">
          터치하여 발표 모드
        </span>
        <span className="text-slate-400">클릭 시 확대</span>
      </div>
    </div>
  );
}
