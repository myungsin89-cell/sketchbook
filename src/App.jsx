import React, { useState } from "react";
import EntryHome from "./components/common/EntryHome";
import Header from "./components/common/Header";
import StudentView from "./components/student/StudentView";
import TeacherDashboard from "./components/teacher/TeacherDashboard";

export default function App() {
  const [currentMode, setCurrentMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (modeParam === "student" || modeParam === "teacher") {
        return modeParam;
      }
    } catch (e) {}
    return "home";
  });

  const [roomId, setRoomId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("room") || "default-class";
    } catch (e) {
      return "default-class";
    }
  });

  const handleSetMode = (mode) => {
    setCurrentMode(mode);
    try {
      const url = new URL(window.location.href);
      if (mode === "home") {
        url.searchParams.delete("mode");
      } else {
        url.searchParams.set("mode", mode);
      }
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* 1. 홈 화면 (역할 선택) */}
      {currentMode === "home" && (
        <EntryHome
          onSelectRole={(role) => handleSetMode(role)}
        />
      )}

      {/* 2. 학생 화면 */}
      {currentMode === "student" && (
        <>
          <Header
            currentMode={currentMode}
            setCurrentMode={handleSetMode}
          />
          <main className="flex-1 w-full">
            <StudentView roomId={roomId} />
          </main>
        </>
      )}

      {/* 3. 선생님 화면 */}
      {currentMode === "teacher" && (
        <TeacherDashboard 
          roomId={roomId} 
          onSwitchToHome={() => handleSetMode("home")}
          onSwitchToStudent={() => handleSetMode("student")}
        />
      )}
    </div>
  );
}
