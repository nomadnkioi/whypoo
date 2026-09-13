import React from 'react';
import { getPoopType } from '../constants/poopTypes';
import { X } from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * 특정 날짜 상세 기록 모달
 */
export default function DayDetailModal({
  isOpen,
  onClose,
  selectedDay,
  records = [],
  onDeleteRecord,
  onAddRecordForDay,
}) {
  if (!isOpen || !selectedDay) return null;

  const formattedDate = `${MONTH_NAMES[selectedDay.monthNum - 1]} ${selectedDay.dayNum}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{formattedDate}</h3>
          <button className="close-btn-clean" onClick={onClose}>
            <X size={20} color="#18181B" />
          </button>
        </div>

        <div className="modal-body">
          {records.length === 0 ? (
            <div className="empty-records">
              <p className="empty-records-text">not yet.</p>
            </div>
          ) : (
            <div className="record-list">
              {records.map((rec, idx) => {
                const info = getPoopType(rec.type);
                return (
                  <div key={rec.id || idx} className="record-item">
                    <div className="record-item-left">
                      <span
                        className="record-color-badge"
                        style={{ backgroundColor: info.color }}
                      />
                      <div className="record-text-group">
                        <span className="record-type-name">{info.label}</span>
                        {rec.timestamp && (
                          <span className="record-time">{rec.timestamp}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="delete-record-btn-clean"
                      onClick={() => onDeleteRecord(selectedDay.dateKey, idx)}
                      title="삭제"
                    >
                      <X size={16} color="#18181B" strokeWidth={2.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 우측 배치 ADD 순수 텍스트 버튼 */}
        <div className="modal-footer-right">
          <button
            className="add-record-text-btn"
            onClick={() => {
              onClose();
              onAddRecordForDay(selectedDay);
            }}
            title="기록 추가"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
