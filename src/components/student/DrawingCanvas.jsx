import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";

const DrawingCanvas = forwardRef(({
  tool = "pen",
  color = "#000000",
  brushSize = 8,
  onHistoryChange,
}, ref) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  // Undo / Redo 스택
  const historyStack = useRef([]);
  const historyIndex = useRef(-1);
  const MAX_HISTORY = 25;

  // 캔버스 초기화
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");

    const initCanvas = () => {
      let backupImage = null;
      if (canvas.width > 0 && canvas.height > 0) {
        backupImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // 캔버스 컨텍스트 설정
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (backupImage) {
        ctx.putImageData(backupImage, 0, 0);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        saveState();
      }
    };

    initCanvas();

    const handleResize = () => {
      // 필요 시 리사이즈
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 상태 저장 (Undo / Redo 용)
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // 현재 인덱스 이후 기록 삭제
    historyStack.current = historyStack.current.slice(0, historyIndex.current + 1);
    
    // 비트맵 복사 저장
    const dpr = window.devicePixelRatio || 1;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyStack.current.push(imageData);

    if (historyStack.current.length > MAX_HISTORY) {
      historyStack.current.shift();
    } else {
      historyIndex.current += 1;
    }

    notifyHistory();
  };

  const notifyHistory = () => {
    if (onHistoryChange) {
      onHistoryChange({
        canUndo: historyIndex.current > 0,
        canRedo: historyIndex.current < historyStack.current.length - 1,
      });
    }
  };

  // 실행 취소 (Undo)
  const handleUndo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = historyStack.current[historyIndex.current];
      ctx.putImageData(imageData, 0, 0);
      notifyHistory();
    }
  };

  // 다시 실행 (Redo)
  const handleRedo = () => {
    if (historyIndex.current < historyStack.current.length - 1) {
      historyIndex.current += 1;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = historyStack.current[historyIndex.current];
      ctx.putImageData(imageData, 0, 0);
      notifyHistory();
    }
  };

  // 전체 지우기 (Clear)
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    saveState();
  };

  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
    clear: handleClear,
    getImageDataURL: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      try {
        return canvas.toDataURL("image/png");
      } catch (e) {
        return canvas.toDataURL();
      }
    }
  }));

  // 상대 좌표 계산
  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 브러시 스타일 설정
  const setupContext = (ctx) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = brushSize * 2.5;
      ctx.globalAlpha = 1.0;
    } else if (tool === "highlighter") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 2.5;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = 1.0;
    }
  };

  // 포인터 다운 (드로잉 시작)
  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {}

    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    isDrawingRef.current = true;
    lastPointRef.current = pos;

    setupContext(ctx);

    // 제자리 점 찍기 지원
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };

  // 포인터 무브 (연속 실선 드로잉)
  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    setupContext(ctx);

    // 고속 펜 터치 이벤트(Coalesced events) 지원으로 끊김 방지
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

    for (const ev of events) {
      const currentPos = getPos(ev);

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      lastPointRef.current = currentPos;
    }
  };

  // 포인터 업 (드로잉 완료)
  const handlePointerUp = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    saveState();
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[400px] bg-white rounded-3xl shadow-sm border-2 border-emerald-100 overflow-hidden touch-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-crosshair block touch-none"
      />
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;
