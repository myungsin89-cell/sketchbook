import React from "react";
import { Sparkles, Presentation, Tablet, ArrowRight } from "lucide-react";

export default function EntryHome({ onSelectRole }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 via-teal-50/40 to-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-8 animate-fadeIn">
        {/* 상단 로고 & 환영 타이틀 */}
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            우리 반 실시간 스케치북
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto">
            공개수업용 실시간 화면 공유 솔루션<br />
            아래에서 해당하는 역할을 선택해 주세요.
          </p>
        </div>

        {/* 역할 선택 대형 카드 버튼 2개 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {/* 1. 학생 버튼 */}
          <button
            onClick={() => onSelectRole("student")}
            className="group relative bg-white hover:bg-emerald-50/60 rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 hover:border-emerald-500 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:-translate-y-1.5 cursor-pointer text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
              <Tablet className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-800">
                👦 학생 입장
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                태블릿에서 그림을 그리고<br />선생님 화면으로 제출합니다.
              </p>
            </div>
            <div className="w-full pt-2 flex items-center justify-center space-x-1 text-xs font-black text-emerald-600 group-hover:text-emerald-700">
              <span>그림 그리기 시작하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. 선생님 버튼 */}
          <button
            onClick={() => onSelectRole("teacher")}
            className="group relative bg-white hover:bg-teal-50/60 rounded-3xl p-6 sm:p-8 border-2 border-teal-200 hover:border-teal-500 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:-translate-y-1.5 cursor-pointer text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-100 group-hover:bg-teal-600 text-teal-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
              <Presentation className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-teal-800">
                👩‍🏫 선생님 칠판
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                전자칠판에 띄우고<br />제출된 작품을 실시간 확인합니다.
              </p>
            </div>
            <div className="w-full pt-2 flex items-center justify-center space-x-1 text-xs font-black text-teal-600 group-hover:text-teal-700">
              <span>칠판 대시보드 열기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* 하단 안내 */}
        <div className="pt-4 text-xs text-slate-400">
          <span>💡 태블릿에는 [학생 입장]을 눌러 미리 켜두시면 편리합니다.</span>
        </div>
      </div>
    </div>
  );
}
