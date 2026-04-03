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

export interface ChatRoom {
  id: string;
  name: string;
  type: 'day' | 'part' | 'general';
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

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  memberColor: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}
