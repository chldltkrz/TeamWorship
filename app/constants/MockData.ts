import { Member, ScheduleItem, ChatRoom, SheetMusic, AttendanceRecord } from './Types';
import { Brand } from './Colors';

export const members: Member[] = [
  { id: '1', name: '김지영', role: '찬양인도', color: Brand.primary },
  { id: '2', name: '이하은', role: '보컬', color: Brand.pink },
  { id: '3', name: '박성호', role: '건반', color: Brand.accent },
  { id: '4', name: '최민수', role: '기타', color: Brand.orange },
  { id: '5', name: '정유진', role: '드럼', color: '#E84393' },
  { id: '6', name: '한세준', role: '베이스', color: '#0984E3' },
  { id: '7', name: '송예린', role: '보컬', color: '#FD79A8' },
  { id: '8', name: '윤태호', role: '음향', color: '#00B894' },
];

export const schedules: ScheduleItem[] = [
  {
    id: '1',
    title: '주일 1부 예배',
    date: '2026-04-05',
    time: '09:00',
    members: [members[0], members[2], members[3], members[4]],
    status: 'confirmed',
  },
  {
    id: '2',
    title: '주일 2부 예배',
    date: '2026-04-05',
    time: '11:00',
    members: [members[1], members[2], members[5], members[7]],
    status: 'confirmed',
  },
  {
    id: '3',
    title: '주일 3부 예배',
    date: '2026-04-05',
    time: '14:00',
    members: [members[0], members[6], members[3], members[4]],
    status: 'pending',
  },
  {
    id: '4',
    title: '수요 예배',
    date: '2026-04-08',
    time: '19:30',
    members: [members[1], members[3], members[5]],
    status: 'confirmed',
  },
  {
    id: '5',
    title: '금요 기도회',
    date: '2026-04-10',
    time: '20:00',
    members: [members[0], members[2]],
    status: 'pending',
  },
  {
    id: '6',
    title: '토요 리허설',
    date: '2026-04-11',
    time: '15:00',
    members: [members[0], members[1], members[2], members[3], members[4], members[5]],
    status: 'confirmed',
  },
];

export const chatRooms: ChatRoom[] = [
  {
    id: '1',
    name: '주일팀 전체',
    type: 'general',
    lastMessage: '이번 주 셋리스트 확인해주세요!',
    lastMessageTime: '오후 3:24',
    unreadCount: 5,
    memberCount: 8,
  },
  {
    id: '2',
    name: '주일 1부',
    type: 'day',
    lastMessage: '리허설 시간 변경됐어요',
    lastMessageTime: '오후 1:10',
    unreadCount: 2,
    memberCount: 4,
  },
  {
    id: '3',
    name: '주일 2부',
    type: 'day',
    lastMessage: '악보 업로드했습니다',
    lastMessageTime: '오전 11:32',
    unreadCount: 0,
    memberCount: 4,
  },
  {
    id: '4',
    name: '보컬팀',
    type: 'part',
    lastMessage: '화음 파트 나눠봤어요',
    lastMessageTime: '어제',
    unreadCount: 0,
    memberCount: 3,
  },
  {
    id: '5',
    name: '밴드팀',
    type: 'part',
    lastMessage: '드럼 리듬 패턴 공유합니다',
    lastMessageTime: '어제',
    unreadCount: 3,
    memberCount: 4,
  },
  {
    id: '6',
    name: '수요 예배팀',
    type: 'day',
    lastMessage: '이번주 곡 정했어요',
    lastMessageTime: '월요일',
    unreadCount: 0,
    memberCount: 3,
  },
];

export const sheetMusic: SheetMusic[] = [
  { id: '1', title: '주의 이름 높이며', artist: '마커스', key: 'G', bpm: 72, tags: ['찬양', '느린'], addedAt: '2026-03-28', usedCount: 12 },
  { id: '2', title: '은혜 (Grace)', artist: '나운영', key: 'D', bpm: 68, tags: ['찬양', '느린'], addedAt: '2026-03-25', usedCount: 8 },
  { id: '3', title: '살아계신 주', artist: '어노인팅', key: 'A', bpm: 130, tags: ['찬양', '빠른'], addedAt: '2026-03-20', usedCount: 15 },
  { id: '4', title: '여호와 이레', artist: '마커스', key: 'E', bpm: 78, tags: ['경배', '느린'], addedAt: '2026-03-18', usedCount: 6 },
  { id: '5', title: '주님은 좋은 분', artist: '제이어스', key: 'B', bpm: 120, tags: ['찬양', '빠른'], addedAt: '2026-03-15', usedCount: 20 },
  { id: '6', title: '날 향한 약속', artist: '어노인팅', key: 'C', bpm: 65, tags: ['경배', '느린'], addedAt: '2026-03-10', usedCount: 10 },
  { id: '7', title: '예수 우리 왕이여', artist: 'Hillsong', key: 'G', bpm: 140, tags: ['찬양', '빠른'], addedAt: '2026-03-05', usedCount: 18 },
  { id: '8', title: '하나님의 은혜', artist: '마커스', key: 'F', bpm: 70, tags: ['경배', '느린'], addedAt: '2026-03-01', usedCount: 9 },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: '1', memberId: '1', memberName: '김지영', memberRole: '찬양인도', memberColor: Brand.primary, date: '2026-03-29', status: 'present' },
  { id: '2', memberId: '2', memberName: '이하은', memberRole: '보컬', memberColor: Brand.pink, date: '2026-03-29', status: 'present' },
  { id: '3', memberId: '3', memberName: '박성호', memberRole: '건반', memberColor: Brand.accent, date: '2026-03-29', status: 'late' },
  { id: '4', memberId: '4', memberName: '최민수', memberRole: '기타', memberColor: Brand.orange, date: '2026-03-29', status: 'present' },
  { id: '5', memberId: '5', memberName: '정유진', memberRole: '드럼', memberColor: '#E84393', date: '2026-03-29', status: 'absent' },
  { id: '6', memberId: '6', memberName: '한세준', memberRole: '베이스', memberColor: '#0984E3', date: '2026-03-29', status: 'present' },
  { id: '7', memberId: '7', memberName: '송예린', memberRole: '보컬', memberColor: '#FD79A8', date: '2026-03-29', status: 'excused' },
  { id: '8', memberId: '8', memberName: '윤태호', memberRole: '음향', memberColor: '#00B894', date: '2026-03-29', status: 'present' },
];
