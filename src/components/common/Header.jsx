import React from "react";
import { Home } from "lucide-react";

export default function Header({ currentMode, setCurrentMode }) {
  if (currentMode === "teacher") return null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 타이틀 & 홈 버튼 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentMode("home")}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            title="처음 선택 화면으로"
          >
            <Home className="w-4 h-4" />
          </button>
          <h1 className="font-black text-slate-900 text-base sm:text-lg">
            학생 그림 그리기
          </h1>
        </div>

        {/* 우측 안내 문구 */}
        <div className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
          수업 활동 화면
        </div>
      </div>
    </header>
  );
}
