import React from "react";
import { 
  Pencil, 
  Highlighter, 
  Eraser, 
  Undo2, 
  Redo2, 
  Trash2, 
  Palette 
} from "lucide-react";

export const PRESET_COLORS = [
  "#000000", // 검정
  "#ef4444", // 빨강
  "#f97316", // 주황
  "#eab308", // 노랑
  "#22c55e", // 초록
  "#14b8a6", // 청록
  "#3b82f6", // 파랑
  "#8b5cf6", // 보라
  "#ec4899", // 핑크
  "#78350f", // 갈색
  "#64748b", // 회색
  "#ffffff", // 흰색
];

export const BRUSH_SIZES = [
  { label: "얇게", size: 3 },
  { label: "보통", size: 8 },
  { label: "굵게", size: 16 },
  { label: "아주 굵게", size: 28 },
];

export default function ToolBar({
  tool,
  setTool,
  color,
  setColor,
  brushSize,
  setBrushSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
}) {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-md space-y-3">
      {/* 1. 도구 선택 & 실행 취소 / 다시 실행 / 전체 지우기 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* 드로잉 도구 (펜, 형광펜, 지우개) */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tool === "pen"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span>펜</span>
          </button>

          <button
            type="button"
            onClick={() => setTool("highlighter")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tool === "highlighter"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Highlighter className="w-4 h-4" />
            <span>형광펜</span>
          </button>

          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tool === "eraser"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>지우개</span>
          </button>
        </div>

        {/* 굵기 선택 */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.size}
              type="button"
              onClick={() => setBrushSize(b.size)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                brushSize === b.size
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* 실행 취소, 다시 실행, 비우기 */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-xl border transition ${
              canUndo
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                : "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
            }`}
            title="실행 취소 (되돌리기)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-xl border transition ${
              canRedo
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                : "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
            }`}
            title="다시 실행"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
            title="전체 지우기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 색상 팔레트 */}
      {tool !== "eraser" && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center">
            <Palette className="w-3.5 h-3.5 mr-1" /> 색상:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full border transition transform active:scale-90 ${
                  color === c
                    ? "ring-2 ring-emerald-500 ring-offset-2 scale-110 shadow-sm border-slate-400"
                    : "border-slate-300 hover:scale-105"
                }`}
                title={c}
              />
            ))}

            {/* 커스텀 컬러 피커 */}
            <div className="relative flex items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                title="직접 색상 고르기"
              />
              <div 
                className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center bg-gradient-to-tr from-rose-400 via-emerald-400 to-sky-400 text-white shadow-xs"
                title="무지개 색상 선택"
              >
                +
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
