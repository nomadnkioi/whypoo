import React from 'react';
import DiamondStar from './DiamondStar';
import { POOP_TYPES } from '../constants/poopTypes';

/**
 * 오늘 포함 40일 그리드 달력 (우측 하단 미니 색상 범주 포함)
 */
export default function CalendarGrid({ recordsByDate = {}, todayStr, onSelectDate }) {
  const getPast40Days = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 39; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${date}`;

      days.push({
        dateKey,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
        isToday: dateKey === todayStr,
        fullDate: d,
      });
    }
    return days;
  };

  const daysList = getPast40Days();

  const totalDays = 40;
  const recordedDaysCount = daysList.filter(
    (d) => recordsByDate[d.dateKey] && recordsByDate[d.dateKey].length > 0
  ).length;
  const completionPercentage = Math.round((recordedDaysCount / totalDays) * 100);

  return (
    <div className="calendar-container">
      {/* 상단 통계 헤더 */}
      <div className="stats-header">
        <h2 className="app-title">whypoo</h2>
        <div className="stats-info">
          <p>
            <strong>{totalDays}</strong> days total
          </p>
          <p>
            <strong>{recordedDaysCount}</strong> days recorded
          </p>
          <p className="percentage-text">
            <strong>{completionPercentage}%</strong> of days recorded
          </p>
        </div>
      </div>

      {/* 40일 다이아몬드 별 그리드 */}
      <div className="star-grid-container">
        <div className="star-grid">
          {daysList.map((day) => {
            const records = recordsByDate[day.dateKey] || [];
            return (
              <div key={day.dateKey} className="star-grid-item">
                <DiamondStar
                  records={records}
                  isToday={day.isToday}
                  dateStr={`${day.monthNum}월 ${day.dayNum}일 (${day.dayOfWeek})`}
                  onClick={() => onSelectDate(day)}
                  size={32}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측 아래 미니 색상 범례 (SVG 벡터 라인으로 100% 완벽한 균일 굵기 구현) */}
      <div className="color-legend-container">
        {POOP_TYPES.map((type) => (
          <div key={type.id} className="legend-item">
            <span className="legend-text">{type.label}</span>
            <svg
              width="14"
              height="2"
              style={{ overflow: 'visible', display: 'block', flexShrink: 0 }}
            >
              <line
                x1="0"
                y1="1"
                x2="14"
                y2="1"
                stroke={type.color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
