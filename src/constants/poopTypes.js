export const POOP_TYPES = [
  {
    id: 'healthy',
    label: 'good day',
    color: '#8BBB92', // 초록
  },
  {
    id: 'mild_constipation',
    label: 'a little constipated',
    color: '#F9E8A2', // 주황 (#F9E8A2 은은한 파스텔 버터 옐로우)
  },
  {
    id: 'severe_constipation',
    label: 'constipated',
    color: '#1A1A1A', // 검은색
  },
  {
    id: 'diarrhea',
    label: 'mild diarrhea',
    color: '#8B1E2D', // 빨강
  },
  {
    id: 'rabbit',
    label: 'rabbit droppings',
    color: '#EA9D9D', // 핑크
  },
];

export const getPoopType = (typeId) => {
  return POOP_TYPES.find((t) => t.id === typeId) || {
    id: typeId,
    label: '기록 없음',
    color: '#E2E8F0',
  };
};
