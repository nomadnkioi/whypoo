import React from 'react';
import { POOP_TYPES } from '../constants/poopTypes';

/**
 * 배변 선택 화면/모달 (초미니멀 스타일)
 * @param {number} targetDayNum - 기록할 날짜의 '일' (e.g. 13)
 */
export default function PoopSelectModal({ isOpen, onClose, onSelect, targetDayNum }) {
  if (!isOpen) return null;

  const displayDay = targetDayNum || new Date().getDate();

  return (
    <div className="poop-select-overlay">
      <div className="poop-select-screen">
        {/* 상단 헤더: 오늘 날짜의 '일' 숫자만 표시 (우측 별표 제거) */}
        <div className="select-screen-header">
          <span className="header-number">{displayDay}</span>
        </div>

        {/* 중앙 미니멀 배변 항목 리스트 */}
        <div className="select-list-center">
          <div className="select-list">
            {POOP_TYPES.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className="select-item-btn"
              >
                <span className="item-label">{item.label}</span>
                {/* 글자 바로 우측 끝에 배치되는 작은 동그라미 */}
                <div
                  className="item-color-dot"
                  style={{ backgroundColor: item.color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 하단 back 버튼 */}
        <div className="select-screen-footer">
          <button onClick={onClose} className="back-btn">
            back
          </button>
        </div>
      </div>
    </div>
  );
}
