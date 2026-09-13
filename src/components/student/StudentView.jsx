import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { Send, CheckCircle2, User, Tablet, Loader2, Sparkles, UserPlus } from "lucide-react";
import DrawingCanvas from "./DrawingCanvas";
import ToolBar from "./ToolBar";
import { submitDrawing } from "../../services/firebase";

export default function StudentView({ roomId = "default-room" }) {
  const [tabletNumber, setTabletNumber] = useState(() => {
    return localStorage.getItem("student_saved_tablet_num") || "1";
  });
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem("student_saved_name") || "";
  });
  
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(8);

  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("student_saved_tablet_num", tabletNumber);
  }, [tabletNumber]);

  useEffect(() => {
    localStorage.setItem("student_saved_name", studentName);
  }, [studentName]);

  // 제출 처리
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      alert("학생 이름을 입력해주세요!");
      return;
    }

    if (!canvasRef.current) return;
    const imageBase64 = canvasRef.current.getImageDataURL();
    if (!imageBase64) {
      alert("그림 데이터를 불러올 수 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitDrawing({
        roomId,
        tabletNumber: Number(tabletNumber),
        studentName: studentName.trim(),
        imageBase64,
      });

      setLastSubmittedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setSubmitSuccess(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
      });

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (err) {
      console.error("제출 실패:", err);
      alert("제출 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다른 친구가 이 태블릿으로 새로 그릴 때
  const handleSwitchToNextStudent = () => {
    if (window.confirm("다음 친구가 그릴 수 있도록 이름과 도화지를 비우시겠습니까?\n(방금 제출한 작품은 선생님 화면에 안전하게 저장되어 있습니다)")) {
      setStudentName("");
      setLastSubmittedAt(null);
      setSubmitSuccess(false);
      canvasRef.current?.clear();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col gap-3 min-h-[calc(100vh-4rem)]">
      {/* 1. 상단 정보 입력 바 (태블릿 번호 & 이름 & 교대 버튼) */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-emerald-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
          {/* 태블릿 번호 선택 */}
          <div className="relative flex items-center">
            <div className="absolute left-2.5 text-emerald-600 pointer-events-none flex items-center space-x-1">
              <Tablet className="w-4 h-4" />
            </div>
            <select
              value={tabletNumber}
              onChange={(e) => {
                setTabletNumber(e.target.value);
                setLastSubmittedAt(null);
              }}
              className="pl-8 pr-6 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer hover:bg-emerald-100 transition"
              title="태블릿 번호"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  태블릿 {num}번
                </option>
              ))}
            </select>
          </div>

          {/* 학생 이름 입력 */}
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="내 이름 입력 (예: 홍길동)"
              maxLength={12}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* 오른쪽: 제출 상태 / 다음 친구 교대 */}
        <div className="flex items-center space-x-2">
          {lastSubmittedAt ? (
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>제출 완료 ({lastSubmittedAt})</span>
            </div>
          ) : null}

          {/* 다음 학생 교대 버튼 */}
          <button
            type="button"
            onClick={handleSwitchToNextStudent}
            className="px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200"
            title="다른 친구가 이 태블릿으로 그릴 때 눌러주세요"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>다음 친구가 그리기</span>
          </button>
        </div>
      </div>

      {/* 제출 완료 토스트 */}
      {submitSuccess && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2 text-sm font-bold">
            <Sparkles className="w-5 h-5" />
            <span>[{tabletNumber}번 태블릿] {studentName} 학생의 작품이 등록되었습니다! 🎉</span>
          </div>
          <button
            onClick={handleSwitchToNextStudent}
            className="px-3 py-1 bg-white text-emerald-800 rounded-xl text-xs font-black shadow-xs hover:bg-emerald-50 transition"
          >
            다음 친구에게 넘기기 →
          </button>
        </div>
      )}

      {/* 2. 도구 툴바 */}
      <ToolBar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
        onClear={() => {
          if (window.confirm("도화지를 모두 지우시겠습니까?")) {
            canvasRef.current?.clear();
          }
        }}
      />

      {/* 3. 드로잉 캔버스 영역 */}
      <div className="flex-1 min-h-[380px] sm:min-h-[440px] flex flex-col">
        <DrawingCanvas
          ref={canvasRef}
          tool={tool}
          color={color}
          brushSize={brushSize}
          onHistoryChange={setHistoryState}
        />
      </div>

      {/* 4. 제출하기 버튼 */}
      <div className="pt-1 pb-4 flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center space-x-2 ${
            isSubmitting
              ? "bg-slate-400 text-white cursor-wait"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white shadow-emerald-200"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>선생님 화면으로 전송 중...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{lastSubmittedAt ? `[${studentName}] 작품 수정하여 다시 제출` : `[${studentName || "내 이름"}] 작품 제출하기`}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
