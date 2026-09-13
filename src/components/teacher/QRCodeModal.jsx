import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, QrCode, ExternalLink } from "lucide-react";

export default function QRCodeModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 학생이 바로 접속할 수 있는 URL (student 모드 파라미터 포함)
  const studentUrl = `${window.location.origin}${window.location.pathname}?mode=student`;

  const handleCopy = () => {
    navigator.clipboard.writeText(studentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col items-center text-center p-6 sm:p-8">
        {/* 닫기 버튼 */}
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 타이틀 */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">학생 태블릿 접속용 QR코드</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          전자칠판에 띄우고 학생들에게 태블릿 기본 카메라로 비추게 하세요.
        </p>

        {/* QR 코드 박스 */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-md inline-block">
          <QRCodeSVG
            value={studentUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* 접속 링크 주소 & 복사 버튼 */}
        <div className="mt-6 w-full flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <input
            type="text"
            readOnly
            value={studentUrl}
            className="bg-transparent text-xs text-slate-600 flex-1 px-2 focus:outline-none font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shrink-0 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>주소 복사</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
        >
          화면 닫기
        </button>
      </div>
    </div>
  );
}
