export interface Member {
  id: string;
  name: string;
  role: string;       // 찬양인도, 건반, 기타, 베이스, 드럼, 보컬, 음향 등
  avatar?: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  title: string;      // "주일 1부 예배", "수요 예배" 등
  date: string;
  time: string;
  members: Member[];
  status: 'confirmed' | 'pending' | 'cancelled';
}

// 파트별 역할 정의
export type PartRole = '예배인도' | '기타' | '건반' | '일렉' | '베이스' | '드럼' | '싱어' | '음향' | 'PPT' | '온라인';

export interface PartCandidate {
  memberId: string;
  name: string;
  color: string;
  unavailableDates: string[]; // 불가 날짜 목록
}

export interface PartPool {
  role: PartRole;
  candidates: PartCandidate[];
}

// 월간 스케줄 한 행 (날짜별 배정)
export interface MonthlyScheduleRow {
  date: string;
  dayLabel: string;       // "1일 (수)", "5일 (일)" 등
  note?: string;          // "부활절", "성 금요일" 등
  services: ServiceAssignment[];
}

export interface ServiceAssignment {
  serviceLabel?: string;  // "1부", "2부" (주일만)
  slots: { role: PartRole; members: string[] }[];
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'day' | 'part' | 'general' | 'worship';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  memberCount: number;
  avatar?: string;
}

export interface SheetMusic {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm?: number;
  tags: string[];
  addedAt: string;
  usedCount: number;
}

// 실시간 악보 협업방
export interface MusicRoom {
  id: string;
  name: string;
  date: string;         // 예배 날짜 (YYYY-MM-DD)
  songTitle: string;
  songArtist: string;
  key: string;
  activeUsers: { name: string; color: string }[];
  pageCount: number;
  currentPage: number;
  hasAnnotations: boolean;
  songForm: string[];
  isClosed: boolean;    // 종료된 방
  createdBy: string;
  lastActivity: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  memberColor: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}
