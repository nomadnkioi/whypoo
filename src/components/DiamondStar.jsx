import React, { useId } from 'react';
import { getPoopType } from '../constants/poopTypes';

/**
 * 4각 다이아몬드/스파클 별 모양 아이콘 (살짝 부드럽고 덜 뾰족한 곡선 다이아몬드)
 */
export default function DiamondStar({
  records = [],
  isToday = false,
  onClick,
  size = 34,
  dateStr = '',
}) {
  const gradientId = useId();

  // 기존 날카로운 Q 50 50 곡선 대신, 살짝 덜 뾰족하고 부드럽고 도톰한 곡선 컨트롤 포인트 적용
  // ViewBox: 0 0 100 100
  const starPath = "M 50 6 Q 50 38 94 50 Q 62 50 50 94 Q 50 62 6 50 Q 38 50 50 6 Z";

  const recordColors = records.map((r) => getPoopType(r.type).color);

  // 채우기 방법 결정 (미기록 시 연한 회색 #E0E0E0)
  let fillValue = '#E0E0E0';

  if (recordColors.length === 1) {
    fillValue = recordColors[0];
  } else if (recordColors.length > 1) {
    fillValue = `url(#${gradientId})`;
  }

  // 1/N 등분 vertical gradient stop 계산
  const renderGradientStops = () => {
    if (recordColors.length <= 1) return null;
    const n = recordColors.length;
    const step = 100 / n;

    const stops = [];
    recordColors.forEach((color, i) => {
      const startPercent = i * step;
      const endPercent = (i + 1) * step;
      stops.push(
        <stop key={`${i}-start`} offset={`${startPercent}%`} stopColor={color} />,
        <stop key={`${i}-end`} offset={`${endPercent}%`} stopColor={color} />
      );
    });
    return stops;
  };

  return (
    <div
      onClick={onClick}
      className={`diamond-star-wrapper ${isToday ? 'is-today' : ''}`}
      style={{
        width: size,
        height: size,
        cursor: 'pointer',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      title={`${dateStr} ${records.length > 0 ? `(${records.length}건 기록)` : '(기록 없음)'}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {recordColors.length > 1 && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              {renderGradientStops()}
            </linearGradient>
          )}
        </defs>

        {/* 순수 미니멀 부드러운 다이아몬드 별 (테두리 stroke="none") */}
        <path
          d={starPath}
          fill={fillValue}
          stroke="none"
          className="star-path"
        />
      </svg>
    </div>
  );
}
