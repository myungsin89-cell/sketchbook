import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, User, Tablet, UserPlus } from "lucide-react";
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      alert("학생 이름을 먼저 입력해주세요!");
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

  const handleSwitchToNextStudent = () => {
    if (window.confirm("다음 친구가 그릴 수 있도록 이름과 도화지를 비우시겠습니까?\n(방금 제출한 작품은 선생님 화면에 안전하게 저장되어 있습니다)")) {
      setStudentName("");
      setLastSubmittedAt(null);
      setSubmitSuccess(false);
      canvasRef.current?.clear();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-col gap-2.5 h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* 1. 상단 정보 입력 바 */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
          {/* 태블릿 번호 선택 */}
          <div className="relative flex items-center">
            <div className="absolute left-2.5 text-slate-500 pointer-events-none flex items-center space-x-1">
              <Tablet className="w-4 h-4" />
            </div>
            <select
              value={tabletNumber}
              onChange={(e) => {
                setTabletNumber(e.target.value);
                setLastSubmittedAt(null);
              }}
              className="pl-8 pr-6 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer hover:bg-slate-200 transition"
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* 오른쪽: 제출 상태 / 다음 친구 교대 */}
        <div className="flex items-center space-x-2 shrink-0">
          {lastSubmittedAt ? (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>제출 완료 ({lastSubmittedAt})</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSwitchToNextStudent}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 border border-slate-200"
            title="다른 친구가 이 태블릿으로 그릴 때 눌러주세요"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
            <span>다음 학생 교대</span>
          </button>
        </div>
      </div>

      {/* 제출 완료 토스트 알림 */}
      {submitSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-bold animate-fadeIn shrink-0">
          <span>[{tabletNumber}번 태블릿] {studentName} 학생의 작품이 성공적으로 제출되었습니다.</span>
          <button
            onClick={handleSwitchToNextStudent}
            className="px-2.5 py-0.5 bg-white text-emerald-800 rounded-lg text-xs font-black shadow-xs hover:bg-emerald-50 transition"
          >
            다음 학생 교대 →
          </button>
        </div>
      )}

      {/* 2. 도구 툴바 (상단에 제출하기 버튼 내장) */}
      <div className="shrink-0">
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          lastSubmittedAt={lastSubmittedAt}
        />
      </div>

      {/* 3. 드로잉 캔버스 영역 (화면 전체 꽉 차게 확장, 스크롤 불필요) */}
      <div className="flex-1 w-full min-h-0 relative pb-1">
        <DrawingCanvas
          ref={canvasRef}
          tool={tool}
          color={color}
          brushSize={brushSize}
          onHistoryChange={setHistoryState}
        />
      </div>
    </div>
  );
}
