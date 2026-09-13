import React, { useState, useEffect } from 'react';
import CalendarGrid from './components/CalendarGrid';
import PoopSelectModal from './components/PoopSelectModal';
import DayDetailModal from './components/DayDetailModal';
import {
  initSilentCloudAuth,
  subscribeAuth,
  syncRecordsToCloud,
  subscribeCloudRecords,
} from './firebase';
import './index.css';

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function App() {
  const [todayStr] = useState(getTodayStr());
  const [user, setUser] = useState(null);

  const [recordsByDate, setRecordsByDate] = useState(() => {
    try {
      const saved = localStorage.getItem('whypoo_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('로컬스토리지 로드 실패:', e);
    }
    return {};
  });

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [targetDateKey, setTargetDateKey] = useState(getTodayStr());
  const [targetDateLabel, setTargetDateLabel] = useState('오늘');
  const [targetDayNum, setTargetDayNum] = useState(new Date().getDate());

  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  // 무자각 백그라운드 인증 초기화 및 동기화
  useEffect(() => {
    initSilentCloudAuth();
    const unsubscribe = subscribeAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 클라우드 실시간 자동 수신
  useEffect(() => {
    if (!user) return;
    const unsubscribeCloud = subscribeCloudRecords(user.uid, (cloudRecords) => {
      if (cloudRecords) {
        setRecordsByDate(cloudRecords);
      }
    });
    return () => unsubscribeCloud();
  }, [user]);

  // 로컬스토리지 및 백그라운드 클라우드 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem('whypoo_records', JSON.stringify(recordsByDate));
    } catch (e) {
      console.error('로컬스토리지 저장 실패:', e);
    }

    if (user) {
      syncRecordsToCloud(user.uid, recordsByDate);
    }
  }, [recordsByDate, user]);

  const handleAddRecord = (poopTypeId, dateKey = targetDateKey) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: poopTypeId,
      timestamp: timeStr,
    };

    setRecordsByDate((prev) => {
      const currentList = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: [...currentList, newRecord],
      };
    });
  };

  const handleDeleteRecord = (dateKey, indexToDelete) => {
    setRecordsByDate((prev) => {
      const currentList = prev[dateKey] || [];
      const updated = currentList.filter((_, idx) => idx !== indexToDelete);
      const nextState = { ...prev };
      if (updated.length === 0) {
        delete nextState[dateKey];
      } else {
        nextState[dateKey] = updated;
      }
      return nextState;
    });
  };

  const handleSelectDate = (dayInfo) => {
    setSelectedDayDetail(dayInfo);
  };

  const handleOpenAddForToday = () => {
    setTargetDateKey(todayStr);
    setTargetDateLabel('오늘');
    setTargetDayNum(new Date().getDate());
    setIsSelectModalOpen(true);
  };

  const handleOpenAddForDay = (dayInfo) => {
    setTargetDateKey(dayInfo.dateKey);
    setTargetDateLabel(
      `${dayInfo.monthNum}월 ${dayInfo.dayNum}일(${dayInfo.dayOfWeek})`
    );
    setTargetDayNum(dayInfo.dayNum);
    setIsSelectModalOpen(true);
  };

  return (
    <div className="app-viewport">
      {/* iPhone 15 Pro 전용 상단 스테이터스 바 & 다이나믹 아일랜드 (로그인 버튼 없이 완전 깔끔) */}
      <div className="status-bar-mock">
        <span className="status-time">9:41</span>
        <div className="dynamic-island-pill" />
        <span className="status-icons">5G 🔋</span>
      </div>

      {/* 메인 콘텐츠 스크롤 영역 */}
      <div className="app-content">
        <CalendarGrid
          recordsByDate={recordsByDate}
          todayStr={todayStr}
          onSelectDate={handleSelectDate}
        />
      </div>

      {/* 하단 컨트롤 영역 (우측 끝 ADD 텍스트 버튼만 배치) */}
      <div className="bottom-floating-bar">
        <button
          className="fab-add-btn"
          onClick={handleOpenAddForToday}
          title="오늘 배변 기록 추가"
        >
          ADD
        </button>
      </div>

      {/* iPhone 하단 홈 인디케이터 바 */}
      <div className="home-indicator-bar" />

      {/* 배변 선택 모달 */}
      <PoopSelectModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSelect={(poopTypeId) => handleAddRecord(poopTypeId, targetDateKey)}
        targetDateLabel={targetDateLabel}
        targetDayNum={targetDayNum}
      />

      {/* 특정 날짜 상세 보기 모달 */}
      <DayDetailModal
        isOpen={Boolean(selectedDayDetail)}
        onClose={() => setSelectedDayDetail(null)}
        selectedDay={selectedDayDetail}
        records={
          selectedDayDetail ? recordsByDate[selectedDayDetail.dateKey] || [] : []
        }
        onDeleteRecord={handleDeleteRecord}
        onAddRecordForDay={handleOpenAddForDay}
      />
    </div>
  );
}
