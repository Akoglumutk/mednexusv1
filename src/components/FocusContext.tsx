"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

type FocusContextType = {
  seconds: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTime: () => string;
};

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Sayaç Mantığı (Uygulamanın kalbinde atar)
  useEffect(() => {
    // YENİ: Tip güvenliği sağlandı
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setSeconds(0); };
  
  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return hrs === "00" ? `${mins}:${secs}` : `${hrs}:${mins}:${secs}`;
  };

  return (
    <FocusContext.Provider value={{ seconds, isActive, toggleTimer, resetTimer, formatTime }}>
      {children}
    </FocusContext.Provider>
  );
}

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) throw new Error('useFocus must be used within a FocusProvider');
  return context;
};